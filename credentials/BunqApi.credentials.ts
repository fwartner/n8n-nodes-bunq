import {
	IAuthenticateGeneric,
	ICredentialType,
	ICredentialTestRequest,
	INodeProperties,
} from 'n8n-workflow';

export class BunqApi implements ICredentialType {
	name = 'bunqApi';
	displayName = 'bunq API';
	documentationUrl = 'https://doc.bunq.com/';
	properties: INodeProperties[] = [
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{
					name: 'Production',
					value: 'production',
				},
				{
					name: 'Sandbox',
					value: 'sandbox',
				},
			],
			default: 'sandbox',
			description: 'Choose between bunq production or sandbox environment',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your bunq API key',
		},
		{
			displayName: 'Installation Token',
			name: 'installationToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Installation token - Leave empty to generate automatically when using the node',
		},
		{
			displayName: 'Device ID',
			name: 'deviceId',
			type: 'string',
			default: '',
			description: 'Device ID - Leave empty to generate automatically when using the node',
		},
		{
			displayName: 'Session Token',
			name: 'sessionToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Session token - Leave empty to generate automatically when using the node',
		},
		{
			displayName: 'Private Key',
			name: 'privateKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Private key for request signing - Leave empty to generate automatically when using the node',
		},
		{
			displayName: 'Public Key',
			name: 'publicKey',
			type: 'string',
			default: '',
			description: 'Public key for request signing - Leave empty to generate automatically when using the node',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-Bunq-Language': 'en_US',
				'X-Bunq-Region': 'nl_NL',
				'X-Bunq-Client-Request-Id': '={{$randomString}}',
				'X-Bunq-Geolocation': '0 0 0 0 000',
				'X-Bunq-Client-Authentication': '={{$credentials.sessionToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.environment === "production" ? "https://api.bunq.com" : "https://public-api.sandbox.bunq.com"}}',
			url: '/v1/user',
			method: 'GET' as const,
		},
	};

}