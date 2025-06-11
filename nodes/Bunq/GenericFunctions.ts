import { IRequestOptions } from 'n8n-workflow';
import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IDataObject,
	IHookFunctions,
	IWebhookFunctions,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';
import { createSign, generateKeyPairSync, randomBytes } from 'crypto';

export interface IBunqOAuth2Credentials {
	environment: 'production' | 'sandbox';
	clientId: string;
	clientSecret: string;
	apiKey: string;
	accessToken?: string;
	refreshToken?: string;
	oauthTokenData?: any;
}

export interface IBunqCredentials {
	environment: 'production' | 'sandbox';
	apiKey: string;
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

export function generateRequestId(): string {
	return randomBytes(16).toString('hex');
}

export function generateDeviceId(): string {
	return `n8n-bunq-${randomBytes(8).toString('hex')}`;
}

export function generateKeyPair(): { privateKey: string; publicKey: string } {
	const { privateKey, publicKey } = generateKeyPairSync('rsa', {
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

export function createRequestSignature(
	method: string,
	uri: string,
	headers: IDataObject,
	body: string,
	privateKey: string,
): string {
	const headersString = Object.keys(headers)
		.sort()
		.map(key => `${key}: ${headers[key]}`)
		.join('\n');

	const stringToSign = `${method}\n${uri}\n${headersString}\n\n${body}`;
	
	const sign = createSign('SHA256');
	sign.update(stringToSign);
	return sign.sign(privateKey, 'base64');
}

export async function bunqApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions,
	method: string,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	headers: IDataObject = {},
): Promise<any> {
	// Prioritize OAuth2 credentials, fall back to legacy API key credentials only if OAuth2 is not available
	let credentials: IBunqOAuth2Credentials | IBunqCredentials | null = null;
	let useOAuth = false;

	try {
		credentials = await this.getCredentials('bunqOAuth2Api') as IBunqOAuth2Credentials;
		useOAuth = true;
	} catch {
		try {
			credentials = await this.getCredentials('bunqApi') as IBunqCredentials;
			useOAuth = false;
		} catch {
			throw new NodeOperationError(this.getNode(), 'No valid bunq credentials found! Please configure OAuth2 credentials for the recommended authentication method.');
		}
	}
	
	if (!credentials) {
		throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
	}

	const baseUrl = getBunqApiUrl(credentials.environment);
	const uri = `${baseUrl}/v1${endpoint}`;
	const requestId = generateRequestId();
	
	const defaultHeaders: IDataObject = {
		'Content-Type': 'application/json',
		'X-Bunq-Language': 'en_US',
		'X-Bunq-Region': 'nl_NL',
		'X-Bunq-Client-Request-Id': requestId,
		'X-Bunq-Geolocation': '0 0 0 0 000',
		'User-Agent': 'n8n-bunq-integration/1.0.0',
		'Cache-Control': 'no-cache',
	};

	if (useOAuth) {
		// OAuth2 authentication
		const oauthCredentials = credentials as IBunqOAuth2Credentials;
		if (oauthCredentials.oauthTokenData?.access_token) {
			defaultHeaders['Authorization'] = `Bearer ${oauthCredentials.oauthTokenData.access_token}`;
		} else {
			throw new NodeOperationError(this.getNode(), 'OAuth2 credentials are configured but no access token is available. Please re-authenticate using the OAuth2 flow.');
		}
	} else {
		// Legacy API key authentication
		const legacyCredentials = credentials as IBunqCredentials;
		if (legacyCredentials.sessionToken) {
			defaultHeaders['X-Bunq-Client-Authentication'] = legacyCredentials.sessionToken;
		}
	}

	const requestHeaders = { ...defaultHeaders, ...headers };
	const bodyString = Object.keys(body).length > 0 ? JSON.stringify(body) : '';

	// Only add signature for legacy authentication
	if (!useOAuth) {
		const legacyCredentials = credentials as IBunqCredentials;
		if (legacyCredentials.privateKey && endpoint !== '/installation') {
			const signature = createRequestSignature(
				method.toUpperCase(),
				`/v1${endpoint}`,
				requestHeaders,
				bodyString,
				legacyCredentials.privateKey,
			);
			requestHeaders['X-Bunq-Client-Signature'] = signature;
		}
	}

	const options: IRequestOptions = {
		method: method as any,
		url: uri,
		body: bodyString,
		qs,
		headers: requestHeaders,
		json: false,
	};

	try {
		const response = await this.helpers.request(options);
		return response;
	} catch (error) {
		// If using OAuth2 and we get a 401, try to refresh the token once
		if (useOAuth && (error as any).statusCode === 401) {
			const oauthCredentials = credentials as IBunqOAuth2Credentials;
			if (oauthCredentials.oauthTokenData?.refresh_token) {
				try {
					const refreshedTokenData = await refreshOAuthToken.call(this, oauthCredentials.oauthTokenData.refresh_token);
					
					// Update the authorization header with the new access token
					requestHeaders['Authorization'] = `Bearer ${refreshedTokenData.access_token}`;
					
					// Retry the request with the new token
					const retryOptions: IRequestOptions = {
						...options,
						headers: requestHeaders,
					};
					
					const retryResponse = await this.helpers.request(retryOptions);
					return retryResponse;
				} catch (refreshError) {
					throw new NodeOperationError(this.getNode(), 'OAuth2 token refresh failed. Please re-authenticate using the OAuth2 flow.');
				}
			}
		}
		throw handleBunqError(this.getNode(), error, endpoint);
	}
}

export async function bunqApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: string,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<any[]> {
	const returnData: IDataObject[] = [];
	let responseData;
	
	qs.count = qs.count || 200;
	
	do {
		responseData = await bunqApiRequest.call(this, method, endpoint, body, qs);
		
		if (responseData.Response && Array.isArray(responseData.Response)) {
			returnData.push(...responseData.Response);
		}
		
		const pagination = responseData.Pagination;
		if (pagination && pagination.older_url) {
			const url = new URL(pagination.older_url);
			qs.older_id = url.searchParams.get('older_id');
		} else {
			break;
		}
	} while (true);

	return returnData;
}

export function handleBunqError(node: any, error: any, endpoint?: string): NodeApiError {
	if (error.statusCode) {
		const errorData = error.response?.body ? JSON.parse(error.response.body) : {};
		
		let message = `bunq API request failed with status ${error.statusCode}`;
		
		if (errorData.Error && errorData.Error.length > 0) {
			const bunqError = errorData.Error[0];
			message = `${bunqError.error_description || bunqError.error_description_translated || message}`;
		}
		
		if (endpoint) {
			message += ` (endpoint: ${endpoint})`;
		}

		return new NodeApiError(node, error, { message });
	}

	return new NodeApiError(node, error);
}

export async function validateCredentials(
	this: IExecuteFunctions | ILoadOptionsFunctions,
): Promise<boolean> {
	try {
		await bunqApiRequest.call(this, 'GET', '/user');
		return true;
	} catch {
		return false;
	}
}

export async function getOAuthAccessToken(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	authCode: string,
	redirectUri: string,
): Promise<any> {
	const credentials = await this.getCredentials('bunqOAuth2Api') as IBunqOAuth2Credentials;
	
	if (!credentials) {
		throw new NodeOperationError(this.getNode(), 'No OAuth2 credentials found!');
	}

	const baseUrl = getBunqApiUrl(credentials.environment);
	
	const tokenData = {
		grant_type: 'authorization_code',
		code: authCode,
		client_id: credentials.clientId,
		client_secret: credentials.clientSecret,
		redirect_uri: redirectUri,
	};

	const options: IRequestOptions = {
		method: 'POST',
		url: `${baseUrl}/v1/oauth/token`,
		form: tokenData,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'User-Agent': 'n8n-bunq-integration/1.0.0',
		},
	};

	try {
		const response = await this.helpers.request(options);
		return response;
	} catch (error) {
		throw handleBunqError(this.getNode(), error, '/oauth/token');
	}
}

export async function refreshOAuthToken(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions,
	refreshToken: string,
): Promise<any> {
	const credentials = await this.getCredentials('bunqOAuth2Api') as IBunqOAuth2Credentials;
	
	if (!credentials) {
		throw new NodeOperationError(this.getNode(), 'No OAuth2 credentials found!');
	}

	const baseUrl = getBunqApiUrl(credentials.environment);
	
	const tokenData = {
		grant_type: 'refresh_token',
		refresh_token: refreshToken,
		client_id: credentials.clientId,
		client_secret: credentials.clientSecret,
	};

	const options: IRequestOptions = {
		method: 'POST',
		url: `${baseUrl}/v1/oauth/token`,
		form: tokenData,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'User-Agent': 'n8n-bunq-integration/1.0.0',
		},
	};

	try {
		const response = await this.helpers.request(options);
		return response;
	} catch (error) {
		throw handleBunqError(this.getNode(), error, '/oauth/token');
	}
}

export async function bunqOAuthApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions,
	method: string,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	headers: IDataObject = {},
): Promise<any> {
	const credentials = await this.getCredentials('bunqOAuth2Api') as IBunqOAuth2Credentials;
	
	if (!credentials) {
		throw new NodeOperationError(this.getNode(), 'No OAuth2 credentials found!');
	}

	const baseUrl = getBunqApiUrl(credentials.environment);
	const uri = `${baseUrl}/v1${endpoint}`;
	const requestId = generateRequestId();
	
	const defaultHeaders: IDataObject = {
		'Content-Type': 'application/json',
		'X-Bunq-Language': 'en_US',
		'X-Bunq-Region': 'nl_NL',
		'X-Bunq-Client-Request-Id': requestId,
		'X-Bunq-Geolocation': '0 0 0 0 000',
		'User-Agent': 'n8n-bunq-integration/1.0.0',
		'Cache-Control': 'no-cache',
		...headers,
	};

	// Add OAuth Bearer token
	if (credentials.oauthTokenData?.access_token) {
		defaultHeaders['Authorization'] = `Bearer ${credentials.oauthTokenData.access_token}`;
	}

	const options: IRequestOptions = {
		method: method as any,
		url: uri,
		body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
		qs,
		headers: defaultHeaders,
		json: true,
	};

	try {
		const response = await this.helpers.request(options);
		return response;
	} catch (error) {
		throw handleBunqError(this.getNode(), error, endpoint);
	}
}

