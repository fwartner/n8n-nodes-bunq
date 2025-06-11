import { Bunq } from '../../../nodes/Bunq/Bunq.node';
import { IExecuteFunctions, INode } from 'n8n-workflow';

// Mock the GenericFunctions
jest.mock('../../../nodes/Bunq/GenericFunctions', () => ({
	bunqApiRequest: jest.fn(),
	bunqApiRequestAllItems: jest.fn(),
	formatBunqResponse: jest.fn((response) => response),
	initializeBunqSession: jest.fn(),
}));

const mockBunqApiRequest = require('../../../nodes/Bunq/GenericFunctions').bunqApiRequest;
const mockInitializeBunqSession = require('../../../nodes/Bunq/GenericFunctions').initializeBunqSession;

describe('Bunq Node', () => {
	let bunqNode: Bunq;
	let mockExecuteFunctions: Partial<IExecuteFunctions>;

	beforeEach(() => {
		bunqNode = new Bunq();
		
		mockExecuteFunctions = {
			getInputData: jest.fn(() => [{ json: {} }]),
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn(),
			helpers: {
				returnJsonArray: jest.fn((data) => data),
				request: jest.fn(),
				assertBinaryData: jest.fn(),
				prepareBinaryData: jest.fn(),
			} as any,
			getNode: jest.fn((): INode => ({
			id: 'test-node-id',
			name: 'test-node',
			typeVersion: 1,
			type: 'n8n-nodes-bunq.bunq',
			position: [0, 0],
			parameters: {},
		})),
			continueOnFail: jest.fn(() => false),
		};

		// Reset mocks
		jest.clearAllMocks();
		mockInitializeBunqSession.mockResolvedValue({});
	});

	describe('Node Properties', () => {
		it('should have correct node description', () => {
			expect(bunqNode.description.displayName).toBe('bunq');
			expect(bunqNode.description.name).toBe('bunq');
			expect(bunqNode.description.icon).toBe('file:bunq.svg');
			expect(bunqNode.description.group).toContain('transform');
		});

		it('should have all required resources', () => {
			const resourceProperty = bunqNode.description.properties.find(
				prop => prop.name === 'resource'
			);
			
			expect(resourceProperty).toBeDefined();
			expect(resourceProperty?.options).toHaveLength(11);
			
			const resourceValues = resourceProperty?.options?.map((opt: any) => opt.value);
			expect(resourceValues).toContain('user');
			expect(resourceValues).toContain('monetaryAccount');
			expect(resourceValues).toContain('payment');
			expect(resourceValues).toContain('transaction');
			expect(resourceValues).toContain('requestInquiry');
			expect(resourceValues).toContain('card');
			expect(resourceValues).toContain('attachment');
			expect(resourceValues).toContain('bunqMe');
			expect(resourceValues).toContain('webhook');
			expect(resourceValues).toContain('scheduledPayment');
			expect(resourceValues).toContain('export');
		});
	});

	describe('User Operations', () => {
		beforeEach(() => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((paramName) => {
					switch (paramName) {
						case 'resource': return 'user';
						case 'operation': return 'get';
						case 'userId': return '';
						default: return undefined;
					}
				});
		});

		it('should execute user get operation', async () => {
			const mockResponse = { Response: [{ User: { id: 1, name: 'Test User' } }] };
			mockBunqApiRequest.mockResolvedValue(mockResponse);

			const result = await bunqNode.execute.call(mockExecuteFunctions as IExecuteFunctions);

			// OAuth2 authentication does not require session initialization
			expect(mockBunqApiRequest).toHaveBeenCalledWith('GET', '/user');
			expect(result).toEqual([[mockResponse]]);
		});

		it('should execute user list operation with specific user ID', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((paramName) => {
					switch (paramName) {
						case 'resource': return 'user';
						case 'operation': return 'get';
						case 'userId': return '123';
						default: return undefined;
					}
				});

			const mockResponse = { Response: [{ User: { id: 123, name: 'Specific User' } }] };
			mockBunqApiRequest.mockResolvedValue(mockResponse);

			await bunqNode.execute.call(mockExecuteFunctions as IExecuteFunctions);

			expect(mockBunqApiRequest).toHaveBeenCalledWith('GET', '/user/123');
		});
	});

	describe('Payment Operations', () => {
		beforeEach(() => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((paramName, _index) => {
					switch (paramName) {
						case 'resource': return 'payment';
						case 'operation': return 'create';
						case 'userId': return '';
						case 'accountId': return '456';
						case 'amount': return '10.00';
						case 'currency': return 'EUR';
						case 'counterpartyType': return 'iban';
						case 'iban': return 'NL91ABNA0417164300';
						case 'recipientName': return 'John Doe';
						case 'description': return 'Test payment';
						default: return undefined;
					}
				});
		});

		it('should create payment with IBAN', async () => {
			const mockResponse = { Response: [{ Payment: { id: 789 } }] };
			mockBunqApiRequest.mockResolvedValue(mockResponse);

			await bunqNode.execute.call(mockExecuteFunctions as IExecuteFunctions);

			expect(mockBunqApiRequest).toHaveBeenCalledWith(
				'POST',
				'/user/monetary-account/456/payment',
				expect.objectContaining({
					amount: { value: '10.00', currency: 'EUR' },
					counterparty_alias: {
						type: 'IBAN',
						value: 'NL91ABNA0417164300',
						name: 'John Doe',
					},
					description: 'Test payment',
				})
			);
		});

		it('should create payment with email', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((paramName) => {
					switch (paramName) {
						case 'resource': return 'payment';
						case 'operation': return 'create';
						case 'userId': return '';
						case 'accountId': return '456';
						case 'amount': return '25.50';
						case 'currency': return 'EUR';
						case 'counterpartyType': return 'email';
						case 'email': return 'test@example.com';
						case 'recipientName': return 'Jane Doe';
						case 'description': return 'Email payment';
						default: return undefined;
					}
				});

			const mockResponse = { Response: [{ Payment: { id: 790 } }] };
			mockBunqApiRequest.mockResolvedValue(mockResponse);

			await bunqNode.execute.call(mockExecuteFunctions as IExecuteFunctions);

			expect(mockBunqApiRequest).toHaveBeenCalledWith(
				'POST',
				'/user/monetary-account/456/payment',
				expect.objectContaining({
					counterparty_alias: {
						type: 'EMAIL',
						value: 'test@example.com',
						name: 'Jane Doe',
					},
				})
			);
		});

		it('should get specific payment', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((paramName) => {
					switch (paramName) {
						case 'resource': return 'payment';
						case 'operation': return 'get';
						case 'accountId': return '456';
						case 'paymentId': return '789';
						default: return undefined;
					}
				});

			const mockResponse = { Response: [{ Payment: { id: 789, amount: { value: '10.00' } } }] };
			mockBunqApiRequest.mockResolvedValue(mockResponse);

			await bunqNode.execute.call(mockExecuteFunctions as IExecuteFunctions);

			expect(mockBunqApiRequest).toHaveBeenCalledWith('GET', '/user/monetary-account/456/payment/789');
		});
	});

	describe('Transaction Operations', () => {
		it('should list transactions with filters', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((paramName) => {
					switch (paramName) {
						case 'resource': return 'transaction';
						case 'operation': return 'list';
						case 'accountId': return '456';
						case 'returnAll': return false;
						case 'limit': return 50;
						case 'additionalFields': return {
							fromDate: new Date('2024-01-01'),
							toDate: new Date('2024-12-31'),
							minAmount: '5.00',
							maxAmount: '100.00',
						};
						default: return undefined;
					}
				});

			const mockResponse = { Response: [{ Payment: { id: 1 } }] };
			mockBunqApiRequest.mockResolvedValue(mockResponse);

			await bunqNode.execute.call(mockExecuteFunctions as IExecuteFunctions);

			expect(mockBunqApiRequest).toHaveBeenCalledWith(
				'GET',
				'/user/monetary-account/456/payment',
				{},
				expect.objectContaining({
					count: 50,
					date_from: '2024-01-01T00:00:00.000Z',
					date_to: '2024-12-31T00:00:00.000Z',
					amount_min: '5.00',
					amount_max: '100.00',
				})
			);
		});
	});

	describe('Card Operations', () => {
		it('should set card limits', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((paramName) => {
					switch (paramName) {
						case 'resource': return 'card';
						case 'operation': return 'setLimits';
						case 'cardId': return '999';
						case 'limitType': return 'POS_DAILY';
						case 'limitAmount': return '500.00';
						case 'currency': return 'EUR';
						default: return undefined;
					}
				});

			const mockResponse = { Response: [{ CardLimit: { id: 111 } }] };
			mockBunqApiRequest.mockResolvedValue(mockResponse);

			await bunqNode.execute.call(mockExecuteFunctions as IExecuteFunctions);

			expect(mockBunqApiRequest).toHaveBeenCalledWith(
				'POST',
				'/user/card/999/card-limit',
				expect.objectContaining({
					daily_limit: { value: '500.00', currency: 'EUR' },
					type: 'POS_DAILY',
				})
			);
		});
	});

	describe('Export Operations', () => {
		it('should create statement export', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((paramName) => {
					switch (paramName) {
						case 'resource': return 'export';
						case 'operation': return 'createStatement';
						case 'accountId': return '456';
						case 'statementFormat': return 'CSV';
						case 'dateFrom': return '2024-01-01';
						case 'dateTo': return '2024-12-31';
						case 'additionalOptions': return {
							includeAttachments: true,
							regionalFormat: 'EUROPEAN',
							language: 'en',
						};
						default: return undefined;
					}
				});

			const mockResponse = { Response: [{ ExportStatement: { id: 222 } }] };
			mockBunqApiRequest.mockResolvedValue(mockResponse);

			await bunqNode.execute.call(mockExecuteFunctions as IExecuteFunctions);

			expect(mockBunqApiRequest).toHaveBeenCalledWith(
				'POST',
				'/user/monetary-account/456/export-statement',
				expect.objectContaining({
					statement_format: 'CSV',
					date_start: '2024-01-01',
					date_end: '2024-12-31',
					include_attachment: true,
					regional_format: 'EUROPEAN',
					language: 'en',
				})
			);
		});
	});

	describe('Error Handling', () => {
		it('should handle API authentication errors', async () => {
			// Set up parameters for user.get operation
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((paramName) => {
					switch (paramName) {
						case 'resource': return 'user';
						case 'operation': return 'get';
						case 'userId': return '';
						default: return undefined;
					}
				});

			(mockExecuteFunctions.continueOnFail as jest.Mock).mockReturnValue(false);
			mockBunqApiRequest.mockRejectedValue(new Error('Authentication failed'));

			await expect(
				bunqNode.execute.call(mockExecuteFunctions as IExecuteFunctions)
			).rejects.toThrow('Authentication failed');
		});

		it('should handle API request errors when continueOnFail is true', async () => {
			(mockExecuteFunctions.continueOnFail as jest.Mock).mockReturnValue(true);
			mockBunqApiRequest.mockRejectedValue(new Error('API Error'));

			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((paramName) => {
					switch (paramName) {
						case 'resource': return 'user';
						case 'operation': return 'get';
						default: return undefined;
					}
				});

			const result = await bunqNode.execute.call(mockExecuteFunctions as IExecuteFunctions);

			expect(result).toEqual([[{ error: 'API Error' }]]);
		});

		it('should throw errors when continueOnFail is false', async () => {
			(mockExecuteFunctions.continueOnFail as jest.Mock).mockReturnValue(false);
			mockBunqApiRequest.mockRejectedValue(new Error('API Error'));

			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((paramName) => {
					switch (paramName) {
						case 'resource': return 'user';
						case 'operation': return 'get';
						default: return undefined;
					}
				});

			await expect(
				bunqNode.execute.call(mockExecuteFunctions as IExecuteFunctions)
			).rejects.toThrow('API Error');
		});
	});

	describe('Scheduled Payment Operations', () => {
		it('should create scheduled payment', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((paramName) => {
					switch (paramName) {
						case 'resource': return 'scheduledPayment';
						case 'operation': return 'create';
						case 'accountId': return '456';
						case 'amount': return '100.00';
						case 'currency': return 'EUR';
						case 'counterpartyType': return 'iban';
						case 'iban': return 'NL91ABNA0417164300';
						case 'recipientName': return 'Landlord';
						case 'description': return 'Monthly rent';
						case 'scheduleType': return 'MONTHLY';
						case 'startDate': return '2024-01-01T09:00:00Z';
						case 'endDate': return '2024-12-31T09:00:00Z';
						default: return undefined;
					}
				});

			const mockResponse = { Response: [{ SchedulePaymentEntry: { id: 333 } }] };
			mockBunqApiRequest.mockResolvedValue(mockResponse);

			await bunqNode.execute.call(mockExecuteFunctions as IExecuteFunctions);

			expect(mockBunqApiRequest).toHaveBeenCalledWith(
				'POST',
				'/user/monetary-account/456/schedule-payment-entry',
				expect.objectContaining({
					payment: expect.objectContaining({
						amount: { value: '100.00', currency: 'EUR' },
						counterparty_alias: {
							type: 'IBAN',
							value: 'NL91ABNA0417164300',
							name: 'Landlord',
						},
						description: 'Monthly rent',
					}),
					schedule: expect.objectContaining({
						time_start: '2024-01-01T09:00:00.000Z',
						time_end: '2024-12-31T09:00:00.000Z',
						recurrence_unit: 'MONTHLY',
						recurrence_size: 1,
					}),
				})
			);
		});
	});
});