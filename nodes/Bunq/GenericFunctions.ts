import { IRequestOptions, IHttpRequestMethods } from 'n8n-workflow';
import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IDataObject,
	IHookFunctions,
	IWebhookFunctions,
	NodeApiError,
} from 'n8n-workflow';
import * as crypto from 'crypto';

export interface IBunqOAuth2Credentials {
	environment: 'production' | 'sandbox';
	clientId: string;
	clientSecret: string;
}

export function getBunqApiUrl(environment: string): string {
	return environment === 'production'
		? 'https://api.bunq.com'
		: 'https://public-api.sandbox.bunq.com';
}

/**
 * Make an authenticated API request to bunq using OAuth2
 */
export async function bunqApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	headers: IDataObject = {},
): Promise<IDataObject> {
	const credentials = await this.getCredentials('bunqOAuth2Api') as IBunqOAuth2Credentials;
	const baseUrl = getBunqApiUrl(credentials.environment);
	
	// Ensure endpoint starts with /v1/
	const apiEndpoint = endpoint.startsWith('/v1/') ? endpoint : `/v1${endpoint}`;
	const url = `${baseUrl}${apiEndpoint}`;

	const options: IRequestOptions = {
		method,
		url,
		body: Object.keys(body).length > 0 ? body : undefined,
		qs,
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'no-cache',
			'User-Agent': 'n8n-bunq-node',
			...headers,
		},
		json: true,
	};

	try {
		// Use n8n's built-in OAuth2 authentication
		const response = await this.helpers.requestWithAuthentication.call(this, 'bunqOAuth2Api', options);
		return response as IDataObject;
	} catch (error) {
		throw handleBunqError(this.getNode(), error as NodeApiError | Error, endpoint);
	}
}

/**
 * Make API requests that return all items (handles pagination)
 */
export async function bunqApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<IDataObject[]> {
	const items: IDataObject[] = [];
	let responseData: IDataObject;
	
	qs.count = qs.count || 200; // Default pagination size
	let older_id: string | undefined;

	do {
		if (older_id) {
			qs.older_id = older_id;
		}
		
		responseData = await bunqApiRequest.call(this, method, endpoint, body, qs);
		
		if (responseData.Response && Array.isArray(responseData.Response)) {
			items.push(...responseData.Response);
			
			// Get the ID of the last item for pagination
			const lastItem = responseData.Response[responseData.Response.length - 1];
			if (lastItem && typeof lastItem === 'object') {
				const lastItemData = Object.values(lastItem)[0] as IDataObject;
				older_id = lastItemData?.id as string;
			}
			
			// If we got fewer items than requested, we've reached the end
			if (responseData.Response.length < (qs.count as number)) {
				break;
			}
		} else {
			break;
		}
	} while (responseData.Response && responseData.Response.length > 0);

	return items;
}

/**
 * Handle bunq-specific errors
 */
export function handleBunqError(node: any, error: NodeApiError | Error, endpoint?: string): NodeApiError {
	if (error instanceof NodeApiError) {
		return error;
	}

	let errorMessage = 'bunq API request failed';
	if (endpoint) {
		errorMessage += ` for endpoint: ${endpoint}`;
	}

	// Check if it's a bunq API error with response body
	if ('statusCode' in error && 'response' in error) {
		const apiError = error as any;
		errorMessage = `bunq API request failed with status ${apiError.statusCode}`;
		
		if (endpoint) {
			errorMessage += ` for endpoint: ${endpoint}`;
		}

		// Try to parse bunq error details
		if (apiError.response && apiError.response.body) {
			try {
				const errorBody = typeof apiError.response.body === 'string' 
					? JSON.parse(apiError.response.body) 
					: apiError.response.body;
				
				if (errorBody.Error && Array.isArray(errorBody.Error) && errorBody.Error.length > 0) {
					const bunqError = errorBody.Error[0];
					const description = bunqError.error_description_translated || bunqError.error_description;
					if (description) {
						errorMessage += `: ${description}`;
					}
				}
			} catch {
				// Ignore JSON parsing errors
			}
		}
	} else if (error.message) {
		errorMessage += `: ${error.message}`;
	}

	return new NodeApiError(node, { message: errorMessage });
}

/**
 * Format bunq API response for consistent output
 */
export function formatBunqResponse(response: IDataObject): IDataObject {
	if (!response) {
		return {};
	}

	// If response contains bunq's standard Response wrapper, format it
	if (response.Response && Array.isArray(response.Response)) {
		return {
			...response,
			Response: (response.Response as IDataObject[]).map((item: IDataObject) => {
				// bunq responses typically have a single key with the actual data
				const keys = Object.keys(item);
				if (keys.length === 1) {
					const dataKey = keys[0];
					const itemData = item[dataKey] as IDataObject;
					return {
						type: dataKey,
						...itemData,
					};
				}
				return item;
			}),
		};
	}

	// For single item responses
	if (response.Response && !Array.isArray(response.Response)) {
		const responseData = response.Response as IDataObject;
		const keys = Object.keys(responseData);
		if (keys.length === 1) {
			const dataKey = keys[0];
			const itemData = responseData[dataKey] as IDataObject;
			return {
				...response,
				Response: {
					type: dataKey,
					...itemData,
				},
			};
		}
	}

	return response;
}

/**
 * OAuth2-specific API request for hooks/webhooks
 */
export async function bunqApiRequestHook(
	this: IHookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<IDataObject> {
	return bunqApiRequest.call(this, method, endpoint, body, qs);
}

/**
 * Validate OAuth2 credentials
 */
export async function validateOAuth2Credentials(
	this: IExecuteFunctions | ILoadOptionsFunctions,
): Promise<boolean> {
	try {
		const response = await bunqApiRequest.call(this, 'GET', '/user');
		return !!(response.Response && Array.isArray(response.Response) && response.Response.length > 0);
	} catch {
		return false;
	}
}

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
	return crypto.randomBytes(16).toString('hex');
}

/**
 * Generate a device ID for bunq API
 */
export function generateDeviceId(): string {
	return `n8n-bunq-${crypto.randomBytes(8).toString('hex')}`;
}

/**
 * Generate RSA key pair for bunq API authentication
 */
export function generateKeyPair(): { privateKey: string; publicKey: string } {
	const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
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

	return { privateKey, publicKey };
}

/**
 * Create request signature for bunq API
 */
export function createRequestSignature(
	method: string,
	path: string,
	headers: Record<string, string>,
	body: string,
	privateKey: string,
): string {
	// Create the string to sign
	const headersString = Object.entries(headers)
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([key, value]) => `${key}: ${value}`)
		.join('\n');

	const stringToSign = `${method} ${path}\n${headersString}\n\n${body}`;

	// Create signature
	const sign = crypto.createSign('SHA256');
	sign.update(stringToSign);
	sign.end();

	const signature = sign.sign(privateKey, 'base64');
	return signature;
}