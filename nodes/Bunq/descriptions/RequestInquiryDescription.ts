import { INodeProperties } from 'n8n-workflow';

export const requestInquiryOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['requestInquiry'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new payment request',
				action: 'Create a payment request',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a payment request',
				action: 'Get a payment request',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all payment requests',
				action: 'List all payment requests',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a payment request',
				action: 'Update a payment request',
			},
		],
		default: 'create',
	},
];

export const requestInquiryFields: INodeProperties[] = [
	// Common fields
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['requestInquiry'],
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
				resource: ['requestInquiry'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the monetary account',
	},

	// Request ID for get/update operations
	{
		displayName: 'Request ID',
		name: 'requestId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['requestInquiry'],
				operation: ['get', 'update'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the payment request',
	},

	// Create request fields
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['requestInquiry'],
				operation: ['create'],
			},
		},
		default: '',
		required: true,
		description: 'The amount to request (e.g., "10.00")',
	},
	{
		displayName: 'Currency',
		name: 'currency',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['requestInquiry'],
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
		description: 'The currency of the request',
	},
	{
		displayName: 'Counterparty Type',
		name: 'counterpartyType',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['requestInquiry'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'IBAN',
				value: 'iban',
				description: 'Request from IBAN account',
			},
			{
				name: 'Email',
				value: 'email',
				description: 'Request from email address',
			},
			{
				name: 'Phone',
				value: 'phone',
				description: 'Request from phone number',
			},
		],
		default: 'email',
		required: true,
		description: 'Type of counterparty to request from',
	},
	{
		displayName: 'IBAN',
		name: 'iban',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['requestInquiry'],
				operation: ['create'],
				counterpartyType: ['iban'],
			},
		},
		default: '',
		required: true,
		description: 'The IBAN of the debtor',
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['requestInquiry'],
				operation: ['create'],
				counterpartyType: ['email'],
			},
		},
		default: '',
		required: true,
		description: 'The email address of the debtor',
	},
	{
		displayName: 'Phone',
		name: 'phone',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['requestInquiry'],
				operation: ['create'],
				counterpartyType: ['phone'],
			},
		},
		default: '',
		required: true,
		description: 'The phone number of the debtor',
	},
	{
		displayName: 'Debtor Name',
		name: 'debtorName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['requestInquiry'],
				operation: ['create'],
			},
		},
		default: '',
		required: true,
		description: 'The name of the debtor',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['requestInquiry'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Request description/reference',
	},
	{
		displayName: 'Allow Bunqme',
		name: 'allowBunqme',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['requestInquiry'],
				operation: ['create'],
			},
		},
		default: true,
		description: 'Whether to allow payment via bunq.me',
	},

	// Update request fields
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['requestInquiry'],
				operation: ['update'],
			},
		},
		options: [
			{
				name: 'REVOKED',
				value: 'REVOKED',
				description: 'Cancel the payment request',
			},
		],
		default: 'REVOKED',
		description: 'New status for the payment request',
	},

	// List requests fields
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['requestInquiry'],
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
				resource: ['requestInquiry'],
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