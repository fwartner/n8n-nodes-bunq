import { IExecuteFunctions, IHookFunctions, IWebhookFunctions, IBinaryData, INode } from 'n8n-workflow';

/**
 * Creates a mock IExecuteFunctions for testing
 */
export function createMockExecuteFunctions(overrides: Partial<IExecuteFunctions> = {}): IExecuteFunctions {
	return {
		getInputData: jest.fn(() => [{ json: {} }]),
		getNodeParameter: jest.fn(),
		getCredentials: jest.fn(() => Promise.resolve({})),
		helpers: {
			returnJsonArray: jest.fn((data) => data),
			request: jest.fn(),
			assertBinaryData: jest.fn(),
			prepareBinaryData: jest.fn(),
			httpRequest: jest.fn(),
			httpRequestWithAuthentication: jest.fn(),
			requestWithAuthentication: jest.fn(),
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
		getContext: jest.fn(() => ({})),
		getExecuteData: jest.fn(),
		getInputConnectionData: jest.fn(),
		getItemIndex: jest.fn(() => 0),
		getMode: jest.fn(() => 'manual'),
		getNodeOutputs: jest.fn(),
		getParentCallbackManager: jest.fn(),
		getRestApiUrl: jest.fn(),
		getTimezone: jest.fn(() => 'UTC'),
		getWorkflow: jest.fn(),
		getWorkflowDataProxy: jest.fn(),
		getWorkflowStaticData: jest.fn(() => ({})),
		prepareOutputData: jest.fn((data) => data),
		putExecutionToWait: jest.fn(),
		sendMessageToUI: jest.fn(),
		sendResponse: jest.fn(),
		...overrides,
	} as IExecuteFunctions;
}

/**
 * Creates a mock IHookFunctions for testing webhooks
 */
export function createMockHookFunctions(overrides: Partial<IHookFunctions> = {}): IHookFunctions {
	return {
		getNodeWebhookUrl: jest.fn(() => 'https://test.n8n.io/webhook/test'),
		getNodeParameter: jest.fn(),
		getCredentials: jest.fn(() => Promise.resolve({})),
		getNode: jest.fn((): INode => ({
			id: 'test-hook-id',
			name: 'test-hook',
			typeVersion: 1,
			type: 'n8n-nodes-bunq.bunqTrigger',
			position: [0, 0],
			parameters: {},
		})),
		getContext: jest.fn(() => ({})),
		getMode: jest.fn(() => 'manual'),
		getTimezone: jest.fn(() => 'UTC'),
		getWorkflow: jest.fn(),
		getWorkflowStaticData: jest.fn(() => ({})),
		helpers: {
			httpRequest: jest.fn(),
			requestWithAuthentication: jest.fn(),
		} as any,
		...overrides,
	} as IHookFunctions;
}

/**
 * Creates a mock IWebhookFunctions for testing webhook processing
 */
export function createMockWebhookFunctions(overrides: Partial<IWebhookFunctions> = {}): IWebhookFunctions {
	return {
		getBodyData: jest.fn(),
		getHeaderData: jest.fn(() => ({})),
		getNodeParameter: jest.fn(),
		getNode: jest.fn((): INode => ({
		id: 'test-webhook-id',
		name: 'test-webhook',
		typeVersion: 1,
		type: 'n8n-nodes-bunq.bunqTrigger',
		position: [0, 0],
		parameters: {},
	})),
		getQueryData: jest.fn(() => ({})),
		getRequestObject: jest.fn(),
		getResponseObject: jest.fn(),
		getParamsData: jest.fn(() => ({})),
		helpers: {
			returnJsonArray: jest.fn((data) => data),
			httpRequest: jest.fn(),
			requestWithAuthentication: jest.fn(),
		} as any,
		getContext: jest.fn(() => ({})),
		getMode: jest.fn(() => 'manual'),
		getTimezone: jest.fn(() => 'UTC'),
		getWorkflow: jest.fn(),
		getWorkflowStaticData: jest.fn(() => ({})),
		...overrides,
	} as IWebhookFunctions;
}

/**
 * Creates mock binary data for testing file operations
 */
export function createMockBinaryData(overrides: Partial<IBinaryData> = {}): IBinaryData {
	return {
		data: Buffer.from('test file content').toString('base64'),
		mimeType: 'text/plain',
		fileName: 'test.txt',
		fileExtension: 'txt',
		...overrides,
	};
}

/**
 * Mock bunq API responses for testing
 */
export const mockBunqResponses = {
	user: {
		Response: [{
			User: {
				id: 1,
				created: '2024-01-01T00:00:00.000Z',
				updated: '2024-01-01T00:00:00.000Z',
				display_name: 'Test User',
				public_nick_name: 'test-user',
			}
		}]
	},

	monetaryAccount: {
		Response: [{
			MonetaryAccountBank: {
				id: 123,
				created: '2024-01-01T00:00:00.000Z',
				updated: '2024-01-01T00:00:00.000Z',
				description: 'Test Account',
				balance: {
					value: '1000.00',
					currency: 'EUR'
				},
				status: 'ACTIVE',
			}
		}]
	},

	payment: {
		Response: [{
			Payment: {
				id: 456,
				created: '2024-01-01T00:00:00.000Z',
				updated: '2024-01-01T00:00:00.000Z',
				amount: {
					value: '50.00',
					currency: 'EUR'
				},
				description: 'Test payment',
				status: 'ACCEPTED',
				counterparty_alias: {
					type: 'IBAN',
					value: 'NL91ABNA0417164300',
					name: 'Test Recipient'
				}
			}
		}]
	},

	card: {
		Response: [{
			Card: {
				id: 789,
				created: '2024-01-01T00:00:00.000Z',
				updated: '2024-01-01T00:00:00.000Z',
				name_on_card: 'Test User',
				status: 'ACTIVE',
				card_type: 'MAESTRO',
			}
		}]
	},

	webhook: {
		Response: [{
			NotificationFilterUrl: {
				id: 111,
				created: '2024-01-01T00:00:00.000Z',
				updated: '2024-01-01T00:00:00.000Z',
				notification_target: 'https://test.n8n.io/webhook/bunq',
				category: 'MUTATION',
			}
		}]
	},

	export: {
		Response: [{
			ExportStatement: {
				id: 222,
				created: '2024-01-01T00:00:00.000Z',
				updated: '2024-01-01T00:00:00.000Z',
				status: 'COMPLETED',
				statement_format: 'CSV',
				download_url: 'https://bunq.com/download/222',
			}
		}]
	},

	error: {
		Error: [{
			error_description: 'Test error message',
			error_description_translated: 'Translated test error'
		}]
	}
};

/**
 * Creates a mock webhook payload for testing
 */
export function createMockWebhookPayload(eventType: string, data: any = {}) {
	return {
		NotificationUrl: {
			category: eventType,
			created: '2024-01-01T12:00:00.000Z',
			object: data,
		}
	};
}

/**
 * Helper to test node parameter configurations
 */
export function testNodeParameter(
	properties: any[],
	parameterName: string,
	expectedConfig: any
) {
	const parameter = properties.find(prop => prop.name === parameterName);
	expect(parameter).toBeDefined();
	
	Object.keys(expectedConfig).forEach(key => {
		expect(parameter).toHaveProperty(key, expectedConfig[key]);
	});
}

/**
 * Helper to test resource operations
 */
export function testResourceOperations(
	properties: any[],
	resourceName: string,
	expectedOperations: string[]
) {
	const operationProperty = properties.find(
		prop => prop.name === 'operation' && 
		prop.displayOptions?.show?.resource?.includes(resourceName)
	);
	
	expect(operationProperty).toBeDefined();
	expect(operationProperty.options).toBeDefined();
	
	const operationValues = operationProperty.options.map((opt: any) => opt.value);
	expectedOperations.forEach(operation => {
		expect(operationValues).toContain(operation);
	});
}

/**
 * Helper to validate API call expectations
 */
export function expectApiCall(
	mockFunction: jest.Mock,
	method: string,
	endpoint: string,
	body?: any,
	queryParams?: any
) {
	if (body && queryParams) {
		expect(mockFunction).toHaveBeenCalledWith(method, endpoint, body, queryParams);
	} else if (body) {
		expect(mockFunction).toHaveBeenCalledWith(method, endpoint, body);
	} else if (queryParams) {
		expect(mockFunction).toHaveBeenCalledWith(method, endpoint, {}, queryParams);
	} else {
		expect(mockFunction).toHaveBeenCalledWith(method, endpoint);
	}
}

/**
 * Helper to test error handling scenarios
 */
export async function testErrorHandling(
	nodeExecuteFunction: Function,
	mockExecuteFunctions: IExecuteFunctions,
	mockApiFunction: jest.Mock,
	shouldContinue: boolean = false
) {
	const testError = new Error('Test API Error');
	mockApiFunction.mockRejectedValueOnce(testError);
	
	(mockExecuteFunctions.continueOnFail as jest.Mock).mockReturnValue(shouldContinue);

	if (shouldContinue) {
		const result = await nodeExecuteFunction.call(mockExecuteFunctions);
		expect(result).toEqual([[{ error: 'Test API Error' }]]);
	} else {
		await expect(nodeExecuteFunction.call(mockExecuteFunctions)).rejects.toThrow('Test API Error');
	}
}

// Add a basic test to satisfy Jest requirement
describe('Test Helpers', () => {
	it('should export helper functions', () => {
		expect(createMockExecuteFunctions).toBeDefined();
		expect(createMockHookFunctions).toBeDefined();
		expect(createMockWebhookFunctions).toBeDefined();
		expect(createMockBinaryData).toBeDefined();
		expect(testErrorHandling).toBeDefined();
	});
});

/**
 * Helper to create test credentials
 */
export function createTestCredentials() {
	return {
		environment: 'sandbox',
		apiKey: 'test-api-key',
		installationToken: 'test-installation-token',
		deviceId: 'n8n-bunq-test123456789abcdef',
		sessionToken: 'test-session-token',
		privateKey: 'test-private-key',
		publicKey: 'test-public-key',
	};
}