const https = require('https');
const crypto = require('crypto');

// Your API key
const API_KEY = 'ffa874c531258f12f82354fd7b04b32cfcbc2ec338c9190ccc7a4bc60274c1fd';

// Base URLs
const SANDBOX_URL = 'https://public-api.sandbox.bunq.com';
const PRODUCTION_URL = 'https://api.bunq.com';

// Generate request ID
function generateRequestId() {
    return crypto.randomBytes(16).toString('hex');
}

// Generate device ID
function generateDeviceId() {
    return `n8n-bunq-test-${crypto.randomBytes(8).toString('hex')}`;
}

// Generate RSA key pair
function generateKeyPair() {
    return crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem',
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
        },
    });
}

// Create request signature
function createRequestSignature(method, uri, headers, body, privateKey) {
    const headersString = Object.keys(headers)
        .sort()
        .map(key => `${key}: ${headers[key]}`)
        .join('\n');

    const stringToSign = `${method}\n${uri}\n${headersString}\n\n${body}`;
    
    const sign = crypto.createSign('SHA256');
    sign.update(stringToSign);
    return sign.sign(privateKey, 'base64');
}

// Make HTTP request with optional signing
function makeRequest(url, method, headers = {}, body = null, privateKey = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const bodyString = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : '';
        
        const defaultHeaders = {
            'Content-Type': 'application/json',
            'X-Bunq-Language': 'en_US',
            'X-Bunq-Region': 'nl_NL',
            'X-Bunq-Client-Request-Id': generateRequestId(),
            'X-Bunq-Geolocation': '0 0 0 0 000',
            'User-Agent': 'n8n-bunq-test/1.0.0',
            'Cache-Control': 'no-cache',
            ...headers
        };

        // Add signature if private key is provided and not installation endpoint
        if (privateKey && !url.includes('/installation')) {
            const signature = createRequestSignature(
                method.toUpperCase(),
                urlObj.pathname,
                defaultHeaders,
                bodyString,
                privateKey
            );
            defaultHeaders['X-Bunq-Client-Signature'] = signature;
        }

        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || 443,
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: defaultHeaders
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: jsonData
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: data
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (bodyString) {
            req.write(bodyString);
        }
        req.end();
    });
}

// Complete authentication flow
async function authenticateWithBunq(baseUrl) {
    const envName = baseUrl.includes('sandbox') ? 'SANDBOX' : 'PRODUCTION';
    console.log(`\n=== Complete Authentication Flow for ${envName} ===`);
    
    try {
        // Step 1: Generate key pair
        const keyPair = generateKeyPair();
        console.log('✓ Generated RSA key pair');
        
        // Step 2: Installation
        console.log('\n1. Installation...');
        const installationResponse = await makeRequest(
            `${baseUrl}/v1/installation`,
            'POST',
            {},
            { client_public_key: keyPair.publicKey }
        );
        
        if (installationResponse.statusCode !== 200) {
            console.log('✗ Installation failed:', installationResponse.body);
            return null;
        }
        
        const installationToken = installationResponse.body.Response[1]?.Token?.token;
        console.log('✓ Installation successful, token received');
        
        // Step 3: Device registration
        console.log('\n2. Device Registration...');
        const deviceId = generateDeviceId();
        const deviceResponse = await makeRequest(
            `${baseUrl}/v1/device-server`,
            'POST',
            { 'X-Bunq-Client-Authentication': installationToken },
            {
                description: deviceId,
                secret: API_KEY
            },
            keyPair.privateKey
        );
        
        if (deviceResponse.statusCode !== 200) {
            console.log('✗ Device registration failed:', deviceResponse.body);
            return null;
        }
        
        console.log('✓ Device registered successfully');
        
        // Step 4: Session creation
        console.log('\n3. Session Creation...');
        const sessionResponse = await makeRequest(
            `${baseUrl}/v1/session-server`,
            'POST',
            { 'X-Bunq-Client-Authentication': installationToken },
            { secret: API_KEY },
            keyPair.privateKey
        );
        
        if (sessionResponse.statusCode !== 200) {
            console.log('✗ Session creation failed:', sessionResponse.body);
            return null;
        }
        
        const sessionToken = sessionResponse.body.Response[1]?.Token?.token;
        console.log('✓ Session created successfully');
        
        return {
            installationToken,
            sessionToken,
            privateKey: keyPair.privateKey,
            publicKey: keyPair.publicKey,
            deviceId
        };
        
    } catch (error) {
        console.error(`✗ Authentication failed for ${envName}:`, error.message);
        return null;
    }
}

// Test various endpoints
async function testEndpoints(baseUrl, credentials) {
    const envName = baseUrl.includes('sandbox') ? 'SANDBOX' : 'PRODUCTION';
    console.log(`\n=== Testing Endpoints for ${envName} ===`);
    
    const endpoints = [
        { path: '/user', method: 'GET', description: 'User Information' },
        { path: '/monetary-account', method: 'GET', description: 'Monetary Accounts' },
        { path: '/payment', method: 'GET', description: 'Payments List' }
    ];
    
    for (const endpoint of endpoints) {
        try {
            console.log(`\nTesting ${endpoint.description}...`);
            const response = await makeRequest(
                `${baseUrl}/v1${endpoint.path}`,
                endpoint.method,
                { 'X-Bunq-Client-Authentication': credentials.sessionToken },
                null,
                credentials.privateKey
            );
            
            console.log(`Status: ${response.statusCode}`);
            if (response.statusCode === 200) {
                console.log('✓ Success');
                if (response.body.Response) {
                    console.log(`Response items: ${Array.isArray(response.body.Response) ? response.body.Response.length : 1}`);
                }
            } else {
                console.log('✗ Failed:', response.body);
            }
        } catch (error) {
            console.log(`✗ Error testing ${endpoint.description}:`, error.message);
        }
    }
}

// Main test function
async function runCompleteTests() {
    console.log('Starting comprehensive bunq API tests...');
    console.log(`API Key: ${API_KEY.substring(0, 20)}...`);
    
    // Test Sandbox
    console.log('\n' + '='.repeat(60));
    console.log('SANDBOX ENVIRONMENT TESTING');
    console.log('='.repeat(60));
    
    const sandboxCredentials = await authenticateWithBunq(SANDBOX_URL);
    if (sandboxCredentials) {
        await testEndpoints(SANDBOX_URL, sandboxCredentials);
    }
    
    // Test Production
    console.log('\n' + '='.repeat(60));
    console.log('PRODUCTION ENVIRONMENT TESTING');
    console.log('='.repeat(60));
    
    const productionCredentials = await authenticateWithBunq(PRODUCTION_URL);
    if (productionCredentials) {
        await testEndpoints(PRODUCTION_URL, productionCredentials);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('ALL TESTS COMPLETED');
    console.log('='.repeat(60));
}

// Run the tests
runCompleteTests().catch(console.error);