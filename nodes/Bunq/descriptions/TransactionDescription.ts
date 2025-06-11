import { INodeProperties } from 'n8n-workflow';

export const transactionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['transaction'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get a transaction',
				action: 'Get a transaction',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all transactions',
				action: 'List all transactions',
			},
		],
		default: 'list',
	},
];

export const transactionFields: INodeProperties[] = [
	// Common fields
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['transaction'],
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
				resource: ['transaction'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the monetary account',
	},

	// Transaction ID for get operation
	{
		displayName: 'Transaction ID',
		name: 'transactionId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['get'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the transaction',
	},

	// List transactions fields
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['transaction'],
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
				resource: ['transaction'],
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

	// Additional options for filtering
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['list'],
			},
		},
		options: [
			{
				displayName: 'From Date',
				name: 'fromDate',
				type: 'dateTime',
				default: '',
				description: 'Filter transactions from this date',
			},
			{
				displayName: 'To Date',
				name: 'toDate',
				type: 'dateTime',
				default: '',
				description: 'Filter transactions until this date',
			},
			{
				displayName: 'Min Amount',
				name: 'minAmount',
				type: 'string',
				default: '',
				description: 'Filter transactions with minimum amount',
			},
			{
				displayName: 'Max Amount',
				name: 'maxAmount',
				type: 'string',
				default: '',
				description: 'Filter transactions with maximum amount',
			},
		],
	},
];