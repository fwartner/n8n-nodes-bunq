import { INodeProperties } from 'n8n-workflow';

export const cardOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['card'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get a card',
				action: 'Get a card',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all cards',
				action: 'List all cards',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update card settings',
				action: 'Update card settings',
			},
			{
				name: 'Set Limits',
				value: 'setLimits',
				description: 'Set card spending limits',
				action: 'Set card spending limits',
			},
			{
				name: 'Get Limits',
				value: 'getLimits',
				description: 'Get card spending limits',
				action: 'Get card spending limits',
			},
		],
		default: 'list',
	},
];

export const cardFields: INodeProperties[] = [
	// Common fields
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['card'],
			},
		},
		default: '',
		description: 'The ID of the user. Leave empty to use current user.',
	},

	// Card ID for get/update operations
	{
		displayName: 'Card ID',
		name: 'cardId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['card'],
				operation: ['get', 'update', 'setLimits', 'getLimits'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the card',
	},

	// Update card fields
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['card'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'PIN Code',
				name: 'pinCode',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				description: 'New 4-digit PIN code for the card',
			},
			{
				displayName: 'Activation Code',
				name: 'activationCode',
				type: 'string',
				default: '',
				description: 'Card activation code (for new cards)',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{
						name: 'ACTIVE',
						value: 'ACTIVE',
					},
					{
						name: 'DEACTIVATED',
						value: 'DEACTIVATED',
					},
					{
						name: 'LOST',
						value: 'LOST',
					},
					{
						name: 'STOLEN',
						value: 'STOLEN',
					},
					{
						name: 'EXPIRED',
						value: 'EXPIRED',
					},
				],
				default: 'ACTIVE',
				description: 'New status for the card',
			},
			{
				displayName: 'Card Name',
				name: 'cardName',
				type: 'string',
				default: '',
				description: 'Custom name for the card',
			},
		],
	},

	// Set limits fields
	{
		displayName: 'Limit Type',
		name: 'limitType',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['card'],
				operation: ['setLimits'],
			},
		},
		options: [
			{
				name: 'ATM Daily',
				value: 'CARD_LIMIT_ATM_DAILY',
				description: 'Daily ATM withdrawal limit',
			},
			{
				name: 'ATM Monthly',
				value: 'CARD_LIMIT_ATM_MONTHLY',
				description: 'Monthly ATM withdrawal limit',
			},
			{
				name: 'POS Daily',
				value: 'CARD_LIMIT_POS_DAILY',
				description: 'Daily POS spending limit',
			},
			{
				name: 'POS Monthly',
				value: 'CARD_LIMIT_POS_MONTHLY',
				description: 'Monthly POS spending limit',
			},
			{
				name: 'Purchase Daily',
				value: 'CARD_LIMIT_PURCHASE_DAILY',
				description: 'Daily purchase limit',
			},
			{
				name: 'Purchase Monthly',
				value: 'CARD_LIMIT_PURCHASE_MONTHLY',
				description: 'Monthly purchase limit',
			},
		],
		default: 'CARD_LIMIT_POS_DAILY',
		required: true,
		description: 'Type of limit to set',
	},
	{
		displayName: 'Limit Amount',
		name: 'limitAmount',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['card'],
				operation: ['setLimits'],
			},
		},
		default: '',
		required: true,
		description: 'The limit amount (e.g., "500.00")',
	},
	{
		displayName: 'Currency',
		name: 'currency',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['card'],
				operation: ['setLimits'],
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
		description: 'Currency for the limit',
	},

	// List cards fields
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['card'],
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
				resource: ['card'],
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
				resource: ['card'],
				operation: ['list'],
			},
		},
		options: [
			{
				displayName: 'Card Type',
				name: 'cardType',
				type: 'options',
				options: [
					{
						name: 'MAESTRO',
						value: 'MAESTRO',
					},
					{
						name: 'MASTERCARD',
						value: 'MASTERCARD',
					},
					{
						name: 'VISA',
						value: 'VISA',
					},
				],
				default: '',
				description: 'Filter by card type',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{
						name: 'ACTIVE',
						value: 'ACTIVE',
					},
					{
						name: 'DEACTIVATED',
						value: 'DEACTIVATED',
					},
					{
						name: 'LOST',
						value: 'LOST',
					},
					{
						name: 'STOLEN',
						value: 'STOLEN',
					},
					{
						name: 'EXPIRED',
						value: 'EXPIRED',
					},
				],
				default: '',
				description: 'Filter by card status',
			},
		],
	},
];