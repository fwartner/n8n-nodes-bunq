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

// Make HTTP request
function makeRequest(url, method, headers = {}, body = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || 443,
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-Bunq-Language': 'en_US',
                'X-Bunq-Region': 'nl_NL',
                'X-Bunq-Client-Request-Id': generateRequestId(),
                'X-Bunq-Geolocation': '0 0 0 0 000',
                'User-Agent': 'n8n-bunq-test/1.0.0',
                'Cache-Control': 'no-cache',
                ...headers
            }
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

        if (body) {
            req.write(typeof body === 'string' ? body : JSON.stringify(body));
        }
        req.end();
    });
}

// Test installation endpoint
async function testInstallation(baseUrl) {
    console.log(`\n=== Testing Installation on ${baseUrl.includes('sandbox') ? 'SANDBOX' : 'PRODUCTION'} ===`);
    
    try {
        const keyPair = generateKeyPair();
        console.log('Generated RSA key pair');
        
        const response = await makeRequest(
            `${baseUrl}/v1/installation`,
            'POST',
            {},
            {
                client_public_key: keyPair.publicKey
            }
        );
        
        console.log(`Status: ${response.statusCode}`);
        console.log('Response:', JSON.stringify(response.body, null, 2));
        
        if (response.statusCode === 200 && response.body.Response) {
            const installationToken = response.body.Response[1]?.Token?.token;
            console.log(`Installation Token: ${installationToken ? 'Generated successfully' : 'Not found'}`);
            
            return {
                installationToken,
                privateKey: keyPair.privateKey,
                publicKey: keyPair.publicKey
            };
        }
        
        return null;
    } catch (error) {
        console.error('Installation failed:', error.message);
        return null;
    }
}

// Test device registration
async function testDeviceRegistration(baseUrl, installationToken, privateKey) {
    console.log('\n=== Testing Device Registration ===');
    
    try {
        const deviceId = generateDeviceId();
        console.log(`Generated Device ID: ${deviceId}`);
        
        const response = await makeRequest(
            `${baseUrl}/v1/device-server`,
            'POST',
            {
                'X-Bunq-Client-Authentication': installationToken
            },
            {
                description: deviceId,
                secret: API_KEY
            }
        );
        
        console.log(`Status: ${response.statusCode}`);
        console.log('Response:', JSON.stringify(response.body, null, 2));
        
        return response.statusCode === 200;
    } catch (error) {
        console.error('Device registration failed:', error.message);
        return false;
    }
}

// Test session creation
async function testSessionCreation(baseUrl, installationToken) {
    console.log('\n=== Testing Session Creation ===');
    
    try {
        const response = await makeRequest(
            `${baseUrl}/v1/session-server`,
            'POST',
            {
                'X-Bunq-Client-Authentication': installationToken
            },
            {
                secret: API_KEY
            }
        );
        
        console.log(`Status: ${response.statusCode}`);
        console.log('Response:', JSON.stringify(response.body, null, 2));
        
        if (response.statusCode === 200 && response.body.Response) {
            const sessionToken = response.body.Response[1]?.Token?.token;
            console.log(`Session Token: ${sessionToken ? 'Generated successfully' : 'Not found'}`);
            return sessionToken;
        }
        
        return null;
    } catch (error) {
        console.error('Session creation failed:', error.message);
        return null;
    }
}

// Test user endpoint
async function testUserEndpoint(baseUrl, sessionToken) {
    console.log('\n=== Testing User Endpoint ===');
    
    try {
        const response = await makeRequest(
            `${baseUrl}/v1/user`,
            'GET',
            {
                'X-Bunq-Client-Authentication': sessionToken
            }
        );
        
        console.log(`Status: ${response.statusCode}`);
        console.log('Response:', JSON.stringify(response.body, null, 2));
        
        return response.statusCode === 200;
    } catch (error) {
        console.error('User endpoint test failed:', error.message);
        return false;
    }
}

// Main test function
async function runTests() {
    console.log('Starting bunq API tests...');
    console.log(`API Key: ${API_KEY.substring(0, 20)}...`);
    
    // Test Sandbox
    console.log('\n' + '='.repeat(50));
    console.log('TESTING SANDBOX ENVIRONMENT');
    console.log('='.repeat(50));
    
    const sandboxInstallation = await testInstallation(SANDBOX_URL);
    if (sandboxInstallation) {
        const deviceRegistered = await testDeviceRegistration(
            SANDBOX_URL, 
            sandboxInstallation.installationToken, 
            sandboxInstallation.privateKey
        );
        
        if (deviceRegistered) {
            const sessionToken = await testSessionCreation(SANDBOX_URL, sandboxInstallation.installationToken);
            if (sessionToken) {
                await testUserEndpoint(SANDBOX_URL, sessionToken);
            }
        }
    }
    
    // Test Production
    console.log('\n' + '='.repeat(50));
    console.log('TESTING PRODUCTION ENVIRONMENT');
    console.log('='.repeat(50));
    
    const productionInstallation = await testInstallation(PRODUCTION_URL);
    if (productionInstallation) {
        const deviceRegistered = await testDeviceRegistration(
            PRODUCTION_URL, 
            productionInstallation.installationToken, 
            productionInstallation.privateKey
        );
        
        if (deviceRegistered) {
            const sessionToken = await testSessionCreation(PRODUCTION_URL, productionInstallation.installationToken);
            if (sessionToken) {
                await testUserEndpoint(PRODUCTION_URL, sessionToken);
            }
        }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('TESTS COMPLETED');
    console.log('='.repeat(50));
}

// Run the tests
runTests().catch(console.error);