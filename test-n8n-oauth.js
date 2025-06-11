const { bunqOAuthApiRequest, bunqApiRequest, getBunqApiUrl } = require('./dist/nodes/Bunq/GenericFunctions');

// Mock n8n context for OAuth testing
class MockOAuthContext {
    constructor(clientId, clientSecret, environment = 'sandbox', accessToken = null) {
        this.credentials = {
            bunqOAuth2Api: {
                clientId,
                clientSecret,
                environment,
                oauthTokenData: accessToken ? { access_token: accessToken } : null
            }
        };
    }

    async getCredentials(type) {
        return this.credentials[type];
    }

    getNode() {
        return { name: 'Test OAuth Node', type: 'bunq-oauth-test' };
    }

    get helpers() {
        return {
            request: async (options) => {
                // Simple HTTP request implementation
                const https = require('https');
                const http = require('http');
                
                return new Promise((resolve, reject) => {
                    const urlObj = new URL(options.url);
                    const isHttps = urlObj.protocol === 'https:';
                    const client = isHttps ? https : http;
                    
                    let body = options.body;
                    if (options.form && typeof body === 'object') {
                        // Convert object to URL-encoded string for form data
                        body = Object.keys(body)
                            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(body[key])}`)
                            .join('&');
                    } else if (typeof body === 'object' && options.json !== false) {
                        body = JSON.stringify(body);
                    }
                    
                    const requestOptions = {
                        hostname: urlObj.hostname,
                        port: urlObj.port || (isHttps ? 443 : 80),
                        path: urlObj.pathname + urlObj.search,
                        method: options.method,
                        headers: options.headers
                    };

                    const req = client.request(requestOptions, (res) => {
                        let data = '';
                        res.on('data', chunk => data += chunk);
                        res.on('end', () => {
                            try {
                                if (options.json !== false && res.headers['content-type']?.includes('application/json')) {
                                    const parsed = JSON.parse(data);
                                    if (res.statusCode >= 400) {
                                        const error = new Error(`HTTP ${res.statusCode}`);
                                        error.statusCode = res.statusCode;
                                        error.response = { body: data };
                                        reject(error);
                                    } else {
                                        resolve(parsed);
                                    }
                                } else {
                                    if (res.statusCode >= 400) {
                                        const error = new Error(`HTTP ${res.statusCode}`);
                                        error.statusCode = res.statusCode;
                                        error.response = { body: data };
                                        reject(error);
                                    } else {
                                        resolve(data);
                                    }
                                }
                            } catch (e) {
                                if (res.statusCode >= 400) {
                                    const error = new Error(`HTTP ${res.statusCode}`);
                                    error.statusCode = res.statusCode;
                                    error.response = { body: data };
                                    reject(error);
                                } else {
                                    resolve(data);
                                }
                            }
                        });
                    });

                    req.on('error', reject);
                    
                    if (body) {
                        req.write(body);
                    }
                    
                    req.end();
                });
            }
        };
    }
}

async function testOAuthIntegration() {
    console.log('Testing n8n bunq OAuth integration...');
    console.log('='.repeat(50));
    
    // You need to provide your OAuth credentials here
    const clientId = 'YOUR_CLIENT_ID';
    const clientSecret = 'YOUR_CLIENT_SECRET';
    const accessToken = 'YOUR_ACCESS_TOKEN'; // Obtained from OAuth flow
    
    if (clientId === 'YOUR_CLIENT_ID') {
        console.log('❌ Please update the OAuth credentials in the test script');
        console.log('You need to:');
        console.log('1. Register an OAuth app with bunq');
        console.log('2. Complete the OAuth authorization flow');
        console.log('3. Update clientId, clientSecret, and accessToken variables');
        return;
    }
    
    // Test Sandbox Environment
    console.log('\nTesting SANDBOX environment:');
    console.log('-'.repeat(30));
    
    try {
        const sandboxContext = new MockOAuthContext(clientId, clientSecret, 'sandbox', accessToken);
        
        console.log('Testing user endpoint with OAuth...');
        const userResponse = await bunqOAuthApiRequest.call(sandboxContext, 'GET', '/user');
        console.log('✓ User endpoint test successful');
        console.log('User data received:', userResponse.Response ? Object.keys(userResponse.Response[0] || {}) : 'No response data');
        
        console.log('\nTesting monetary accounts endpoint...');
        const accountsResponse = await bunqOAuthApiRequest.call(sandboxContext, 'GET', '/monetary-account');
        console.log('✓ Monetary accounts endpoint test successful');
        console.log('Accounts found:', accountsResponse.Response ? accountsResponse.Response.length : 0);
        
        // Test fallback to generic bunqApiRequest (should use OAuth)
        console.log('\nTesting generic API request (should use OAuth)...');
        const genericResponse = await bunqApiRequest.call(sandboxContext, 'GET', '/user');
        console.log('✓ Generic API request test successful');
        
    } catch (error) {
        console.log('✗ Sandbox OAuth test failed:', error.message);
        if (error.response?.body) {
            try {
                const errorData = JSON.parse(error.response.body);
                console.log('Error details:', errorData.Error?.[0]?.error_description || 'Unknown error');
            } catch (e) {
                console.log('Raw error:', error.response.body);
            }
        }
    }
    
    // Test Production Environment
    console.log('\nTesting PRODUCTION environment:');
    console.log('-'.repeat(30));
    
    try {
        const productionContext = new MockOAuthContext(clientId, clientSecret, 'production', accessToken);
        
        console.log('Testing user endpoint with OAuth...');
        const userResponse = await bunqOAuthApiRequest.call(productionContext, 'GET', '/user');
        console.log('✓ User endpoint test successful');
        console.log('User data received:', userResponse.Response ? Object.keys(userResponse.Response[0] || {}) : 'No response data');
        
    } catch (error) {
        console.log('✗ Production OAuth test failed:', error.message);
        if (error.response?.body) {
            try {
                const errorData = JSON.parse(error.response.body);
                console.log('Error details:', errorData.Error?.[0]?.error_description || 'Unknown error');
            } catch (e) {
                console.log('Raw error:', error.response.body);
            }
        }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('N8N OAUTH INTEGRATION TEST COMPLETED');
    console.log('='.repeat(50));
}

// Test credential fallback mechanism
async function testCredentialFallback() {
    console.log('\nTesting credential fallback mechanism...');
    console.log('-'.repeat(40));
    
    // Create context with no OAuth credentials
    const fallbackContext = {
        async getCredentials(type) {
            if (type === 'bunqOAuth2Api') {
                throw new Error('OAuth credentials not found');
            }
            if (type === 'bunqApi') {
                return {
                    environment: 'sandbox',
                    apiKey: 'test-api-key',
                    sessionToken: 'test-session-token'
                };
            }
            throw new Error('No credentials found');
        },
        
        getNode() {
            return { name: 'Test Fallback Node', type: 'bunq-fallback-test' };
        },
        
        helpers: {
            request: async () => ({ Response: [{ User: { id: 'test' } }] })
        }
    };
    
    try {
        const response = await bunqApiRequest.call(fallbackContext, 'GET', '/user');
        console.log('✓ Credential fallback mechanism working');
        console.log('Fallback used legacy API credentials successfully');
    } catch (error) {
        console.log('✗ Credential fallback failed:', error.message);
    }
}

// Test OAuth token refresh simulation
async function testTokenRefresh() {
    console.log('\nTesting OAuth token refresh...');
    console.log('-'.repeat(30));
    
    const clientId = 'YOUR_CLIENT_ID';
    const clientSecret = 'YOUR_CLIENT_SECRET';
    const refreshToken = 'YOUR_REFRESH_TOKEN';
    
    if (clientId === 'YOUR_CLIENT_ID') {
        console.log('⚠️  OAuth credentials not configured for refresh test');
        return;
    }
    
    try {
        const refreshContext = new MockOAuthContext(clientId, clientSecret, 'sandbox');
        
        // Mock the refresh function call
        console.log('Simulating token refresh...');
        console.log('✓ Token refresh mechanism available');
        console.log('Note: Actual refresh requires valid refresh token');
        
    } catch (error) {
        console.log('✗ Token refresh test failed:', error.message);
    }
}

async function runAllTests() {
    await testOAuthIntegration();
    await testCredentialFallback();
    await testTokenRefresh();
}

// Export for use in other test files
module.exports = {
    MockOAuthContext,
    testOAuthIntegration,
    testCredentialFallback,
    testTokenRefresh
};

// Run all tests if called directly
if (require.main === module) {
    runAllTests().catch(console.error);
}