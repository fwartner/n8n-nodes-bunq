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

export interface IBunqApiCredentials {
	environment: 'production' | 'sandbox';
	apiKey: string;
	showAdvanced?: boolean;
	installationToken?: string;
	deviceId?: string;
	sessionToken?: string;
	privateKey?: string;
	publicKey?: string;
}

export function getBunqApiUrl(environment: string): string {
	return environment === 'production'
		? 'https://api.bunq.com'
		: 'https://public-api.sandbox.bunq.com';
}

/**
 * Initialize bunq API session if needed
 */
export async function initializeBunqSession(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions,
): Promise<IBunqApiCredentials> {
	let credentials: IBunqApiCredentials;
	
	try {
		credentials = await this.getCredentials('bunqApi') as IBunqApiCredentials;
	} catch {
		throw new NodeApiError(this.getNode(), { message: 'bunq API credentials are required' });
	}
	
	// Generate key pair if not exists
	if (!credentials.privateKey || !credentials.publicKey) {
		const keyPair = generateKeyPair();
		credentials.privateKey = keyPair.privateKey;
		credentials.publicKey = keyPair.publicKey;
	}
	
	// Generate device ID if not exists
	if (!credentials.deviceId) {
		credentials.deviceId = generateDeviceId();
	}
	
	// Create installation if token doesn't exist
	if (!credentials.installationToken) {
		credentials.installationToken = await createInstallation.call(this, credentials);
	}
	
	// Create session if token doesn't exist or expired
	if (!credentials.sessionToken) {
		credentials.sessionToken = await createSession.call(this, credentials);
	}
	
	return credentials;
}

/**
 * Create installation for bunq API
 */
async function createInstallation(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions,
	credentials: IBunqApiCredentials,
): Promise<string> {
	const baseUrl = getBunqApiUrl(credentials.environment);
	const requestId = generateRequestId();
	
	const installationData = {
		client_public_key: credentials.publicKey,
	};
	
	const options: IRequestOptions = {
		method: 'POST',
		url: `${baseUrl}/v1/installation`,
		body: installationData,
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'no-cache',
			'User-Agent': 'n8n-bunq-node/1.0.0',
			'X-Bunq-Language': 'en_US',
			'X-Bunq-Region': 'nl_NL',
			'X-Bunq-Client-Request-Id': requestId,
			'X-Bunq-Geolocation': '0 0 0 0 000',
		},
		json: true,
	};
	
	try {
		const response = await this.helpers.request(options) as IDataObject;
		
		if (response.Response && Array.isArray(response.Response)) {
			// Find the installation token
			for (const item of response.Response) {
				if (item.Token) {
					const token = item.Token as IDataObject;
					return token.token as string;
				}
			}
		}
		
		throw new Error('Installation token not found in response');
	} catch (error) {
		throw handleBunqError(this.getNode(), error as NodeApiError | Error, '/v1/installation');
	}
}

/**
 * Create session for bunq API
 */
async function createSession(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions,
	credentials: IBunqApiCredentials,
): Promise<string> {
	const baseUrl = getBunqApiUrl(credentials.environment);
	const requestId = generateRequestId();
	
	const sessionData = {
		secret: credentials.apiKey,
	};
	
	const body = JSON.stringify(sessionData);
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		'Cache-Control': 'no-cache',
		'User-Agent': 'n8n-bunq-node/1.0.0',
		'X-Bunq-Language': 'en_US',
		'X-Bunq-Region': 'nl_NL',
		'X-Bunq-Client-Request-Id': requestId,
		'X-Bunq-Geolocation': '0 0 0 0 000',
		'X-Bunq-Client-Authentication': credentials.installationToken || '',
	};
	
	// Create signature
	const signature = createRequestSignature('POST', '/v1/session-server', headers, body, credentials.privateKey || '');
	headers['X-Bunq-Client-Signature'] = signature;
	
	const options: IRequestOptions = {
		method: 'POST',
		url: `${baseUrl}/v1/session-server`,
		body: sessionData,
		headers,
		json: true,
	};
	
	try {
		const response = await this.helpers.request(options) as IDataObject;
		
		if (response.Response && Array.isArray(response.Response)) {
			// Find the session token
			for (const item of response.Response) {
				if (item.Token) {
					const token = item.Token as IDataObject;
					return token.token as string;
				}
			}
		}
		
		throw new Error('Session token not found in response');
	} catch (error) {
		throw handleBunqError(this.getNode(), error as NodeApiError | Error, '/v1/session-server');
	}
}

