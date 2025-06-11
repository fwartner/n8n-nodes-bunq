import { Bunq } from '../../nodes/Bunq/Bunq.node';
import { BunqTrigger } from '../../nodes/BunqTrigger/BunqTrigger.node';
import { BunqApi } from '../../credentials/BunqApi.credentials';
import { IExecuteFunctions, IHookFunctions, IWebhookFunctions, INode } from 'n8n-workflow';

// Mock the GenericFunctions for integration tests
jest.mock('../../nodes/Bunq/GenericFunctions', () => ({
	bunqApiRequest: jest.fn(),
	bunqApiRequestHook: jest.fn(),
	bunqApiRequestAllItems: jest.fn(),
	formatBunqResponse: jest.fn((response) => response),
	initializeBunqSession: jest.fn(),
	initializeBunqSessionHook: jest.fn(),
	generateDeviceId: jest.fn(() => 'n8n-bunq-test123456789abcdef'),
	generateKeyPair: jest.fn(() => ({
		privateKey: 'test-private-key',
		publicKey: 'test-public-key',
	})),
	createRequestSignature: jest.fn(() => 'test-signature'),
}));

const mockBunqApiRequest = require('../../nodes/Bunq/GenericFunctions').bunqApiRequest;
const mockBunqApiRequestHook = require('../../nodes/Bunq/GenericFunctions').bunqApiRequestHook;
const mockInitializeBunqSession = require('../../nodes/Bunq/GenericFunctions').initializeBunqSession;
const mockInitializeBunqSessionHook = require('../../nodes/Bunq/GenericFunctions').initializeBunqSessionHook;

