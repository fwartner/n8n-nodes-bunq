import { INodeProperties } from 'n8n-workflow';

export const paymentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['payment'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new payment',
				action: 'Create a payment',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a payment',
				action: 'Get a payment',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all payments',
				action: 'List all payments',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a payment',
				action: 'Update a payment',
			},
		],
		default: 'create',
	},
];

export const paymentFields: INodeProperties[] = [
	// Common fields
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['payment'],
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
				resource: ['payment'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the monetary account to make the payment from',
	},

	// Payment ID for get/update operations
	{
		displayName: 'Payment ID',
		name: 'paymentId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['payment'],
				operation: ['get', 'update'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the payment',
	},

	// Create payment fields
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['payment'],
				operation: ['create'],
			},
		},
		default: '',
		required: true,
		description: 'The amount to transfer (e.g., "10.00")',
	},
	{
		displayName: 'Currency',
		name: 'currency',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['payment'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'EUR',
				value: 'EUR',
			},
			{
				name: 'USD',
				value: 'USD',
			},
			{
				name: 'GBP',
				value: 'GBP',
			},
		],
		default: 'EUR',
		required: true,
		description: 'The currency of the payment',
	},
	{
		displayName: 'Counterparty Type',
		name: 'counterpartyType',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['payment'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'IBAN',
				value: 'iban',
				description: 'Payment to IBAN account',
			},
			{
				name: 'Email',
				value: 'email',
				description: 'Payment to email address',
			},
			{
				name: 'Phone',
				value: 'phone',
				description: 'Payment to phone number',
			},
		],
		default: 'iban',
		required: true,
		description: 'Type of counterparty',
	},
	{
		displayName: 'IBAN',
		name: 'iban',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['payment'],
				operation: ['create'],
				counterpartyType: ['iban'],
			},
		},
		default: '',
		required: true,
		description: 'The IBAN of the recipient',
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['payment'],
				operation: ['create'],
				counterpartyType: ['email'],
			},
		},
		default: '',
		required: true,
		description: 'The email address of the recipient',
	},
	{
		displayName: 'Phone',
		name: 'phone',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['payment'],
				operation: ['create'],
				counterpartyType: ['phone'],
			},
		},
		default: '',
		required: true,
		description: 'The phone number of the recipient',
	},
	{
		displayName: 'Recipient Name',
		name: 'recipientName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['payment'],
				operation: ['create'],
			},
		},
		default: '',
		required: true,
		description: 'The name of the recipient',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['payment'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Payment description/reference',
	},

	// Update payment fields
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['payment'],
				operation: ['update'],
			},
		},
		options: [
			{
				name: 'REVOKED',
				value: 'REVOKED',
				description: 'Cancel the payment',
			},
		],
		default: 'REVOKED',
		description: 'New status for the payment',
	},

	// List payments fields
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['payment'],
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
				resource: ['payment'],
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