import { INodeProperties } from 'n8n-workflow';

export const monetaryAccountOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['monetaryAccount'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get a monetary account',
				action: 'Get a monetary account',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all monetary accounts',
				action: 'List all monetary accounts',
			},
		],
		default: 'list',
	},
];

export const monetaryAccountFields: INodeProperties[] = [
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['monetaryAccount'],
			},
		},
		default: '',
		description: 'The ID of the user. Leave empty to use current user.',
	},
	{
		displayName: 'Account ID',
		name: 'accountId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['monetaryAccount'],
				operation: ['get'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the monetary account to retrieve',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['monetaryAccount'],
				operation: ['list'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['monetaryAccount'],
				operation: ['list'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 200,
		},
		default: 50,
		description: 'Max number of results to return',
	},
];