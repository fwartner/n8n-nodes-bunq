const https = require('https');
const crypto = require('crypto');
const url = require('url');

// OAuth Configuration - Replace with your actual OAuth app credentials
const OAUTH_CONFIG = {
    sandbox: {
        clientId: 'YOUR_SANDBOX_CLIENT_ID',
        clientSecret: 'YOUR_SANDBOX_CLIENT_SECRET',
        baseUrl: 'https://public-api.sandbox.bunq.com',
        authUrl: 'https://oauth.sandbox.bunq.com',
    },
    production: {
        clientId: 'YOUR_PRODUCTION_CLIENT_ID',
        clientSecret: 'YOUR_PRODUCTION_CLIENT_SECRET',
        baseUrl: 'https://api.bunq.com',
        authUrl: 'https://oauth.bunq.com',
    }
};

const REDIRECT_URI = 'http://localhost:3000/callback';

// Generate request ID
function generateRequestId() {
    return crypto.randomBytes(16).toString('hex');
}

// Make HTTP request
function makeRequest(requestUrl, method, headers = {}, body = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(requestUrl);
        const isHttps = urlObj.protocol === 'https:';
        const client = isHttps ? https : require('http');
        
        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'n8n-bunq-oauth-test/1.0.0',
                ...headers
            }
        };

        const req = client.request(requestOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: parsed
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

        req.on('error', reject);
        
        if (body) {
            req.write(typeof body === 'string' ? body : JSON.stringify(body));
        }
        
        req.end();
    });
}

// Generate OAuth authorization URL
function generateAuthUrl(environment, state) {
    const config = OAUTH_CONFIG[environment];
    const authParams = new URLSearchParams({
        response_type: 'code',
        client_id: config.clientId,
        redirect_uri: REDIRECT_URI,
        scope: 'account_info payments user_info',
        state: state
    });
    
    return `${config.authUrl}/auth?${authParams.toString()}`;
}

// Exchange authorization code for access token
async function exchangeCodeForToken(environment, authCode, state) {
    console.log(`\n=== OAuth Token Exchange for ${environment.toUpperCase()} ===`);
    
    const config = OAUTH_CONFIG[environment];
    
    try {
        const tokenData = new URLSearchParams({
            grant_type: 'authorization_code',
            code: authCode,
            client_id: config.clientId,
            client_secret: config.clientSecret,
            redirect_uri: REDIRECT_URI,
        });

        const response = await makeRequest(
            `${config.baseUrl}/v1/oauth/token`,
            'POST',
            {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            tokenData.toString()
        );
        
        console.log(`Status: ${response.statusCode}`);
        console.log('Response:', JSON.stringify(response.body, null, 2));
        
        if (response.statusCode === 200 && response.body.access_token) {
            console.log('✓ OAuth token exchange successful');
            return response.body;
        } else {
            console.log('✗ OAuth token exchange failed');
            return null;
        }
        
    } catch (error) {
        console.error(`✗ Token exchange failed:`, error.message);
        return null;
    }
}

// Test API endpoints with OAuth token
async function testOAuthEndpoints(environment, accessToken) {
    console.log(`\n=== Testing OAuth API Endpoints for ${environment.toUpperCase()} ===`);
    
    const config = OAUTH_CONFIG[environment];
    
    const endpoints = [
        { path: '/user', method: 'GET', description: 'User Information' },
        { path: '/monetary-account', method: 'GET', description: 'Monetary Accounts' },
        { path: '/payment', method: 'GET', description: 'Payments List' }
    ];
    
    for (const endpoint of endpoints) {
        try {
            console.log(`\nTesting ${endpoint.description}...`);
            
            const response = await makeRequest(
                `${config.baseUrl}/v1${endpoint.path}`,
                endpoint.method,
                {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Bunq-Language': 'en_US',
                    'X-Bunq-Region': 'nl_NL',
                    'X-Bunq-Client-Request-Id': generateRequestId(),
                    'X-Bunq-Geolocation': '0 0 0 0 000',
                    'Cache-Control': 'no-cache',
                }
            );
            
            console.log(`Status: ${response.statusCode}`);
            if (response.statusCode === 200) {
                console.log('✓ Success');
                if (response.body.Response) {
                    console.log(`Response items: ${Array.isArray(response.body.Response) ? response.body.Response.length : 1}`);
                    
                    // Log first item for inspection (without sensitive data)
                    if (Array.isArray(response.body.Response) && response.body.Response.length > 0) {
                        const firstItem = response.body.Response[0];
                        const itemType = Object.keys(firstItem)[0];
                        console.log(`First item type: ${itemType}`);
                        if (firstItem[itemType] && firstItem[itemType].id) {
                            console.log(`First item ID: ${firstItem[itemType].id}`);
                        }
                    }
                }
            } else {
                console.log('✗ Failed:', response.body);
            }
        } catch (error) {
            console.log(`✗ Error testing ${endpoint.description}:`, error.message);
        }
    }
}

// Refresh OAuth token
async function refreshAccessToken(environment, refreshToken) {
    console.log(`\n=== Refreshing OAuth Token for ${environment.toUpperCase()} ===`);
    
    const config = OAUTH_CONFIG[environment];
    
    try {
        const tokenData = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: config.clientId,
            client_secret: config.clientSecret,
        });

        const response = await makeRequest(
            `${config.baseUrl}/v1/oauth/token`,
            'POST',
            {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            tokenData.toString()
        );
        
        console.log(`Status: ${response.statusCode}`);
        console.log('Response:', JSON.stringify(response.body, null, 2));
        
        if (response.statusCode === 200 && response.body.access_token) {
            console.log('✓ Token refresh successful');
            return response.body;
        } else {
            console.log('✗ Token refresh failed');
            return null;
        }
        
    } catch (error) {
        console.error(`✗ Token refresh failed:`, error.message);
        return null;
    }
}

