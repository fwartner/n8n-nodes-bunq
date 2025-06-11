import { BunqTrigger } from '../../../nodes/BunqTrigger/BunqTrigger.node';
import { IHookFunctions, IWebhookFunctions, INode } from 'n8n-workflow';

// Mock the GenericFunctions
jest.mock('../../../nodes/Bunq/GenericFunctions', () => ({
	bunqApiRequestHook: jest.fn(),
	formatBunqResponse: jest.fn((response) => response),
	initializeBunqSessionHook: jest.fn(),
}));

const mockBunqApiRequestHook = require('../../../nodes/Bunq/GenericFunctions').bunqApiRequestHook;
const mockInitializeBunqSessionHook = require('../../../nodes/Bunq/GenericFunctions').initializeBunqSessionHook;

describe('BunqTrigger Node', () => {
	let bunqTriggerNode: BunqTrigger;
	let mockHookFunctions: Partial<IHookFunctions>;
	let mockWebhookFunctions: Partial<IWebhookFunctions>;

	beforeEach(() => {
		bunqTriggerNode = new BunqTrigger();
		
		mockHookFunctions = {
			getNodeWebhookUrl: jest.fn(() => 'https://test.n8n.io/webhook/bunq'),
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn(),
			getNode: jest.fn((): INode => ({
			id: 'test-trigger-id',
			name: 'test-trigger',
			typeVersion: 1,
			type: 'n8n-nodes-bunq.bunqTrigger',
			position: [0, 0],
			parameters: {},
		})),
		};

		mockWebhookFunctions = {
			getBodyData: jest.fn(),
			getNodeParameter: jest.fn(),
			helpers: {
				returnJsonArray: jest.fn((data) => data),
			} as any,
		};

		// Reset mocks
		jest.clearAllMocks();
		mockInitializeBunqSessionHook.mockResolvedValue({});
	});

	describe('Node Properties', () => {
		it('should have correct node description', () => {
			expect(bunqTriggerNode.description.displayName).toBe('bunq Trigger');
			expect(bunqTriggerNode.description.name).toBe('bunqTrigger');
			expect(bunqTriggerNode.description.icon).toBe('file:bunq.svg');
			expect(bunqTriggerNode.description.group).toContain('trigger');
		});

		it('should have webhook configuration', () => {
			expect(bunqTriggerNode.description.webhooks).toHaveLength(1);
			expect(bunqTriggerNode.description.webhooks?.[0]?.name).toBe('default');
			expect(bunqTriggerNode.description.webhooks?.[0]?.httpMethod).toBe('POST');
		});

		it('should have event type options', () => {
			const eventTypesProperty = bunqTriggerNode.description.properties.find(
				prop => prop.name === 'events'
			);
			
			expect(eventTypesProperty).toBeDefined();
			expect(eventTypesProperty?.options).toHaveLength(7);
			
			const eventValues = eventTypesProperty?.options?.map((opt: any) => opt.value);
			expect(eventValues).toContain('PAYMENT_CREATED');
			expect(eventValues).toContain('PAYMENT_UPDATED');
			expect(eventValues).toContain('REQUEST_INQUIRY_CREATED');
			expect(eventValues).toContain('CARD_TRANSACTION_CREATED');
			expect(eventValues).toContain('BUNQME_PAYMENT');
			expect(eventValues).toContain('MUTATION_CREATED');
		});
	});

	describe('Webhook Methods - checkExists', () => {
		beforeEach(() => {
			(mockHookFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((paramName) => {
					switch (paramName) {
						case 'userId': return '';
						case 'accountId': return '456';
						default: return undefined;
					}
				});
		});

		it('should return true when webhook exists', async () => {
			const mockResponse = {
				Response: [{
					NotificationFilterUrl: {
						id: 1,
						notification_target: 'https://test.n8n.io/webhook/bunq'
					}
				}]
			};
			mockBunqApiRequestHook.mockResolvedValue(mockResponse);

			const result = await bunqTriggerNode.webhookMethods.default.checkExists.call(
				mockHookFunctions as IHookFunctions
			);

			expect(result).toBe(true);
			expect(mockInitializeBunqSessionHook).toHaveBeenCalled();
			expect(mockBunqApiRequestHook).toHaveBeenCalledWith(
				'GET',
				'/user/monetary-account/456/notification-filter-url'
			);
		});

		it('should return false when webhook does not exist', async () => {
			const mockResponse = {
				Response: [{
					NotificationFilterUrl: {
						id: 1,
						notification_target: 'https://different-webhook.com'
					}
				}]
			};
			mockBunqApiRequestHook.mockResolvedValue(mockResponse);

			const result = await bunqTriggerNode.webhookMethods.default.checkExists.call(
				mockHookFunctions as IHookFunctions
			);

			expect(result).toBe(false);
		});

		it('should return false on API error', async () => {
			mockBunqApiRequestHook.mockRejectedValue(new Error('API Error'));

			const result = await bunqTriggerNode.webhookMethods.default.checkExists.call(
				mockHookFunctions as IHookFunctions
			);

			expect(result).toBe(false);
		});

		it('should handle specific user ID', async () => {
			(mockHookFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((paramName) => {
					switch (paramName) {
						case 'userId': return '123';
						case 'accountId': return '456';
						default: return undefined;
					}
				});

			mockBunqApiRequestHook.mockResolvedValue({ Response: [] });

			await bunqTriggerNode.webhookMethods.default.checkExists.call(
				mockHookFunctions as IHookFunctions
			);

			expect(mockBunqApiRequestHook).toHaveBeenCalledWith(
				'GET',
				'/user/123/monetary-account/456/notification-filter-url'
			);
		});
	});

	describe('Webhook Methods - create', () => {
		beforeEach(() => {
			(mockHookFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((paramName) => {
					switch (paramName) {
						case 'userId': return '';
						case 'accountId': return '456';
						case 'events': return ['PAYMENT_CREATED', 'PAYMENT_UPDATED'];
						default: return undefined;
					}
				});
		});

		it('should create webhook successfully', async () => {
			const mockResponse = { Response: [{ NotificationFilterUrl: { id: 1 } }] };
			mockBunqApiRequestHook.mockResolvedValue(mockResponse);

			const result = await bunqTriggerNode.webhookMethods.default.create.call(
				mockHookFunctions as IHookFunctions
			);

			expect(result).toBe(true);
			expect(mockBunqApiRequestHook).toHaveBeenCalledWith(
				'POST',
				'/user/monetary-account/456/notification-filter-url',
				expect.objectContaining({
					notification_target: 'https://test.n8n.io/webhook/bunq',
					category: 'MUTATION',
					notification_filters: expect.arrayContaining([
						expect.objectContaining({
							notification_delivery_method: 'URL',
							notification_target: 'https://test.n8n.io/webhook/bunq',
							category: 'MUTATION',
							event_type: 'PAYMENT_CREATED',
						}),
						expect.objectContaining({
							event_type: 'PAYMENT_UPDATED',
						}),
					]),
				})
			);
		});

		it('should handle creation failure', async () => {
			mockBunqApiRequestHook.mockRejectedValue(new Error('Creation failed'));

			await expect(
				bunqTriggerNode.webhookMethods.default.create.call(
					mockHookFunctions as IHookFunctions
				)
			).rejects.toThrow('Failed to create webhook: Creation failed');
		});
	});

	describe('Webhook Methods - delete', () => {
		beforeEach(() => {
			(mockHookFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((paramName) => {
					switch (paramName) {
						case 'userId': return '';
						case 'accountId': return '456';
						default: return undefined;
					}
				});
		});

		it('should delete existing webhook', async () => {
			const listResponse = {
				Response: [{
					NotificationFilterUrl: {
						id: 999,
						notification_target: 'https://test.n8n.io/webhook/bunq'
					}
				}]
			};
			
			mockBunqApiRequestHook
				.mockResolvedValueOnce(listResponse) // GET request
				.mockResolvedValueOnce({}); // DELETE request

			const result = await bunqTriggerNode.webhookMethods.default.delete.call(
				mockHookFunctions as IHookFunctions
			);

			expect(result).toBe(true);
			expect(mockBunqApiRequestHook).toHaveBeenCalledWith(
				'DELETE',
				'/user/monetary-account/456/notification-filter-url/999'
			);
		});

		it('should return false when webhook not found', async () => {
			mockBunqApiRequestHook.mockResolvedValue({ Response: [] });

			const result = await bunqTriggerNode.webhookMethods.default.delete.call(
				mockHookFunctions as IHookFunctions
			);

			expect(result).toBe(false);
		});

		it('should return false on delete error', async () => {
			mockBunqApiRequestHook.mockRejectedValue(new Error('Delete failed'));

			const result = await bunqTriggerNode.webhookMethods.default.delete.call(
				mockHookFunctions as IHookFunctions
			);

			expect(result).toBe(false);
		});
	});

	describe('Webhook Processing', () => {
		beforeEach(() => {
			(mockWebhookFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((paramName) => {
					switch (paramName) {
						case 'events': return ['PAYMENT_CREATED'];
						case 'options': return {};
						default: return undefined;
					}
				});
		});

		it('should process valid webhook payload', async () => {
			const webhookPayload = {
				NotificationUrl: {
					category: 'PAYMENT_CREATED',
					created: '2024-01-01T12:00:00Z',
					object: {
						Payment: {
							id: 789,
							amount: { value: '25.00', currency: 'EUR' },
							description: 'Test payment',
						}
					}
				}
			};

			(mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue(webhookPayload);

			const result = await bunqTriggerNode.webhook.call(
				mockWebhookFunctions as IWebhookFunctions
			);

			expect(result.workflowData).toHaveLength(1);
			expect(result.workflowData?.[0]).toEqual([{
				event_type: 'PAYMENT_CREATED',
				timestamp: '2024-01-01T12:00:00Z',
				Payment: {
					id: 789,
					amount: { value: '25.00', currency: 'EUR' },
					description: 'Test payment',
				}
			}]);
		});

		it('should filter events not in subscription', async () => {
			const webhookPayload = {
				NotificationUrl: {
					category: 'CARD_TRANSACTION_CREATED',
					object: { CardTransaction: { id: 999 } }
				}
			};

			(mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue(webhookPayload);

			const result = await bunqTriggerNode.webhook.call(
				mockWebhookFunctions as IWebhookFunctions
			);

			expect(result.workflowData).toEqual([[]]);
		});

		it('should apply amount filters', async () => {
			(mockWebhookFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((paramName) => {
					switch (paramName) {
						case 'events': return ['PAYMENT_CREATED'];
						case 'options': return {
							filterAmounts: {
								amounts: {
									minAmount: '50.00',
									maxAmount: '100.00',
								}
							}
						};
						default: return undefined;
					}
				});

			const webhookPayload = {
				NotificationUrl: {
					category: 'PAYMENT_CREATED',
					created: '2024-01-01T12:00:00Z',
					object: {
						amount: { value: '25.00', currency: 'EUR' },
						id: 789,
					}
				}
			};

			(mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue(webhookPayload);

			const result = await bunqTriggerNode.webhook.call(
				mockWebhookFunctions as IWebhookFunctions
			);

			// Should be filtered out due to amount being below minimum
			expect(result.workflowData).toEqual([[]]);
		});

		it('should apply description filters', async () => {
			(mockWebhookFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((paramName) => {
					switch (paramName) {
						case 'events': return ['PAYMENT_CREATED'];
						case 'options': return {
							filterDescription: 'invoice'
						};
						default: return undefined;
					}
				});

			const webhookPayload = {
				NotificationUrl: {
					category: 'PAYMENT_CREATED',
					created: '2024-01-01T12:00:00Z',
					object: {
						id: 789,
						description: 'Monthly rent payment',
					}
				}
			};

			(mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue(webhookPayload);

			const result = await bunqTriggerNode.webhook.call(
				mockWebhookFunctions as IWebhookFunctions
			);

			// Should be filtered out due to description not containing 'invoice'
			expect(result.workflowData).toEqual([[]]);
		});

		it('should include raw data when requested', async () => {
			(mockWebhookFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((paramName) => {
					switch (paramName) {
						case 'events': return ['PAYMENT_CREATED'];
						case 'options': return {
							includeRawData: true
						};
						default: return undefined;
					}
				});

			const webhookPayload = {
				NotificationUrl: {
					category: 'PAYMENT_CREATED',
					object: { Payment: { id: 789 } }
				}
			};

			(mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue(webhookPayload);

			const result = await bunqTriggerNode.webhook.call(
				mockWebhookFunctions as IWebhookFunctions
			);

			expect(result.workflowData?.[0][0]).toHaveProperty('raw_webhook_data');
			expect(result.workflowData?.[0][0].raw_webhook_data).toEqual(webhookPayload);
		});

		it('should handle malformed webhook data', async () => {
			// Test with undefined bodyData to trigger error handling
			(mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue(undefined);

			const result = await bunqTriggerNode.webhook.call(
				mockWebhookFunctions as IWebhookFunctions
			);

			// When bodyData is undefined or not an object, it returns empty data
			expect(result.workflowData?.[0]?.[0]).toEqual({});
		});
	});
});