export function formatBunqResponse(response: any): IDataObject {
	if (!response || !response.Response) {
		return response;
	}

	if (Array.isArray(response.Response)) {
		return {
			...response,
			Response: response.Response.map((item: any) => {
				const key = Object.keys(item)[0];
				return {
					type: key,
					...item[key],
				};
			}),
		};
	}

	const key = Object.keys(response.Response)[0];
	return {
		...response,
		Response: {
			type: key,
			...response.Response[key],
		},
	};
}

export async function bunqApiRequestHook(
	this: IHookFunctions,
	method: string,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	headers: IDataObject = {},
): Promise<any> {
	return bunqApiRequest.call(this as any, method, endpoint, body, qs, headers);
}

export async function initializeBunqSessionHook(
	this: IHookFunctions,
): Promise<IBunqCredentials> {
	return initializeBunqSession.call(this as any);
}

export async function initializeBunqSession(
	this: IExecuteFunctions | ILoadOptionsFunctions,
): Promise<IBunqCredentials> {
	const credentials = await this.getCredentials('bunqApi') as IBunqCredentials;
	
	if (!credentials.privateKey || !credentials.publicKey) {
		const keyPair = generateKeyPair();
		credentials.privateKey = keyPair.privateKey;
		credentials.publicKey = keyPair.publicKey;
	}

	if (!credentials.deviceId) {
		credentials.deviceId = generateDeviceId();
	}

	if (!credentials.installationToken) {
		const installationResponse = await bunqApiRequest.call(
			this,
			'POST',
			'/installation',
			{
				client_public_key: credentials.publicKey,
			},
		);
		
		if (installationResponse.Response && installationResponse.Response.length > 1) {
			credentials.installationToken = installationResponse.Response[1].Token.token;
		}
	}

	if (!credentials.sessionToken) {
		await bunqApiRequest.call(
			this,
			'POST',
			'/device-server',
			{
				description: credentials.deviceId,
				secret: credentials.apiKey,
			},
			{},
			{
				'X-Bunq-Client-Authentication': credentials.installationToken,
			},
		);

		const sessionResponse = await bunqApiRequest.call(
			this,
			'POST',
			'/session-server',
			{
				secret: credentials.apiKey,
			},
			{},
			{
				'X-Bunq-Client-Authentication': credentials.installationToken,
			},
		);

		if (sessionResponse.Response && sessionResponse.Response.length > 1) {
			credentials.sessionToken = sessionResponse.Response[1].Token.token;
		}
	}

	return credentials;
}