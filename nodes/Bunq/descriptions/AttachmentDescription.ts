import { INodeProperties } from 'n8n-workflow';

export const attachmentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['attachment'],
			},
		},
		options: [
			{
				name: 'Upload',
				value: 'upload',
				description: 'Upload a file attachment',
				action: 'Upload a file attachment',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get an attachment',
				action: 'Get an attachment',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all attachments',
				action: 'List all attachments',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an attachment',
				action: 'Delete an attachment',
			},
		],
		default: 'upload',
	},
];

export const attachmentFields: INodeProperties[] = [
	// Common fields
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['attachment'],
			},
		},
		default: '',
		description: 'The ID of the user. Leave empty to use current user.',
	},

	// Attachment ID for get/delete operations
	{
		displayName: 'Attachment ID',
		name: 'attachmentId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['attachment'],
				operation: ['get', 'delete'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the attachment',
	},

	// Upload fields
	{
		displayName: 'File',
		name: 'file',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['attachment'],
				operation: ['upload'],
			},
		},
		default: '',
		required: true,
		description: 'Binary property name containing the file to upload',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['attachment'],
				operation: ['upload'],
			},
		},
		default: '',
		description: 'Description for the attachment',
	},
	{
		displayName: 'Content Type',
		name: 'contentType',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['attachment'],
				operation: ['upload'],
			},
		},
		options: [
			{
				name: 'Auto Detect',
				value: 'auto',
			},
			{
				name: 'PDF',
				value: 'application/pdf',
			},
			{
				name: 'JPEG',
				value: 'image/jpeg',
			},
			{
				name: 'PNG',
				value: 'image/png',
			},
			{
				name: 'GIF',
				value: 'image/gif',
			},
			{
				name: 'Plain Text',
				value: 'text/plain',
			},
			{
				name: 'CSV',
				value: 'text/csv',
			},
			{
				name: 'JSON',
				value: 'application/json',
			},
			{
				name: 'XML',
				value: 'application/xml',
			},
		],
		default: 'auto',
		description: 'Content type of the file',
	},

	// List attachments fields
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['attachment'],
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
				resource: ['attachment'],
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
				resource: ['attachment'],
				operation: ['list'],
			},
		},
		options: [
			{
				displayName: 'Content Type',
				name: 'contentType',
				type: 'string',
				default: '',
				description: 'Filter by content type (e.g., "image/jpeg")',
			},
			{
				displayName: 'Size Min',
				name: 'sizeMin',
				type: 'number',
				default: 0,
				description: 'Minimum file size in bytes',
			},
			{
				displayName: 'Size Max',
				name: 'sizeMax',
				type: 'number',
				default: 0,
				description: 'Maximum file size in bytes',
			},
			{
				displayName: 'Created After',
				name: 'createdAfter',
				type: 'dateTime',
				default: '',
				description: 'Filter attachments created after this date',
			},
			{
				displayName: 'Created Before',
				name: 'createdBefore',
				type: 'dateTime',
				default: '',
				description: 'Filter attachments created before this date',
			},
		],
	},

	// Context fields for linking attachments
	{
		displayName: 'Link to Context',
		name: 'linkContext',
		type: 'collection',
		placeholder: 'Add Context',
		default: {},
		displayOptions: {
			show: {
				resource: ['attachment'],
				operation: ['upload'],
			},
		},
		options: [
			{
				displayName: 'Payment ID',
				name: 'paymentId',
				type: 'string',
				default: '',
				description: 'Link attachment to a specific payment',
			},
			{
				displayName: 'Request Inquiry ID',
				name: 'requestInquiryId',
				type: 'string',
				default: '',
				description: 'Link attachment to a specific payment request',
			},
			{
				displayName: 'Transaction ID',
				name: 'transactionId',
				type: 'string',
				default: '',
				description: 'Link attachment to a specific transaction',
			},
		],
	},
];