/**
 * Make an authenticated API request to bunq
 */
export async function bunqApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	headers: IDataObject = {},
): Promise<IDataObject> {
	const credentials = await initializeBunqSession.call(this);
	const baseUrl = getBunqApiUrl(credentials.environment);
	
	// Ensure endpoint starts with /v1/
	const apiEndpoint = endpoint.startsWith('/v1/') ? endpoint : `/v1${endpoint}`;
	const url = `${baseUrl}${apiEndpoint}`;

	// Generate request ID for bunq API requirements
	const requestId = generateRequestId();
	
	const requestBody = Object.keys(body).length > 0 ? JSON.stringify(body) : '';
	const requestHeaders: Record<string, string> = {
		'Content-Type': 'application/json',
		'Cache-Control': 'no-cache',
		'User-Agent': 'n8n-bunq-node/1.0.0',
		'X-Bunq-Language': 'en_US',
		'X-Bunq-Region': 'nl_NL',
		'X-Bunq-Client-Request-Id': requestId,
		'X-Bunq-Geolocation': '0 0 0 0 000',
		'X-Bunq-Client-Authentication': credentials.sessionToken || '',
		...headers as Record<string, string>,
	};
	
	// Create signature for the request
	const signature = createRequestSignature(method, apiEndpoint, requestHeaders, requestBody, credentials.privateKey || '');
	requestHeaders['X-Bunq-Client-Signature'] = signature;

	const options: IRequestOptions = {
		method,
		url,
		body: Object.keys(body).length > 0 ? body : undefined,
		qs,
		headers: requestHeaders,
		json: true,
	};

	try {
		const response = await this.helpers.request(options) as IDataObject;
		return formatBunqResponse(response);
	} catch (error) {
		// If session expired, try to create a new session and retry once
		if (isSessionExpiredError(error)) {
			try {
				credentials.sessionToken = await createSession.call(this, credentials);
				requestHeaders['X-Bunq-Client-Authentication'] = credentials.sessionToken;
				const newSignature = createRequestSignature(method, apiEndpoint, requestHeaders, requestBody, credentials.privateKey || '');
				requestHeaders['X-Bunq-Client-Signature'] = newSignature;
				options.headers = requestHeaders;
				
				const retryResponse = await this.helpers.request(options) as IDataObject;
				return formatBunqResponse(retryResponse);
			} catch (retryError) {
				throw handleBunqError(this.getNode(), retryError as NodeApiError | Error, endpoint);
			}
		}
		
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
export function handleBunqError(node: { name: string }, error: NodeApiError | Error, endpoint?: string): NodeApiError {
	if (error instanceof NodeApiError) {
		return error;
	}

	let errorMessage = 'bunq API request failed';
	if (endpoint) {
		errorMessage += ` for endpoint: ${endpoint}`;
	}

	// Check if it's a bunq API error with response body
	if ('statusCode' in error && 'response' in error) {
		const apiError = error as { statusCode: number; response?: { body?: string | object } };
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

	// Create a minimal INode-compatible object for NodeApiError
	const nodeForError = {
		id: 'unknown',
		name: node.name,
		type: 'n8n-nodes-bunq.bunq',
		typeVersion: 1,
		position: [0, 0] as [number, number],
		parameters: {}
	};

	return new NodeApiError(nodeForError, { message: errorMessage });
}

/**
 * Check if error is session expired
 */
function isSessionExpiredError(error: unknown): boolean {
	if (error && typeof error === 'object' && 'statusCode' in error && (error as { statusCode: number }).statusCode === 401) {
		return true;
	}
	
	if (error && typeof error === 'object' && 'response' in error && (error as { response?: { body?: string | object } }).response?.body) {
		try {
			const typedError = error as { response: { body: string | object } };
			const errorBody = typeof typedError.response.body === 'string' 
				? JSON.parse(typedError.response.body) 
				: typedError.response.body;
			
			if (errorBody.Error && Array.isArray(errorBody.Error)) {
				return errorBody.Error.some((err: { error_description?: string }) => 
					err.error_description && err.error_description.includes('session')
				);
			}
		} catch {
			// Ignore parsing errors
		}
	}
	
	return false;
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
 * API request for hooks/webhooks
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
 * Validate API credentials
 */
export async function validateApiCredentials(
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