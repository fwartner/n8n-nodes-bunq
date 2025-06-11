import {
	IHookFunctions,
	IWebhookFunctions,
	IDataObject,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	NodeOperationError,
} from 'n8n-workflow';

import {
	bunqApiRequestHook,
	formatBunqResponse,
} from '../Bunq/GenericFunctions';

export class BunqTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'bunq Trigger',
		name: 'bunqTrigger',
		icon: 'file:bunq.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Triggers when bunq events occur',
		defaults: {
			name: 'bunq Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'bunqApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'string',
				default: '',
				description: 'The ID of the user. Leave empty to use current user.',
			},
			{
				displayName: 'Account ID',
				name: 'accountId',
				type: 'string',
				default: '',
				required: true,
				description: 'The ID of the monetary account to monitor',
			},
			{
				displayName: 'Event Types',
				name: 'events',
				type: 'multiOptions',
				options: [
					{
						name: 'Payment Created',
						value: 'PAYMENT_CREATED',
						description: 'Triggered when a new payment is created',
					},
					{
						name: 'Payment Updated',
						value: 'PAYMENT_UPDATED',
						description: 'Triggered when a payment is updated',
					},
					{
						name: 'Request Inquiry Created',
						value: 'REQUEST_INQUIRY_CREATED',
						description: 'Triggered when a new payment request is created',
					},
					{
						name: 'Request Inquiry Updated',
						value: 'REQUEST_INQUIRY_UPDATED',
						description: 'Triggered when a payment request is updated',
					},
					{
						name: 'Card Transaction Created',
						value: 'CARD_TRANSACTION_CREATED',
						description: 'Triggered when a card transaction occurs',
					},
					{
						name: 'bunq.me Payment',
						value: 'BUNQME_PAYMENT',
						description: 'Triggered when a bunq.me payment is received',
					},
					{
						name: 'Mutation Created',
						value: 'MUTATION_CREATED',
						description: 'Triggered when any mutation occurs on the account',
					},
				],
				default: ['PAYMENT_CREATED'],
				required: true,
				description: 'The events to listen for',
			},
			{
				displayName: 'Additional Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Include Raw Data',
						name: 'includeRawData',
						type: 'boolean',
						default: false,
						description: 'Whether to include the raw webhook payload in the output',
					},
					{
						displayName: 'Filter Amounts',
						name: 'filterAmounts',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: false,
						},
						default: {},
						options: [
							{
								name: 'amounts',
								displayName: 'Amount Filters',
								values: [
									{
										displayName: 'Minimum Amount',
										name: 'minAmount',
										type: 'string',
										default: '',
										description: 'Only trigger for amounts above this value',
									},
									{
										displayName: 'Maximum Amount',
										name: 'maxAmount',
										type: 'string',
										default: '',
										description: 'Only trigger for amounts below this value',
									},
								],
							},
						],
					},
					{
						displayName: 'Filter Description',
						name: 'filterDescription',
						type: 'string',
						default: '',
						description: 'Only trigger when description contains this text (case-insensitive)',
					},
				],
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const userId = this.getNodeParameter('userId') as string;
				const accountId = this.getNodeParameter('accountId') as string;
				
				try {
					// OAuth2 authentication handles tokens automatically
					const userEndpoint = userId ? `/user/${userId}` : '/user';
					const endpoint = `${userEndpoint}/monetary-account/${accountId}/notification-filter-url`;
					
					const response = await bunqApiRequestHook.call(this, 'GET', endpoint);
					
					if (response.Response && Array.isArray(response.Response)) {
						return response.Response.some((filter: IDataObject) => 
							filter.NotificationFilterUrl && 
							(filter.NotificationFilterUrl as IDataObject).notification_target === webhookUrl
						);
					}
					
					return false;
				} catch {
					return false;
				}
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const userId = this.getNodeParameter('userId') as string;
				const accountId = this.getNodeParameter('accountId') as string;
				const events = this.getNodeParameter('events') as string[];
				
				try {
					// OAuth2 authentication handles tokens automatically
					const userEndpoint = userId ? `/user/${userId}` : '/user';
					const endpoint = `${userEndpoint}/monetary-account/${accountId}/notification-filter-url`;
					
					const webhookData = {
						notification_target: webhookUrl,
						category: 'MUTATION',
						notification_filters: events.map(event => ({
							notification_delivery_method: 'URL',
							notification_target: webhookUrl,
							category: 'MUTATION',
							event_type: event,
						})),
					};
					
					const response = await bunqApiRequestHook.call(this, 'POST', endpoint, webhookData);
					
					if (response.Response && Array.isArray(response.Response) && response.Response[0]) {
						return true;
					}
					
					return false;
				} catch (error) {
					throw new NodeOperationError(this.getNode(), `Failed to create webhook: ${(error as Error).message}`);
				}
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const userId = this.getNodeParameter('userId') as string;
				const accountId = this.getNodeParameter('accountId') as string;
				
				try {
					// OAuth2 authentication handles tokens automatically
					const userEndpoint = userId ? `/user/${userId}` : '/user';
					const endpoint = `${userEndpoint}/monetary-account/${accountId}/notification-filter-url`;
					
					// Get existing webhooks
					const response = await bunqApiRequestHook.call(this, 'GET', endpoint);
					
					if (response.Response && Array.isArray(response.Response)) {
						for (const filter of response.Response) {
							if (filter.NotificationFilterUrl && 
								filter.NotificationFilterUrl.notification_target === webhookUrl) {
								const filterId = filter.NotificationFilterUrl.id;
								await bunqApiRequestHook.call(this, 'DELETE', `${endpoint}/${filterId}`);
								return true;
							}
						}
					}
					
					return false;
				} catch {
					// Don't throw error on delete failure - webhook might already be gone
					return false;
				}
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const bodyData = this.getBodyData();
		const options = this.getNodeParameter('options') as IDataObject;
		const events = this.getNodeParameter('events') as string[];
		
		let responseData: IDataObject = {};
		
		try {
			// Parse bunq webhook payload
			if (bodyData && typeof bodyData === 'object') {
				const webhookData = bodyData as IDataObject;
				
				// Extract notification data from bunq webhook format
				if (webhookData.NotificationUrl && (webhookData.NotificationUrl as IDataObject).object) {
					const notificationUrl = webhookData.NotificationUrl as IDataObject;
					const notificationObject = notificationUrl.object as IDataObject;
					const eventType = notificationUrl.category as string;
					
					// Check if this event type should trigger
					if (!events.includes(eventType) && !events.includes('MUTATION_CREATED')) {
						return {
							workflowData: [[]],
						};
					}
					
					// Apply filters
					if (options.filterAmounts && notificationObject.amount) {
						const amount = notificationObject.amount as IDataObject;
						const amountValue = parseFloat(amount.value as string);
						
						const filterAmounts = options.filterAmounts as IDataObject;
						if (filterAmounts.amounts) {
							const amountFilters = filterAmounts.amounts as IDataObject;
							
							if (amountFilters.minAmount && amountValue < parseFloat(amountFilters.minAmount as string)) {
								return { workflowData: [[]] };
							}
							
							if (amountFilters.maxAmount && amountValue > parseFloat(amountFilters.maxAmount as string)) {
								return { workflowData: [[]] };
							}
						}
					}
					
					if (options.filterDescription && notificationObject.description) {
						const description = (notificationObject.description as string).toLowerCase();
						const filterText = (options.filterDescription as string).toLowerCase();
						
						if (!description.includes(filterText)) {
							return { workflowData: [[]] };
						}
					}
					
					// Format response data
					responseData = {
						event_type: eventType,
						timestamp: (webhookData.NotificationUrl as IDataObject).created || new Date().toISOString(),
						...notificationObject,
					};
					
					// Include raw data if requested
					if (options.includeRawData) {
						responseData.raw_webhook_data = webhookData;
					}
					
					// Format response using bunq formatter
					responseData = formatBunqResponse(responseData);
				}
			}
		} catch (error) {
			// On parsing error, still return the raw data
			responseData = {
				error: 'Failed to parse webhook data',
				error_message: (error as Error).message,
				raw_data: bodyData,
			};
		}
		
		return {
			workflowData: [this.helpers.returnJsonArray([responseData])],
		};
	}
}