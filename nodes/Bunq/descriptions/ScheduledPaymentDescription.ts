import { INodeProperties } from 'n8n-workflow';

export const scheduledPaymentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['scheduledPayment'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a scheduled payment',
				action: 'Create a scheduled payment',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a scheduled payment',
				action: 'Get a scheduled payment',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all scheduled payments',
				action: 'List all scheduled payments',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a scheduled payment',
				action: 'Update a scheduled payment',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a scheduled payment',
				action: 'Delete a scheduled payment',
			},
		],
		default: 'create',
	},
];

export const scheduledPaymentFields: INodeProperties[] = [
	// Common fields
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['scheduledPayment'],
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
				resource: ['scheduledPayment'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the monetary account',
	},

	// Scheduled Payment ID for get/update/delete operations
	{
		displayName: 'Scheduled Payment ID',
		name: 'scheduledPaymentId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['scheduledPayment'],
				operation: ['get', 'update', 'delete'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the scheduled payment',
	},

	// Create scheduled payment fields
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['scheduledPayment'],
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
				resource: ['scheduledPayment'],
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
				resource: ['scheduledPayment'],
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
				resource: ['scheduledPayment'],
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
				resource: ['scheduledPayment'],
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
				resource: ['scheduledPayment'],
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
				resource: ['scheduledPayment'],
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
				resource: ['scheduledPayment'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Payment description/reference',
	},

	// Schedule settings
	{
		displayName: 'Schedule Type',
		name: 'scheduleType',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['scheduledPayment'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'Once',
				value: 'ONCE',
				description: 'Execute once at a specific date/time',
			},
			{
				name: 'Daily',
				value: 'DAILY',
				description: 'Execute daily',
			},
			{
				name: 'Weekly',
				value: 'WEEKLY',
				description: 'Execute weekly',
			},
			{
				name: 'Monthly',
				value: 'MONTHLY',
				description: 'Execute monthly',
			},
			{
				name: 'Yearly',
				value: 'YEARLY',
				description: 'Execute yearly',
			},
		],
		default: 'MONTHLY',
		required: true,
		description: 'How often the payment should be executed',
	},
	{
		displayName: 'Start Date',
		name: 'startDate',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['scheduledPayment'],
				operation: ['create'],
			},
		},
		default: '',
		required: true,
		description: 'When to start executing the scheduled payment',
	},
	{
		displayName: 'End Date',
		name: 'endDate',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['scheduledPayment'],
				operation: ['create'],
				scheduleType: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'],
			},
		},
		default: '',
		description: 'When to stop executing the scheduled payment (optional)',
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
				resource: ['scheduledPayment'],
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
						name: 'Active',
						value: 'ACTIVE',
					},
					{
						name: 'Paused',
						value: 'PAUSED',
					},
					{
						name: 'Cancelled',
						value: 'CANCELLED',
					},
				],
				default: 'ACTIVE',
				description: 'New status for the scheduled payment',
			},
			{
				displayName: 'Amount',
				name: 'amount',
				type: 'string',
				default: '',
				description: 'Updated payment amount',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Updated payment description',
			},
			{
				displayName: 'End Date',
				name: 'endDate',
				type: 'dateTime',
				default: '',
				description: 'Updated end date for the schedule',
			},
		],
	},

	// List scheduled payments fields
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['scheduledPayment'],
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
				resource: ['scheduledPayment'],
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

	// Filters for listing
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['scheduledPayment'],
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
						name: 'Active',
						value: 'ACTIVE',
					},
					{
						name: 'Paused',
						value: 'PAUSED',
					},
					{
						name: 'Cancelled',
						value: 'CANCELLED',
					},
					{
						name: 'Finished',
						value: 'FINISHED',
					},
				],
				default: '',
				description: 'Filter by status',
			},
			{
				displayName: 'Schedule Type',
				name: 'scheduleType',
				type: 'options',
				options: [
					{
						name: 'Once',
						value: 'ONCE',
					},
					{
						name: 'Daily',
						value: 'DAILY',
					},
					{
						name: 'Weekly',
						value: 'WEEKLY',
					},
					{
						name: 'Monthly',
						value: 'MONTHLY',
					},
					{
						name: 'Yearly',
						value: 'YEARLY',
					},
				],
				default: '',
				description: 'Filter by schedule type',
			},
		],
	},
];