import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class BunqOAuth2Api implements ICredentialType {
	name = 'bunqOAuth2Api';
	extends = ['oAuth2Api'];
	displayName = 'bunq OAuth2 API';
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
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorizationCode',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden',
			default: '={{$self.environment === "production" ? "https://oauth.bunq.com/auth" : "https://oauth.sandbox.bunq.com/auth"}}',
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: '={{$self.environment === "production" ? "https://api.bunq.com/v1/oauth/token" : "https://public-api.sandbox.bunq.com/v1/oauth/token"}}',
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: 'account_info payments user_info',
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: 'response_type=code&state={{$randomString}}',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'body',
		},
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			required: true,
			default: '',
			description: 'Your bunq OAuth2 Client ID',
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			required: true,
			default: '',
			description: 'Your bunq OAuth2 Client Secret',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			required: true,
			default: '',
			description: 'Your bunq API key (still required for some operations)',
		},
	];
}