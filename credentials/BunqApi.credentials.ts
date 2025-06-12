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
			description: 'Your bunq API key - this is the only field you need to fill in',
		},
		{
			displayName: 'Show Advanced Options',
			name: 'showAdvanced',
			type: 'boolean',
			default: false,
			description: 'Show advanced options for debugging - normally you can leave this unchecked',
		},
		{
			displayName: 'Installation Token',
			name: 'installationToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Installation token - Generated automatically when using the node',
			displayOptions: {
				show: {
					'showAdvanced': [true],
				},
			},
		},
		{
			displayName: 'Device ID',
			name: 'deviceId',
			type: 'string',
			default: '',
			description: 'Device ID - Generated automatically when using the node',
			displayOptions: {
				show: {
					'showAdvanced': [true],
				},
			},
		},
		{
			displayName: 'Session Token',
			name: 'sessionToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Session token - Generated automatically when using the node',
			displayOptions: {
				show: {
					'showAdvanced': [true],
				},
			},
		},
		{
			displayName: 'Private Key',
			name: 'privateKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Private key for request signing - Generated automatically when using the node',
			displayOptions: {
				show: {
					'showAdvanced': [true],
				},
			},
		},
		{
			displayName: 'Public Key',
			name: 'publicKey',
			type: 'string',
			default: '',
			description: 'Public key for request signing - Generated automatically when using the node',
			displayOptions: {
				show: {
					'showAdvanced': [true],
				},
			},
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