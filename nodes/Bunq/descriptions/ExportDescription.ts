import { INodeProperties } from 'n8n-workflow';

export const exportOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['export'],
			},
		},
		options: [
			{
				name: 'Create Statement',
				value: 'createStatement',
				description: 'Create a new account statement export',
				action: 'Create a statement export',
			},
			{
				name: 'Get Statement',
				value: 'getStatement',
				description: 'Get a specific statement export',
				action: 'Get a statement export',
			},
			{
				name: 'List Statements',
				value: 'listStatements',
				description: 'List all statement exports',
				action: 'List all statement exports',
			},
			{
				name: 'Download Statement',
				value: 'downloadStatement',
				description: 'Download the statement file content',
				action: 'Download statement content',
			},
			{
				name: 'Delete Statement',
				value: 'deleteStatement',
				description: 'Delete a statement export',
				action: 'Delete a statement export',
			},
		],
		default: 'createStatement',
	},
];

export const exportFields: INodeProperties[] = [
	// Common fields
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['export'],
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
				resource: ['export'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the monetary account',
	},

	// Statement ID for get/download/delete operations
	{
		displayName: 'Statement ID',
		name: 'statementId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['export'],
				operation: ['getStatement', 'downloadStatement', 'deleteStatement'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the statement export',
	},

	// Create statement fields
	{
		displayName: 'Statement Format',
		name: 'statementFormat',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['export'],
				operation: ['createStatement'],
			},
		},
		options: [
			{
				name: 'CSV',
				value: 'CSV',
				description: 'Comma-separated values format',
			},
			{
				name: 'PDF',
				value: 'PDF',
				description: 'Portable Document Format',
			},
			{
				name: 'MT940',
				value: 'MT940',
				description: 'SWIFT MT940 bank statement format',
			},
			{
				name: 'CAMT053',
				value: 'CAMT053',
				description: 'ISO 20022 CAMT.053 format',
			},
		],
		default: 'CSV',
		required: true,
		description: 'The format of the statement export',
	},
	{
		displayName: 'Date From',
		name: 'dateFrom',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['export'],
				operation: ['createStatement'],
			},
		},
		default: '',
		required: true,
		description: 'Start date for the statement period',
	},
	{
		displayName: 'Date To',
		name: 'dateTo',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['export'],
				operation: ['createStatement'],
			},
		},
		default: '',
		required: true,
		description: 'End date for the statement period',
	},

	// Additional options for creating statements
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['export'],
				operation: ['createStatement'],
			},
		},
		options: [
			{
				displayName: 'Include Attachments',
				name: 'includeAttachments',
				type: 'boolean',
				default: false,
				description: 'Whether to include transaction attachments in the export',
			},
			{
				displayName: 'Regional Format',
				name: 'regionalFormat',
				type: 'options',
				options: [
					{
						name: 'European (DD/MM/YYYY)',
						value: 'EUROPEAN',
					},
					{
						name: 'US (MM/DD/YYYY)',
						value: 'US',
					},
					{
						name: 'ISO (YYYY-MM-DD)',
						value: 'ISO',
					},
				],
				default: 'EUROPEAN',
				description: 'Date format to use in the export',
			},
			{
				displayName: 'Include Balance',
				name: 'includeBalance',
				type: 'boolean',
				default: true,
				description: 'Whether to include balance information',
			},
			{
				displayName: 'Language',
				name: 'language',
				type: 'options',
				options: [
					{
						name: 'English',
						value: 'en',
					},
					{
						name: 'Dutch',
						value: 'nl',
					},
					{
						name: 'German',
						value: 'de',
					},
					{
						name: 'French',
						value: 'fr',
					},
				],
				default: 'en',
				description: 'Language for the statement export',
			},
		],
	},

	// Download options
	{
		displayName: 'Download Options',
		name: 'downloadOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['export'],
				operation: ['downloadStatement'],
			},
		},
		options: [
			{
				displayName: 'Binary Property Name',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				description: 'Name of the binary property to store the downloaded file',
			},
			{
				displayName: 'File Name',
				name: 'fileName',
				type: 'string',
				default: '',
				description: 'Custom filename for the downloaded file (optional)',
			},
		],
	},

	// List statements fields
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['export'],
				operation: ['listStatements'],
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
				resource: ['export'],
				operation: ['listStatements'],
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
				resource: ['export'],
				operation: ['listStatements'],
			},
		},
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{
						name: 'Pending',
						value: 'PENDING',
					},
					{
						name: 'Processing',
						value: 'PROCESSING',
					},
					{
						name: 'Completed',
						value: 'COMPLETED',
					},
					{
						name: 'Failed',
						value: 'FAILED',
					},
				],
				default: '',
				description: 'Filter by export status',
			},
			{
				displayName: 'Format',
				name: 'format',
				type: 'options',
				options: [
					{
						name: 'CSV',
						value: 'CSV',
					},
					{
						name: 'PDF',
						value: 'PDF',
					},
					{
						name: 'MT940',
						value: 'MT940',
					},
					{
						name: 'CAMT053',
						value: 'CAMT053',
					},
				],
				default: '',
				description: 'Filter by statement format',
			},
			{
				displayName: 'Created After',
				name: 'createdAfter',
				type: 'dateTime',
				default: '',
				description: 'Only show statements created after this date',
			},
			{
				displayName: 'Created Before',
				name: 'createdBefore',
				type: 'dateTime',
				default: '',
				description: 'Only show statements created before this date',
			},
		],
	},
];