describe('bunq Integration Tests', () => {
	let bunqNode: Bunq;
	let bunqTrigger: BunqTrigger;
	let bunqCredentials: BunqApi;

	beforeEach(() => {
		bunqNode = new Bunq();
		bunqTrigger = new BunqTrigger();
		bunqCredentials = new BunqApi();

		jest.clearAllMocks();
		mockInitializeBunqSession.mockResolvedValue({});
		mockInitializeBunqSessionHook.mockResolvedValue({});
	});

	describe('Full Payment Workflow', () => {
		it('should complete entire payment creation and tracking flow', async () => {
			// Step 1: Create a payment
			const createPaymentExecute: Partial<IExecuteFunctions> = {
				getInputData: () => [{ json: {} }],
				getNodeParameter: jest.fn().mockImplementation((paramName) => {
					switch (paramName) {
						case 'resource': return 'payment';
						case 'operation': return 'create';
						case 'accountId': return '123';
						case 'amount': return '50.00';
						case 'currency': return 'EUR';
						case 'counterpartyType': return 'iban';
						case 'iban': return 'NL91ABNA0417164300';
						case 'recipientName': return 'Test Recipient';
						case 'description': return 'Test payment';
						default: return undefined;
					}
				}),
				helpers: { returnJsonArray: (data: any) => data } as any,
				getNode: (): INode => ({
				id: 'payment-node-id',
				name: 'payment-node',
				typeVersion: 1,
				type: 'n8n-nodes-bunq.bunq',
				position: [0, 0],
				parameters: {},
			}),
				continueOnFail: () => false,
			};

			const paymentResponse = {
				Response: [{
					Payment: {
						id: 999,
						amount: { value: '50.00', currency: 'EUR' },
						status: 'PENDING',
						created: '2024-01-01T12:00:00Z',
					}
				}]
			};

			mockBunqApiRequest.mockResolvedValueOnce(paymentResponse);

			const paymentResult = await bunqNode.execute.call(
				createPaymentExecute as IExecuteFunctions
			);

			expect(paymentResult[0]).toContain(paymentResponse);

			// Step 2: Check payment status
			const checkPaymentExecute: Partial<IExecuteFunctions> = {
				...createPaymentExecute,
				getNodeParameter: jest.fn().mockImplementation((paramName) => {
					switch (paramName) {
						case 'resource': return 'payment';
						case 'operation': return 'get';
						case 'accountId': return '123';
						case 'paymentId': return '999';
						default: return undefined;
					}
				}),
			};

			const statusResponse = {
				Response: [{
					Payment: {
						id: 999,
						status: 'ACCEPTED',
						updated: '2024-01-01T12:05:00Z',
					}
				}]
			};

			mockBunqApiRequest.mockResolvedValueOnce(statusResponse);

			const statusResult = await bunqNode.execute.call(
				checkPaymentExecute as IExecuteFunctions
			);

			expect(statusResult[0]).toContain(statusResponse);
			expect(mockBunqApiRequest).toHaveBeenCalledWith(
				'GET',
				'/user/monetary-account/123/payment/999'
			);
		});
	});

	describe('Webhook Integration Flow', () => {
		it('should set up webhook and process incoming events', async () => {
			// Step 1: Set up webhook
			const hookFunctions: Partial<IHookFunctions> = {
				getNodeWebhookUrl: () => 'https://test.n8n.io/webhook/bunq-test',
				getNodeParameter: jest.fn().mockImplementation((paramName) => {
					switch (paramName) {
						case 'userId': return '';
						case 'accountId': return '123';
						case 'events': return ['PAYMENT_CREATED', 'PAYMENT_UPDATED'];
						default: return undefined;
					}
				}),
				getNode: (): INode => ({
				id: 'webhook-trigger-id',
				name: 'webhook-trigger',
				typeVersion: 1,
				type: 'n8n-nodes-bunq.bunqTrigger',
				position: [0, 0],
				parameters: {},
			}),
			};

			// Mock webhook creation directly (not checking for existing)
			const webhookCreationResponse = {
				Response: [{
					NotificationFilterUrl: {
						id: 555,
						notification_target: 'https://test.n8n.io/webhook/bunq-test',
					}
				}]
			};
			mockBunqApiRequestHook.mockResolvedValueOnce(webhookCreationResponse);

			const webhookCreated = await bunqTrigger.webhookMethods.default.create.call(
				hookFunctions as IHookFunctions
			);

			expect(webhookCreated).toBe(true);
			expect(mockBunqApiRequestHook).toHaveBeenCalledWith(
				'POST',
				'/user/monetary-account/123/notification-filter-url',
				expect.objectContaining({
					notification_target: 'https://test.n8n.io/webhook/bunq-test',
					notification_filters: expect.arrayContaining([
						expect.objectContaining({ event_type: 'PAYMENT_CREATED' }),
						expect.objectContaining({ event_type: 'PAYMENT_UPDATED' }),
					]),
				})
			);

			// Step 2: Process incoming webhook
			const webhookFunctions: Partial<IWebhookFunctions> = {
				getBodyData: () => ({
					NotificationUrl: {
						category: 'PAYMENT_CREATED',
						created: '2024-01-01T12:00:00Z',
						object: {
							Payment: {
								id: 999,
								amount: { value: '50.00', currency: 'EUR' },
								description: 'Incoming payment',
							}
						}
					}
				}),
				getNodeParameter: jest.fn().mockImplementation((paramName) => {
					switch (paramName) {
						case 'events': return ['PAYMENT_CREATED'];
						case 'options': return {};
						default: return undefined;
					}
				}),
				helpers: { returnJsonArray: (data: any) => data } as any,
			};

			const webhookResult = await bunqTrigger.webhook.call(
				webhookFunctions as IWebhookFunctions
			);

			expect(webhookResult.workflowData).toHaveLength(1);
			expect(webhookResult.workflowData?.[0][0]).toMatchObject({
				event_type: 'PAYMENT_CREATED',
				timestamp: '2024-01-01T12:00:00Z',
				Payment: {
					id: 999,
					amount: { value: '50.00', currency: 'EUR' },
					description: 'Incoming payment',
				}
			});
		});
	});

	describe('Export and Download Workflow', () => {
		it('should create, monitor, and download statement export', async () => {
			const executeFunctions: Partial<IExecuteFunctions> = {
				getInputData: () => [{ json: {} }],
				getNodeParameter: jest.fn(),
				helpers: {
					returnJsonArray: (data: any) => data,
					request: jest.fn(),
					prepareBinaryData: jest.fn(),
				} as any,
				getNode: (): INode => ({
				id: 'export-node-id',
				name: 'export-node',
				typeVersion: 1,
				type: 'n8n-nodes-bunq.bunq',
				position: [0, 0],
				parameters: {},
			}),
				continueOnFail: () => false,
			};

			// Step 1: Create export
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation((paramName) => {
				switch (paramName) {
					case 'resource': return 'export';
					case 'operation': return 'createStatement';
					case 'accountId': return '123';
					case 'statementFormat': return 'CSV';
					case 'dateFrom': return '2024-01-01';
					case 'dateTo': return '2024-12-31';
					case 'additionalOptions': return { includeAttachments: true };
					default: return undefined;
				}
			});

			const exportCreationResponse = {
				Response: [{
					ExportStatement: {
						id: 777,
						status: 'PENDING',
						statement_format: 'CSV',
					}
				}]
			};

			mockBunqApiRequest.mockResolvedValueOnce(exportCreationResponse);

			await bunqNode.execute.call(executeFunctions as IExecuteFunctions);

			expect(mockBunqApiRequest).toHaveBeenCalledWith(
				'POST',
				'/user/monetary-account/123/export-statement',
				expect.objectContaining({
					statement_format: 'CSV',
					date_start: '2024-01-01',
					date_end: '2024-12-31',
					include_attachment: true,
				})
			);

			// Step 2: Check export status
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation((paramName) => {
				switch (paramName) {
					case 'resource': return 'export';
					case 'operation': return 'getStatement';
					case 'accountId': return '123';
					case 'statementId': return '777';
					default: return undefined;
				}
			});

			const exportStatusResponse = {
				Response: [{
					ExportStatement: {
						id: 777,
						status: 'COMPLETED',
						download_url: 'https://bunq.com/download/777',
						statement_format: 'CSV',
					}
				}]
			};

			mockBunqApiRequest.mockResolvedValueOnce(exportStatusResponse);

			await bunqNode.execute.call(executeFunctions as IExecuteFunctions);

			// Step 3: Download the file
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation((paramName) => {
				switch (paramName) {
					case 'resource': return 'export';
					case 'operation': return 'downloadStatement';
					case 'accountId': return '123';
					case 'statementId': return '777';
					case 'downloadOptions': return { binaryPropertyName: 'statement' };
					default: return undefined;
				}
			});

			// Mock the statement details request
			mockBunqApiRequest.mockResolvedValueOnce(exportStatusResponse);

			// Mock the file download
			(executeFunctions.helpers?.request as jest.Mock).mockResolvedValueOnce(
				Buffer.from('CSV content here')
			);

			(executeFunctions.helpers?.prepareBinaryData as jest.Mock).mockResolvedValueOnce({
				data: Buffer.from('CSV content here'),
				mimeType: 'text/csv',
				fileName: 'statement_777.csv',
			});

			const downloadResult = await bunqNode.execute.call(
				executeFunctions as IExecuteFunctions
			);

			expect(executeFunctions.helpers?.request).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://bunq.com/download/777',
				encoding: null,
			});

			expect(downloadResult[0][0]).toMatchObject({
				json: {
					statement_id: '777',
					format: 'CSV',
					status: 'COMPLETED',
				},
				binary: {
					statement: expect.any(Object),
				},
			});
		});
	});

	describe('Card Management Workflow', () => {
		it('should manage card limits and retrieve card information', async () => {
			const executeFunctions: Partial<IExecuteFunctions> = {
				getInputData: () => [{ json: {} }],
				getNodeParameter: jest.fn(),
				helpers: { returnJsonArray: (data: any) => data } as any,
				getNode: (): INode => ({
				id: 'card-node-id',
				name: 'card-node',
				typeVersion: 1,
				type: 'n8n-nodes-bunq.bunq',
				position: [0, 0],
				parameters: {},
			}),
				continueOnFail: () => false,
			};

			// Step 1: List cards
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation((paramName) => {
				switch (paramName) {
					case 'resource': return 'card';
					case 'operation': return 'list';
					case 'returnAll': return false;
					case 'limit': return 10;
					case 'additionalFields': return {};
					default: return undefined;
				}
			});

			const cardsResponse = {
				Response: [
					{ Card: { id: 888, name_on_card: 'Test User', status: 'ACTIVE' } },
					{ Card: { id: 889, name_on_card: 'Test User 2', status: 'ACTIVE' } },
				]
			};

			mockBunqApiRequest.mockResolvedValueOnce(cardsResponse);

			await bunqNode.execute.call(executeFunctions as IExecuteFunctions);

			// Step 2: Set card limits
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation((paramName) => {
				switch (paramName) {
					case 'resource': return 'card';
					case 'operation': return 'setLimits';
					case 'cardId': return '888';
					case 'limitType': return 'ATM_DAILY';
					case 'limitAmount': return '200.00';
					case 'currency': return 'EUR';
					default: return undefined;
				}
			});

			const limitResponse = {
				Response: [{
					CardLimit: {
						id: 111,
						daily_limit: { value: '200.00', currency: 'EUR' },
						type: 'ATM_DAILY',
					}
				}]
			};

			mockBunqApiRequest.mockResolvedValueOnce(limitResponse);

			await bunqNode.execute.call(executeFunctions as IExecuteFunctions);

			expect(mockBunqApiRequest).toHaveBeenLastCalledWith(
				'POST',
				'/user/card/888/card-limit',
				expect.objectContaining({
					daily_limit: { value: '200.00', currency: 'EUR' },
					type: 'ATM_DAILY',
				})
			);

			// Step 3: Get card limits
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation((paramName) => {
				switch (paramName) {
					case 'resource': return 'card';
					case 'operation': return 'getLimits';
					case 'cardId': return '888';
					default: return undefined;
				}
			});

			const limitsResponse = {
				Response: [
					{ CardLimit: { type: 'ATM_DAILY', daily_limit: { value: '200.00' } } },
					{ CardLimit: { type: 'POS_DAILY', daily_limit: { value: '500.00' } } },
				]
			};

			mockBunqApiRequest.mockResolvedValueOnce(limitsResponse);

			await bunqNode.execute.call(executeFunctions as IExecuteFunctions);

			expect(mockBunqApiRequest).toHaveBeenLastCalledWith(
				'GET',
				'/user/card/888/card-limit'
			);
		});
	});

	describe('Credential Integration', () => {
		it('should have proper credential configuration for testing', () => {
			expect(bunqCredentials.test).toBeDefined();
			expect(bunqCredentials.test?.request?.url).toBe('/v1/user');
			expect(bunqCredentials.test?.request?.method).toBe('GET');
		});

		it('should configure proper base URL based on environment', () => {
			const testRequest = bunqCredentials.test?.request;
			expect(testRequest?.baseURL).toBe(
				'={{$credentials.environment === "production" ? "https://api.bunq.com" : "https://public-api.sandbox.bunq.com"}}'
			);
		});
	});

	describe('Error Recovery and Resilience', () => {
		it('should handle session initialization failure gracefully', async () => {
			mockInitializeBunqSession.mockRejectedValueOnce(new Error('Session failed'));

			const executeFunctions: Partial<IExecuteFunctions> = {
				getInputData: () => [{ json: {} }],
				getNodeParameter: jest.fn((param: string) => {
				if (param === 'resource') return 'user';
				if (param === 'operation') return 'get';
				return '';
			}) as any,
				getNode: (): INode => ({
				id: 'test-node-id',
				name: 'test-node',
				typeVersion: 1,
				type: 'n8n-nodes-bunq.bunq',
				position: [0, 0],
				parameters: {},
			}),
				continueOnFail: () => false,
			};

			await expect(
				bunqNode.execute.call(executeFunctions as IExecuteFunctions)
			).rejects.toThrow('Failed to initialize bunq session');
		});

		it('should continue processing when continueOnFail is enabled', async () => {
			const executeFunctions: Partial<IExecuteFunctions> = {
				getInputData: () => [{ json: {} }, { json: {} }],
				getNodeParameter: jest.fn().mockImplementation((paramName) => {
					switch (paramName) {
						case 'resource': return 'user';
						case 'operation': return 'get';
						default: return undefined;
					}
				}),
				helpers: { returnJsonArray: (data: any) => data } as any,
				getNode: (): INode => ({
				id: 'test-node-id',
				name: 'test-node',
				typeVersion: 1,
				type: 'n8n-nodes-bunq.bunq',
				position: [0, 0],
				parameters: {},
			}),
				continueOnFail: () => true,
			};

			// First request succeeds, second fails
			mockBunqApiRequest
				.mockResolvedValueOnce({ Response: [{ User: { id: 1 } }] })
				.mockRejectedValueOnce(new Error('API Error'));

			const result = await bunqNode.execute.call(executeFunctions as IExecuteFunctions);

			expect(result).toEqual([[
				{ Response: [{ User: { id: 1 } }] },
				{ error: 'API Error' },
			]]);
		});
	});
});