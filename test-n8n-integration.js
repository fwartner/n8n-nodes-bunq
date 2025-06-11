const { initializeBunqSession, bunqApiRequest, getBunqApiUrl } = require('./dist/nodes/Bunq/GenericFunctions');

// Mock n8n context for testing
class MockContext {
    constructor(apiKey, environment = 'production') {
        this.credentials = {
            bunqApi: {
                apiKey,
                environment,
                installationToken: '',
                deviceId: '',
                sessionToken: '',
                privateKey: '',
                publicKey: ''
            }
        };
    }

    async getCredentials(type) {
        return this.credentials[type];
    }

    getNode() {
        return { name: 'Test Node', type: 'bunq-test' };
    }

    get helpers() {
        return {
            request: async(options) => {
                // Simple HTTP request implementation
                const https = require('https');
                const http = require('http');

                return new Promise((resolve, reject) => {
                    const urlObj = new URL(options.url);
                    const isHttps = urlObj.protocol === 'https:';
                    const client = isHttps ? https : http;

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
                                const parsed = JSON.parse(data);
                                if (res.statusCode >= 400) {
                                    const error = new Error(`HTTP ${res.statusCode}`);
                                    error.statusCode = res.statusCode;
                                    error.response = { body: data };
                                    reject(error);
                                } else {
                                    resolve(parsed);
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

                    if (options.body) {
                        req.write(options.body);
                    }

                    req.end();
                });
            }
        };
    }
}

async function testN8nIntegration() {
    console.log('Testing n8n bunq integration...');
    console.log('='.repeat(50));

    const apiKey = 'ffa874c531258f12f82354fd7b04b32cfcbc2ec338c9190ccc7a4bc60274c1fd';

    // Test Production Environment
    console.log('\nTesting PRODUCTION environment:');
    console.log('-'.repeat(30));

    try {
        const prodContext = new MockContext(apiKey, 'production');

        console.log('Initializing bunq session...');
        const prodCredentials = await initializeBunqSession.call(prodContext);

        console.log('✓ Session initialized successfully');
        console.log(`Installation Token: ${prodCredentials.installationToken ? 'Set' : 'Not set'}`);
        console.log(`Device ID: ${prodCredentials.deviceId ? 'Set' : 'Not set'}`);
        console.log(`Session Token: ${prodCredentials.sessionToken ? 'Set' : 'Not set'}`);

        if (prodCredentials.sessionToken) {
            console.log('\nTesting user endpoint...');
            const userResponse = await bunqApiRequest.call(prodContext, 'GET', '/user');
            console.log('✓ User endpoint test successful');
            console.log('User data received:', Object.keys(userResponse.Response || {}));
        }

    } catch (error) {
        console.log('✗ Production test failed:', error.message);
        if (error.response ? .body) {
            try {
                const errorData = JSON.parse(error.response.body);
                console.log('Error details:', errorData.Error ? .[0] ? .error_description || 'Unknown error');
            } catch (e) {
                console.log('Raw error:', error.response.body);
            }
        }
    }

    // Test Sandbox Environment
    console.log('\nTesting SANDBOX environment:');
    console.log('-'.repeat(30));

    try {
        const sandboxContext = new MockContext(apiKey, 'sandbox');

        console.log('Initializing bunq session...');
        const sandboxCredentials = await initializeBunqSession.call(sandboxContext);

        console.log('✓ Session initialized successfully');
        console.log(`Installation Token: ${sandboxCredentials.installationToken ? 'Set' : 'Not set'}`);
        console.log(`Device ID: ${sandboxCredentials.deviceId ? 'Set' : 'Not set'}`);
        console.log(`Session Token: ${sandboxCredentials.sessionToken ? 'Set' : 'Not set'}`);

        if (sandboxCredentials.sessionToken) {
            console.log('\nTesting user endpoint...');
            const userResponse = await bunqApiRequest.call(sandboxContext, 'GET', '/user');
            console.log('✓ User endpoint test successful');
            console.log('User data received:', Object.keys(userResponse.Response || {}));
        }

    } catch (error) {
        console.log('✗ Sandbox test failed:', error.message);
        if (error.response ? .body) {
            try {
                const errorData = JSON.parse(error.response.body);
                console.log('Error details:', errorData.Error ? .[0] ? .error_description || 'Unknown error');
            } catch (e) {
                console.log('Raw error:', error.response.body);
            }
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('N8N INTEGRATION TEST COMPLETED');
    console.log('='.repeat(50));
}

testN8nIntegration().catch(console.error);