// Main OAuth flow demonstration
async function demonstrateOAuthFlow() {
    console.log('bunq OAuth2 Flow Demonstration');
    console.log('='.repeat(50));
    
    console.log('\n📝 SETUP INSTRUCTIONS:');
    console.log('1. Register your OAuth app in bunq developer portal');
    console.log('2. Set redirect URI to: http://localhost:3000/callback');
    console.log('3. Update OAUTH_CONFIG with your client credentials');
    console.log('4. Start a simple HTTP server to handle the callback');
    
    const state = crypto.randomBytes(16).toString('hex');
    
    console.log('\n🔗 AUTHORIZATION URLS:');
    console.log('\nSandbox Authorization URL:');
    console.log(generateAuthUrl('sandbox', state));
    
    console.log('\nProduction Authorization URL:');
    console.log(generateAuthUrl('production', state));
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Visit one of the URLs above');
    console.log('2. Log in to bunq and authorize your app');
    console.log('3. Extract the authorization code from the callback');
    console.log('4. Use exchangeCodeForToken() with the code');
    console.log('5. Use the access token to test API endpoints');
    
    console.log('\n💻 EXAMPLE USAGE:');
    console.log(`
// After getting authorization code from callback:
const authCode = 'YOUR_AUTH_CODE_FROM_CALLBACK';
const tokenData = await exchangeCodeForToken('sandbox', authCode, '${state}');
if (tokenData) {
    await testOAuthEndpoints('sandbox', tokenData.access_token);
    
    // Later, refresh the token:
    const newTokenData = await refreshAccessToken('sandbox', tokenData.refresh_token);
}
`);
}

// Simple callback server for testing
function startCallbackServer() {
    const http = require('http');
    
    const server = http.createServer((req, res) => {
        const parsedUrl = url.parse(req.url, true);
        
        if (parsedUrl.pathname === '/callback') {
            const { code, state, error } = parsedUrl.query;
            
            res.writeHead(200, { 'Content-Type': 'text/html' });
            
            if (error) {
                res.end(`
                    <h1>Authorization Error</h1>
                    <p>Error: ${error}</p>
                    <p>Description: ${parsedUrl.query.error_description || 'Unknown error'}</p>
                `);
            } else if (code) {
                res.end(`
                    <h1>Authorization Successful!</h1>
                    <p><strong>Authorization Code:</strong> <code>${code}</code></p>
                    <p><strong>State:</strong> <code>${state}</code></p>
                    <p>Copy the authorization code and use it in your test script.</p>
                `);
                
                console.log(`\n✅ Authorization code received: ${code}`);
                console.log(`State: ${state}`);
                console.log('\nYou can now use this code to exchange for an access token.');
            } else {
                res.end(`
                    <h1>Invalid Callback</h1>
                    <p>No authorization code or error received.</p>
                `);
            }
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        }
    });
    
    server.listen(3000, () => {
        console.log('\n🚀 Callback server started on http://localhost:3000');
        console.log('Ready to handle OAuth callbacks...');
    });
    
    return server;
}

// Export functions for use in other scripts
module.exports = {
    generateAuthUrl,
    exchangeCodeForToken,
    testOAuthEndpoints,
    refreshAccessToken,
    startCallbackServer,
    OAUTH_CONFIG
};

// Run demonstration if called directly
if (require.main === module) {
    demonstrateOAuthFlow().catch(console.error);
}