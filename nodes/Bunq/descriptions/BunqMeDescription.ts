import { INodeProperties } from 'n8n-workflow';

export const bunqMeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['bunqMe'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a bunq.me payment link',
				action: 'Create a bunq.me payment link',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a bunq.me payment link',
				action: 'Get a bunq.me payment link',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all bunq.me payment links',
				action: 'List all bunq.me payment links',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a bunq.me payment link',
				action: 'Update a bunq.me payment link',
			},
		],
		default: 'create',
	},
];

export const bunqMeFields: INodeProperties[] = [
	// Common fields
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['bunqMe'],
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
				resource: ['bunqMe'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the monetary account',
	},

	// bunq.me ID for get/update operations
	{
		displayName: 'bunq.me ID',
		name: 'bunqMeId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['bunqMe'],
				operation: ['get', 'update'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the bunq.me payment link',
	},

	// Create bunq.me fields
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['bunqMe'],
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
				resource: ['bunqMe'],
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
		description: 'The currency of the payment request',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['bunqMe'],
				operation: ['create'],
			},
		},
		default: '',
		required: true,
		description: 'Description for the payment request',
	},

	// Optional create fields
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['bunqMe'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Redirect URL',
				name: 'redirectUrl',
				type: 'string',
				default: '',
				description: 'URL to redirect to after payment',
			},
			{
				displayName: 'Merchant Reference',
				name: 'merchantReference',
				type: 'string',
				default: '',
				description: 'Custom reference for the merchant',
			},
			{
				displayName: 'Expiry Time',
				name: 'expiryTime',
				type: 'dateTime',
				default: '',
				description: 'When the payment link should expire',
			},
			{
				displayName: 'Allow Amount Higher',
				name: 'allowAmountHigher',
				type: 'boolean',
				default: false,
				description: 'Whether to allow payments higher than the requested amount',
			},
			{
				displayName: 'Allow Amount Lower',
				name: 'allowAmountLower',
				type: 'boolean',
				default: false,
				description: 'Whether to allow payments lower than the requested amount',
			},
			{
				displayName: 'Want Tip',
				name: 'wantTip',
				type: 'boolean',
				default: false,
				description: 'Whether to allow tips on top of the amount',
			},
		],
	},

	// Update fields
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['bunqMe'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{
						name: 'WAITING_FOR_PAYMENT',
						value: 'WAITING_FOR_PAYMENT',
					},
					{
						name: 'CANCELLED',
						value: 'CANCELLED',
					},
				],
				default: 'WAITING_FOR_PAYMENT',
				description: 'New status for the bunq.me link',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Updated description',
			},
			{
				displayName: 'Redirect URL',
				name: 'redirectUrl',
				type: 'string',
				default: '',
				description: 'Updated redirect URL',
			},
			{
				displayName: 'Expiry Time',
				name: 'expiryTime',
				type: 'dateTime',
				default: '',
				description: 'Updated expiry time',
			},
		],
	},

	// List bunq.me fields
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['bunqMe'],
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
				resource: ['bunqMe'],
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
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['bunqMe'],
				operation: ['list'],
			},
		},
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{
						name: 'WAITING_FOR_PAYMENT',
						value: 'WAITING_FOR_PAYMENT',
					},
					{
						name: 'PAID',
						value: 'PAID',
					},
					{
						name: 'CANCELLED',
						value: 'CANCELLED',
					},
					{
						name: 'EXPIRED',
						value: 'EXPIRED',
					},
				],
				default: '',
				description: 'Filter by status',
			},
			{
				displayName: 'Created After',
				name: 'createdAfter',
				type: 'dateTime',
				default: '',
				description: 'Filter links created after this date',
			},
			{
				displayName: 'Created Before',
				name: 'createdBefore',
				type: 'dateTime',
				default: '',
				description: 'Filter links created before this date',
			},
			{
				displayName: 'Amount Min',
				name: 'amountMin',
				type: 'string',
				default: '',
				description: 'Filter by minimum amount',
			},
			{
				displayName: 'Amount Max',
				name: 'amountMax',
				type: 'string',
				default: '',
				description: 'Filter by maximum amount',
			},
		],
	},
];