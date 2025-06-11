import {
	getBunqApiUrl,
	generateRequestId,
	generateDeviceId,
	generateKeyPair,
	createRequestSignature,
	formatBunqResponse,
	handleBunqError,
} from '../../../nodes/Bunq/GenericFunctions';
import { NodeApiError } from 'n8n-workflow';

describe('GenericFunctions', () => {
	describe('getBunqApiUrl', () => {
		it('should return production URL for production environment', () => {
			expect(getBunqApiUrl('production')).toBe('https://api.bunq.com');
		});

		it('should return sandbox URL for sandbox environment', () => {
			expect(getBunqApiUrl('sandbox')).toBe('https://public-api.sandbox.bunq.com');
		});

		it('should return sandbox URL for any non-production environment', () => {
			expect(getBunqApiUrl('test')).toBe('https://public-api.sandbox.bunq.com');
			expect(getBunqApiUrl('')).toBe('https://public-api.sandbox.bunq.com');
		});
	});

	describe('generateRequestId', () => {
		it('should generate a 32-character hexadecimal string', () => {
			const requestId = generateRequestId();
			expect(requestId).toMatch(/^[a-f0-9]{32}$/);
			expect(requestId).toHaveLength(32);
		});

		it('should generate unique request IDs', () => {
			const id1 = generateRequestId();
			const id2 = generateRequestId();
			expect(id1).not.toBe(id2);
		});
	});

	describe('generateDeviceId', () => {
		it('should generate device ID with correct prefix', () => {
			const deviceId = generateDeviceId();
			expect(deviceId).toMatch(/^n8n-bunq-[a-f0-9]{16}$/);
		});

		it('should generate unique device IDs', () => {
			const id1 = generateDeviceId();
			const id2 = generateDeviceId();
			expect(id1).not.toBe(id2);
		});
	});

	describe('generateKeyPair', () => {
		it('should generate RSA key pair with correct format', () => {
			const keyPair = generateKeyPair();
			
			expect(keyPair).toHaveProperty('privateKey');
			expect(keyPair).toHaveProperty('publicKey');
			
			// Check PEM format
			expect(keyPair.privateKey).toMatch(/^-----BEGIN PRIVATE KEY-----/);
			expect(keyPair.privateKey).toMatch(/-----END PRIVATE KEY-----[\s]*$/);
			expect(keyPair.publicKey).toMatch(/^-----BEGIN PUBLIC KEY-----/);
			expect(keyPair.publicKey).toMatch(/-----END PUBLIC KEY-----[\s]*$/);
		});

		it('should generate different key pairs each time', () => {
			const keyPair1 = generateKeyPair();
			const keyPair2 = generateKeyPair();
			
			expect(keyPair1.privateKey).not.toBe(keyPair2.privateKey);
			expect(keyPair1.publicKey).not.toBe(keyPair2.publicKey);
		});
	});

	describe('createRequestSignature', () => {
		const testPrivateKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDIrFR4n/S7YqSY
NWlPDwBmbHLPG8CZFbES0Wq7F8XRYhe9ankqqeyWh/drwcSG3/Z582adV8fe+0/A
1W6LS7WJdYF0u1os/1q0TmHm09ZBCm/fnA6zsVdGypF4cXQxu2t72mAOYUjOiwiF
EtScOfRz1v31WVUClP7C2aWcGurRLMSZrhNVYHeMHF69cj3uPz2BMtjrhZgcO1Ez
qaXCdHRx/QDBIp1HsZU3C1FEz2QFLTqoWp5jE4a5l1FKCPzE5ixnEjCUiqaUok6U
YZZ20b1vRSxeK5r0fqqkpncT3Xxbdh4M3vt8+vx7Hk8MiTw7WYtxb2cD2TJP5Bfi
8KXQFWzpAgMBAAECggEACk83gr/y/oUq6r/vDQGlYLMIc0VGz9vlA5AQhpP01NTl
iSoVF1ZGAkDHew4oIXwUPqp8y9oUjwsvCyYxPkTxireSTZ6KG4mIjdQAucS0e0Bv
mW0RdfVchBWdmMgOswxg0VWEKFD4ANZ0kFj0j8x2winE1SFAWbgxCMPOOzbIeAkD
C89Z7ZeLz+4z1I4RqqeddoB9BLwcE9LVyyVuxNetZ28AaxGDHVDT1n5HUvXYxvX3
Jsy0a60VZV3vgyRG/ZCr8iNcUg7B+G8hDImFex6wbP+WAAWleXyRawBKhrH5efQK
DHlYgJAJL23Em+7kESjliHJFhEwyFGuk5tktiws71QKBgQDl5xp/NroiTSV+AQhN
9pwUDexiHMZlMav5qz/4aRhLTHxgFZyKd5muqurge/R6Tgq11KcKh70Gw0rtwswa
MzS3YpNwqfmKqih6UD1TqlpjRlAiDp2Qq6hemjGcJA2QwlOkBKQ88s0gfrysANHz
Jfs/cay6aYSK5p1HFrR1A+aGNQKBgQDfc9MX2/UN7yjGOzOmushNSPqOKI1fduze
Ee2o15Y4ISGfLPoRgg4k1TL82+a8t8gcvd2E1iK1eylaRyafVD006PkNrgzvPnrB
aobwX5xVOPfAlM+GUUYMglvZw/9gtwiputJ/SVaZ26b++XsA0m+WFktFpCrRulzL
7qQJMT/SZQKBgFUf7vWvg9fzjLBNHZAQgdYDGcVyNht9+tllCTinYTFwTpUdK2sx
wZuk+XbJLsqiXuDYrkj93YXFhdbnS79fumM0grcymI05V+eCElMKPpGHlWAm3TyV
8q+klD3mM4eoDGQsu8s9c6pWgvGFFDfdllv1cSlMrKDpps6Nn5+8I/0JAoGAdTze
52jHdQ0i9oa/Pd5IE4yTsRyDuC+8bXM4n1qlfUOc0VgWyDLVWuvlOZfiwucl/jZ7
0CNNyKwa8TvdfsEC8AzABzZnoOrGG07aB6oSawBdtNQe4dkoiI2oxWO5TLQbvnm/
0XrYDheZ0bNxnufKFhQSYDKXKLy/zVujAxOs6aUCgYEAuWGmccwb48+I72RL0N8Y
Tot8an09J1fGZc2rhI/O7E/ZPnI8Uck1IcLR1AUKd25G09wDGvZ1D/WHSoRRvnL2
M35vTHLsXMRkK4VYFvzI1jP6Mz+OcvUWbWnB4zY+P4pCZNeKkZs6+VQStTTX4iLl
RTRwLMEd3M4k9hTDTvjuzfU=
-----END PRIVATE KEY-----`;

		it('should create base64 signature', () => {
			const signature = createRequestSignature(
				'GET',
				'/v1/user',
				{ 'Content-Type': 'application/json' },
				'',
				testPrivateKey
			);
			
			expect(typeof signature).toBe('string');
			expect(signature.length).toBeGreaterThan(0);
			// Should be base64 encoded
			expect(signature).toMatch(/^[A-Za-z0-9+/]+=*$/);
		});

		it('should create different signatures for different inputs', () => {
			const sig1 = createRequestSignature('GET', '/v1/user', {}, '', testPrivateKey);
			const sig2 = createRequestSignature('POST', '/v1/user', {}, '', testPrivateKey);
			
			expect(sig1).not.toBe(sig2);
		});
	});

	describe('formatBunqResponse', () => {
		it('should handle array responses', () => {
			const input = {
				Response: [
					{ User: { id: 1, name: 'Test' } },
					{ User: { id: 2, name: 'Test2' } }
				]
			};

			const result = formatBunqResponse(input);
			
			expect(result.Response).toHaveLength(2);
			expect((result.Response as any[])[0]).toEqual({ type: 'User', id: 1, name: 'Test' });
			expect((result.Response as any[])[1]).toEqual({ type: 'User', id: 2, name: 'Test2' });
		});

		it('should handle single object responses', () => {
			const input = {
				Response: {
					User: { id: 1, name: 'Test' }
				}
			};

			const result = formatBunqResponse(input);
			
			expect(result.Response).toEqual({ type: 'User', id: 1, name: 'Test' });
		});

		it('should return original response if no Response property', () => {
			const input = { data: 'test' };
			const result = formatBunqResponse(input);
			
			expect(result).toEqual(input);
		});

		it('should handle empty responses', () => {
			const input = { Response: [] };
			const result = formatBunqResponse(input);
			
			expect(result.Response).toEqual([]);
		});
	});

	describe('handleBunqError', () => {
		const mockNode = { name: 'test-node' };

		it('should handle bunq API errors with status code', () => {
			const error = {
				name: 'APIError',
				message: 'API request failed',
				statusCode: 400,
				response: {
					body: JSON.stringify({
						Error: [{
							error_description: 'Invalid request'
						}]
					})
				}
			};

			const result = handleBunqError(mockNode, error, '/test');
			
			expect(result).toBeInstanceOf(NodeApiError);
			expect(result.message).toContain('Invalid request');
			expect(result.message).toContain('/test');
		});

		it('should handle errors without bunq error details', () => {
			const error = {
				name: 'APIError',
				message: 'API request failed',
				statusCode: 500,
				response: { body: '{}' }
			};

			const result = handleBunqError(mockNode, error);
			
			expect(result).toBeInstanceOf(NodeApiError);
			expect(result.message).toContain('bunq API request failed with status 500');
		});

		it('should handle non-HTTP errors', () => {
			const error = new Error('Network error');
			
			const result = handleBunqError(mockNode, error);
			
			expect(result).toBeInstanceOf(NodeApiError);
		});

		it('should use translated error description when available', () => {
			const error = {
				name: 'APIError',
				message: 'API request failed',
				statusCode: 400,
				response: {
					body: JSON.stringify({
						Error: [{
							error_description_translated: 'Translated error'
						}]
					})
				}
			};

			const result = handleBunqError(mockNode, error);
			
			expect(result.message).toContain('Translated error');
		});
	});
});