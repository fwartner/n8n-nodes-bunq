import { INodeProperties } from 'n8n-workflow';

export const webhookOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['webhook'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a webhook notification filter',
				action: 'Create a webhook notification filter',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a webhook notification filter',
				action: 'Get a webhook notification filter',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all webhook notification filters',
				action: 'List all webhook notification filters',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a webhook notification filter',
				action: 'Update a webhook notification filter',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a webhook notification filter',
				action: 'Delete a webhook notification filter',
			},
		],
		default: 'create',
	},
];

export const webhookFields: INodeProperties[] = [
	// Common fields
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['webhook'],
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
				resource: ['webhook'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the monetary account',
	},

	// Webhook ID for get/update/delete operations
	{
		displayName: 'Webhook ID',
		name: 'webhookId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['get', 'update', 'delete'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the webhook notification filter',
	},

	// Create webhook fields
	{
		displayName: 'Notification Target URL',
		name: 'notificationTarget',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['create'],
			},
		},
		default: '',
		required: true,
		description: 'The URL where notifications will be sent',
	},
	{
		displayName: 'Event Types',
		name: 'eventTypes',
		type: 'multiOptions',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'Payment Created',
				value: 'PAYMENT_CREATED',
			},
			{
				name: 'Payment Updated',
				value: 'PAYMENT_UPDATED',
			},
			{
				name: 'Request Inquiry Created',
				value: 'REQUEST_INQUIRY_CREATED',
			},
			{
				name: 'Request Inquiry Updated',
				value: 'REQUEST_INQUIRY_UPDATED',
			},
			{
				name: 'Card Transaction Created',
				value: 'CARD_TRANSACTION_CREATED',
			},
			{
				name: 'bunq.me Payment',
				value: 'BUNQME_PAYMENT',
			},
			{
				name: 'Mutation Created',
				value: 'MUTATION_CREATED',
			},
			{
				name: 'Card Transaction Failed',
				value: 'CARD_TRANSACTION_FAILED',
			},
			{
				name: 'Card Transaction Successful',
				value: 'CARD_TRANSACTION_SUCCESSFUL',
			},
		],
		default: ['MUTATION_CREATED'],
		required: true,
		description: 'The types of events to listen for',
	},

	// Update webhook fields
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Notification Target URL',
				name: 'notificationTarget',
				type: 'string',
				default: '',
				description: 'Updated URL where notifications will be sent',
			},
			{
				displayName: 'Event Types',
				name: 'eventTypes',
				type: 'multiOptions',
				options: [
					{
						name: 'Payment Created',
						value: 'PAYMENT_CREATED',
					},
					{
						name: 'Payment Updated',
						value: 'PAYMENT_UPDATED',
					},
					{
						name: 'Request Inquiry Created',
						value: 'REQUEST_INQUIRY_CREATED',
					},
					{
						name: 'Request Inquiry Updated',
						value: 'REQUEST_INQUIRY_UPDATED',
					},
					{
						name: 'Card Transaction Created',
						value: 'CARD_TRANSACTION_CREATED',
					},
					{
						name: 'bunq.me Payment',
						value: 'BUNQME_PAYMENT',
					},
					{
						name: 'Mutation Created',
						value: 'MUTATION_CREATED',
					},
				],
				default: [],
				description: 'Updated event types to listen for',
			},
		],
	},

	// List webhooks fields
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['webhook'],
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
				resource: ['webhook'],
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

	// Additional options
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Category',
				name: 'category',
				type: 'options',
				options: [
					{
						name: 'Mutation',
						value: 'MUTATION',
					},
					{
						name: 'Request',
						value: 'REQUEST',
					},
					{
						name: 'Schedule',
						value: 'SCHEDULE',
					},
				],
				default: 'MUTATION',
				description: 'The category of notifications',
			},
			{
				displayName: 'Include All Monetary Accounts',
				name: 'allMonetaryAccounts',
				type: 'boolean',
				default: false,
				description: 'Whether to include notifications for all monetary accounts',
			},
		],
	},
];