import {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import {
	bunqApiRequest,
	bunqApiRequestAllItems,
	formatBunqResponse,
	initializeBunqSession,
} from './GenericFunctions';

import { userOperations, userFields } from './descriptions/UserDescription';
import { monetaryAccountOperations, monetaryAccountFields } from './descriptions/MonetaryAccountDescription';
import { paymentOperations, paymentFields } from './descriptions/PaymentDescription';
import { transactionOperations, transactionFields } from './descriptions/TransactionDescription';
import { requestInquiryOperations, requestInquiryFields } from './descriptions/RequestInquiryDescription';
import { cardOperations, cardFields } from './descriptions/CardDescription';
import { attachmentOperations, attachmentFields } from './descriptions/AttachmentDescription';
import { bunqMeOperations, bunqMeFields } from './descriptions/BunqMeDescription';
import { webhookOperations, webhookFields } from './descriptions/WebhookDescription';
import { scheduledPaymentOperations, scheduledPaymentFields } from './descriptions/ScheduledPaymentDescription';
import { exportOperations, exportFields } from './descriptions/ExportDescription';

export class Bunq implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'bunq',
		name: 'bunq',
		icon: 'file:bunq.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with bunq banking API',
		defaults: {
			name: 'bunq',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'bunqOAuth2Api',
				required: false,
			},
			{
				name: 'bunqApi',
				required: false,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'User',
						value: 'user',
						description: 'User management operations',
					},
					{
						name: 'Monetary Account',
						value: 'monetaryAccount',
						description: 'Monetary account operations',
					},
					{
						name: 'Payment',
						value: 'payment',
						description: 'Payment operations',
					},
					{
						name: 'Transaction',
						value: 'transaction',
						description: 'Transaction operations',
					},
					{
						name: 'Request Inquiry',
						value: 'requestInquiry',
						description: 'Payment request operations',
					},
					{
						name: 'Card',
						value: 'card',
						description: 'Card management operations',
					},
					{
						name: 'Attachment',
						value: 'attachment',
						description: 'File attachment operations',
					},
					{
						name: 'bunq.me',
						value: 'bunqMe',
						description: 'bunq.me payment link operations',
					},
					{
						name: 'Webhook',
						value: 'webhook',
						description: 'Webhook notification management',
					},
					{
						name: 'Scheduled Payment',
						value: 'scheduledPayment',
						description: 'Scheduled payment management',
					},
					{
						name: 'Export/Statement',
						value: 'export',
						description: 'Account statement and data export operations',
					},
				],
				default: 'user',
			},
			...userOperations,
			...userFields,
			...monetaryAccountOperations,
			...monetaryAccountFields,
			...paymentOperations,
			...paymentFields,
			...transactionOperations,
			...transactionFields,
			...requestInquiryOperations,
			...requestInquiryFields,
			...cardOperations,
			...cardFields,
			...attachmentOperations,
			...attachmentFields,
			...bunqMeOperations,
			...bunqMeFields,
			...webhookOperations,
			...webhookFields,
			...scheduledPaymentOperations,
			...scheduledPaymentFields,
			...exportOperations,
			...exportFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		// Initialize bunq session if needed
		try {
			await initializeBunqSession.call(this);
		} catch {
			throw new NodeOperationError(this.getNode(), 'Failed to initialize bunq session');
		}

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'user') {
					if (operation === 'get') {
						const userId = this.getNodeParameter('userId', i) as string;
						const endpoint = userId ? `/user/${userId}` : '/user';
						
						const responseData = await bunqApiRequest.call(this, 'GET', endpoint);
						const formattedResponse = formatBunqResponse(responseData);
						returnData.push(formattedResponse);
					}

					if (operation === 'list') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						
						if (returnAll) {
							const responseData = await bunqApiRequestAllItems.call(this, 'GET', '/user');
							returnData.push(...responseData.map(formatBunqResponse));
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const responseData = await bunqApiRequest.call(this, 'GET', '/user', {}, { count: limit });
							const formattedResponse = formatBunqResponse(responseData);
							
							if (formattedResponse.Response && Array.isArray(formattedResponse.Response)) {
								returnData.push(...formattedResponse.Response);
							} else {
								returnData.push(formattedResponse);
							}
						}
					}
				}

				if (resource === 'monetaryAccount') {
					const userId = this.getNodeParameter('userId', i) as string;
					const userEndpoint = userId ? `/user/${userId}` : '/user';
					
					if (operation === 'get') {
						const accountId = this.getNodeParameter('accountId', i) as string;
						const endpoint = `${userEndpoint}/monetary-account/${accountId}`;
						
						const responseData = await bunqApiRequest.call(this, 'GET', endpoint);
						const formattedResponse = formatBunqResponse(responseData);
						returnData.push(formattedResponse);
					}

					if (operation === 'list') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const endpoint = `${userEndpoint}/monetary-account`;
						
						if (returnAll) {
							const responseData = await bunqApiRequestAllItems.call(this, 'GET', endpoint);
							returnData.push(...responseData.map(formatBunqResponse));
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const responseData = await bunqApiRequest.call(this, 'GET', endpoint, {}, { count: limit });
							const formattedResponse = formatBunqResponse(responseData);
							
							if (formattedResponse.Response && Array.isArray(formattedResponse.Response)) {
								returnData.push(...formattedResponse.Response);
							} else {
								returnData.push(formattedResponse);
							}
						}
					}
				}

				if (resource === 'payment') {
					const userId = this.getNodeParameter('userId', i) as string;
					const accountId = this.getNodeParameter('accountId', i) as string;
					const userEndpoint = userId ? `/user/${userId}` : '/user';
					const baseEndpoint = `${userEndpoint}/monetary-account/${accountId}/payment`;

					if (operation === 'create') {
						const amount = this.getNodeParameter('amount', i) as string;
						const currency = this.getNodeParameter('currency', i) as string;
						const counterpartyType = this.getNodeParameter('counterpartyType', i) as string;
						const recipientName = this.getNodeParameter('recipientName', i) as string;
						const description = this.getNodeParameter('description', i) as string;

						let counterpartyAlias: IDataObject = {};
						
						if (counterpartyType === 'iban') {
							const iban = this.getNodeParameter('iban', i) as string;
							counterpartyAlias = {
								type: 'IBAN',
								value: iban,
								name: recipientName,
							};
						} else if (counterpartyType === 'email') {
							const email = this.getNodeParameter('email', i) as string;
							counterpartyAlias = {
								type: 'EMAIL',
								value: email,
								name: recipientName,
							};
						} else if (counterpartyType === 'phone') {
							const phone = this.getNodeParameter('phone', i) as string;
							counterpartyAlias = {
								type: 'PHONE_NUMBER',
								value: phone,
								name: recipientName,
							};
						}

						const paymentData = {
							amount: {
								value: amount,
								currency: currency,
							},
							counterparty_alias: counterpartyAlias,
							description: description,
						};

						const responseData = await bunqApiRequest.call(this, 'POST', baseEndpoint, paymentData);
						const formattedResponse = formatBunqResponse(responseData);
						returnData.push(formattedResponse);
					}

					if (operation === 'get') {
						const paymentId = this.getNodeParameter('paymentId', i) as string;
						const endpoint = `${baseEndpoint}/${paymentId}`;
						
						const responseData = await bunqApiRequest.call(this, 'GET', endpoint);
						const formattedResponse = formatBunqResponse(responseData);
						returnData.push(formattedResponse);
					}

					if (operation === 'list') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						
						if (returnAll) {
							const responseData = await bunqApiRequestAllItems.call(this, 'GET', baseEndpoint);
							returnData.push(...responseData.map(formatBunqResponse));
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const responseData = await bunqApiRequest.call(this, 'GET', baseEndpoint, {}, { count: limit });
							const formattedResponse = formatBunqResponse(responseData);
							
							if (formattedResponse.Response && Array.isArray(formattedResponse.Response)) {
								returnData.push(...formattedResponse.Response);
							} else {
								returnData.push(formattedResponse);
							}
						}
					}

					if (operation === 'update') {
						const paymentId = this.getNodeParameter('paymentId', i) as string;
						const status = this.getNodeParameter('status', i) as string;
						const endpoint = `${baseEndpoint}/${paymentId}`;
						
						const updateData = {
							status: status,
						};

						const responseData = await bunqApiRequest.call(this, 'PUT', endpoint, updateData);
						const formattedResponse = formatBunqResponse(responseData);
						returnData.push(formattedResponse);
					}
				}

				if (resource === 'transaction') {
					const userId = this.getNodeParameter('userId', i) as string;
					const accountId = this.getNodeParameter('accountId', i) as string;
					const userEndpoint = userId ? `/user/${userId}` : '/user';
					const baseEndpoint = `${userEndpoint}/monetary-account/${accountId}/payment`;

					if (operation === 'get') {
						const transactionId = this.getNodeParameter('transactionId', i) as string;
						const endpoint = `${baseEndpoint}/${transactionId}`;
						
						const responseData = await bunqApiRequest.call(this, 'GET', endpoint);
						const formattedResponse = formatBunqResponse(responseData);
						returnData.push(formattedResponse);
					}

					if (operation === 'list') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						
						let qs: IDataObject = {};
						
						if (additionalFields.fromDate) {
							qs.date_from = (additionalFields.fromDate as Date).toISOString();
						}
						if (additionalFields.toDate) {
							qs.date_to = (additionalFields.toDate as Date).toISOString();
						}
						if (additionalFields.minAmount) {
							qs.amount_min = additionalFields.minAmount;
						}
						if (additionalFields.maxAmount) {
							qs.amount_max = additionalFields.maxAmount;
						}
						
						if (returnAll) {
							const responseData = await bunqApiRequestAllItems.call(this, 'GET', baseEndpoint, {}, qs);
							returnData.push(...responseData.map(formatBunqResponse));
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							qs.count = limit;
							const responseData = await bunqApiRequest.call(this, 'GET', baseEndpoint, {}, qs);
							const formattedResponse = formatBunqResponse(responseData);
							
							if (formattedResponse.Response && Array.isArray(formattedResponse.Response)) {
								returnData.push(...formattedResponse.Response);
							} else {
								returnData.push(formattedResponse);
							}
						}
					}
				}

				if (resource === 'requestInquiry') {
					const userId = this.getNodeParameter('userId', i) as string;
					const accountId = this.getNodeParameter('accountId', i) as string;
					const userEndpoint = userId ? `/user/${userId}` : '/user';
					const baseEndpoint = `${userEndpoint}/monetary-account/${accountId}/request-inquiry`;

					if (operation === 'create') {
						const amount = this.getNodeParameter('amount', i) as string;
						const currency = this.getNodeParameter('currency', i) as string;
						const counterpartyType = this.getNodeParameter('counterpartyType', i) as string;
						const debtorName = this.getNodeParameter('debtorName', i) as string;
						const description = this.getNodeParameter('description', i) as string;
						const allowBunqme = this.getNodeParameter('allowBunqme', i) as boolean;

						let counterpartyAlias: IDataObject = {};
						
						if (counterpartyType === 'iban') {
							const iban = this.getNodeParameter('iban', i) as string;
							counterpartyAlias = {
								type: 'IBAN',
								value: iban,
								name: debtorName,
							};
						} else if (counterpartyType === 'email') {
							const email = this.getNodeParameter('email', i) as string;
							counterpartyAlias = {
								type: 'EMAIL',
								value: email,
								name: debtorName,
							};
						} else if (counterpartyType === 'phone') {
							const phone = this.getNodeParameter('phone', i) as string;
							counterpartyAlias = {
								type: 'PHONE_NUMBER',
								value: phone,
								name: debtorName,
							};
						}

						const requestData = {
							amount_inquired: {
								value: amount,
								currency: currency,
							},
							counterparty_alias: counterpartyAlias,
							description: description,
							allow_bunqme: allowBunqme,
						};

						const responseData = await bunqApiRequest.call(this, 'POST', baseEndpoint, requestData);
						const formattedResponse = formatBunqResponse(responseData);
						returnData.push(formattedResponse);
					}

					if (operation === 'get') {
						const requestId = this.getNodeParameter('requestId', i) as string;
						const endpoint = `${baseEndpoint}/${requestId}`;
						
						const responseData = await bunqApiRequest.call(this, 'GET', endpoint);
						const formattedResponse = formatBunqResponse(responseData);
						returnData.push(formattedResponse);
					}

					if (operation === 'list') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						
						if (returnAll) {
							const responseData = await bunqApiRequestAllItems.call(this, 'GET', baseEndpoint);
							returnData.push(...responseData.map(formatBunqResponse));
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const responseData = await bunqApiRequest.call(this, 'GET', baseEndpoint, {}, { count: limit });
							const formattedResponse = formatBunqResponse(responseData);
							
							if (formattedResponse.Response && Array.isArray(formattedResponse.Response)) {
								returnData.push(...formattedResponse.Response);
							} else {
								returnData.push(formattedResponse);
							}
						}
					}

					if (operation === 'update') {
						const requestId = this.getNodeParameter('requestId', i) as string;
						const status = this.getNodeParameter('status', i) as string;
						const endpoint = `${baseEndpoint}/${requestId}`;
						
						const updateData = {
							status: status,
						};

						const responseData = await bunqApiRequest.call(this, 'PUT', endpoint, updateData);
						const formattedResponse = formatBunqResponse(responseData);
						returnData.push(formattedResponse);
					}
				}

				if (resource === 'card') {
					const userId = this.getNodeParameter('userId', i) as string;
					const userEndpoint = userId ? `/user/${userId}` : '/user';
					const baseEndpoint = `${userEndpoint}/card`;

					if (operation === 'get') {
						const cardId = this.getNodeParameter('cardId', i) as string;
						const endpoint = `${baseEndpoint}/${cardId}`;
						
						const responseData = await bunqApiRequest.call(this, 'GET', endpoint);
						const formattedResponse = formatBunqResponse(responseData);
						returnData.push(formattedResponse);
					}

					if (operation === 'list') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						
						let qs: IDataObject = {};
						
						if (additionalFields.cardType) {
							qs.card_type = additionalFields.cardType;
						}
						if (additionalFields.status) {
							qs.status = additionalFields.status;
						}
						
						if (returnAll) {
							const responseData = await bunqApiRequestAllItems.call(this, 'GET', baseEndpoint, {}, qs);
							returnData.push(...responseData.map(formatBunqResponse));
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							qs.count = limit;
							const responseData = await bunqApiRequest.call(this, 'GET', baseEndpoint, {}, qs);
							const formattedResponse = formatBunqResponse(responseData);
							
							if (formattedResponse.Response && Array.isArray(formattedResponse.Response)) {
								returnData.push(...formattedResponse.Response);
							} else {
								returnData.push(formattedResponse);
							}
						}
					}

					if (operation === 'update') {
						const cardId = this.getNodeParameter('cardId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
						const endpoint = `${baseEndpoint}/${cardId}`;
						
						const updateData: IDataObject = {};
						
						if (updateFields.pinCode) {
							updateData.pin_code = updateFields.pinCode;
						}
						if (updateFields.activationCode) {
							updateData.activation_code = updateFields.activationCode;
						}
						if (updateFields.status) {
							updateData.status = updateFields.status;
						}
						if (updateFields.cardName) {
							updateData.name_on_card = updateFields.cardName;
						}

						const responseData = await bunqApiRequest.call(this, 'PUT', endpoint, updateData);
						const formattedResponse = formatBunqResponse(responseData);
						returnData.push(formattedResponse);
					}

					if (operation === 'setLimits') {
						const cardId = this.getNodeParameter('cardId', i) as string;
						const limitType = this.getNodeParameter('limitType', i) as string;
						const limitAmount = this.getNodeParameter('limitAmount', i) as string;
						const currency = this.getNodeParameter('currency', i) as string;
						const endpoint = `${baseEndpoint}/${cardId}/card-limit`;
						
						const limitData = {
							daily_limit: {
								value: limitAmount,
								currency: currency,
							},
							type: limitType,
						};

						const responseData = await bunqApiRequest.call(this, 'POST', endpoint, limitData);
						const formattedResponse = formatBunqResponse(responseData);
						returnData.push(formattedResponse);
					}

					if (operation === 'getLimits') {
						const cardId = this.getNodeParameter('cardId', i) as string;
						const endpoint = `${baseEndpoint}/${cardId}/card-limit`;
						
						const responseData = await bunqApiRequest.call(this, 'GET', endpoint);
						const formattedResponse = formatBunqResponse(responseData);
						returnData.push(formattedResponse);
					}
				}

				if (resource === 'attachment') {
					const userId = this.getNodeParameter('userId', i) as string;
					const userEndpoint = userId ? `/user/${userId}` : '/user';
					const baseEndpoint = `${userEndpoint}/attachment-public`;

					if (operation === 'upload') {
						const filePropertyName = this.getNodeParameter('file', i) as string;
						const description = this.getNodeParameter('description', i) as string;
						const contentType = this.getNodeParameter('contentType', i) as string;
						const linkContext = this.getNodeParameter('linkContext', i) as IDataObject;

						const binaryData = this.helpers.assertBinaryData(i, filePropertyName);
						let mimeType = contentType;
						
						if (contentType === 'auto') {
							mimeType = binaryData.mimeType || 'application/octet-stream';
						}

						const attachmentData: IDataObject = {
							description: description,
							content_type: mimeType,
						};

						// Add context linking if provided
						if (linkContext.paymentId) {
							attachmentData.attached_object = {
								id: linkContext.paymentId,
								type: 'Payment',
							};
						} else if (linkContext.requestInquiryId) {
							attachmentData.attached_object = {
								id: linkContext.requestInquiryId,
								type: 'RequestInquiry',
							};
						} else if (linkContext.transactionId) {
							attachmentData.attached_object = {
								id: linkContext.transactionId,
								type: 'Payment',
							};
						}

						// First create the attachment metadata
						const responseData = await bunqApiRequest.call(this, 'POST', baseEndpoint, attachmentData);
						
						// Then upload the file content
						if (responseData.Response && responseData.Response[0]) {
							const attachmentPublic = responseData.Response[0].AttachmentPublic;
							if (attachmentPublic && attachmentPublic.attachment && attachmentPublic.attachment.urls) {
								const uploadUrl = attachmentPublic.attachment.urls.public;
								
								// Upload file content to the provided URL
								await this.helpers.request({
									method: 'PUT',
									url: uploadUrl,
									body: binaryData.data,
									headers: {
										'Content-Type': mimeType,
										'Content-Length': binaryData.data.length.toString(),
									},
								});
							}
						}

						const formattedResponse = formatBunqResponse(responseData);
						returnData.push(formattedResponse);
					}

					if (operation === 'get') {
						const attachmentId = this.getNodeParameter('attachmentId', i) as string;
						const endpoint = `${baseEndpoint}/${attachmentId}`;
						
						const responseData = await bunqApiRequest.call(this, 'GET', endpoint);
						const formattedResponse = formatBunqResponse(responseData);
						returnData.push(formattedResponse);
					}

					if (operation === 'list') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						
						let qs: IDataObject = {};
						
						if (additionalFields.contentType) {
							qs.content_type = additionalFields.contentType;
						}
						if (additionalFields.sizeMin) {
							qs.size_min = additionalFields.sizeMin;
						}
						if (additionalFields.sizeMax) {
							qs.size_max = additionalFields.sizeMax;
						}
						if (additionalFields.createdAfter) {
							qs.created_after = (additionalFields.createdAfter as Date).toISOString();
						}
						if (additionalFields.createdBefore) {
							qs.created_before = (additionalFields.createdBefore as Date).toISOString();
						}
						
						if (returnAll) {
							const responseData = await bunqApiRequestAllItems.call(this, 'GET', baseEndpoint, {}, qs);
							returnData.push(...responseData.map(formatBunqResponse));
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							qs.count = limit;
							const responseData = await bunqApiRequest.call(this, 'GET', baseEndpoint, {}, qs);
							const formattedResponse = formatBunqResponse(responseData);
							
							if (formattedResponse.Response && Array.isArray(formattedResponse.Response)) {
								returnData.push(...formattedResponse.Response);
							} else {
								returnData.push(formattedResponse);
							}
						}
					}

					if (operation === 'delete') {
						const attachmentId = this.getNodeParameter('attachmentId', i) as string;
						const endpoint = `${baseEndpoint}/${attachmentId}`;
						
						const responseData = await bunqApiRequest.call(this, 'DELETE', endpoint);
						const formattedResponse = formatBunqResponse(responseData);
						returnData.push(formattedResponse);
					}
				}

				if (resource === 'bunqMe') {
					const userId = this.getNodeParameter('userId', i) as string;
					const accountId = this.getNodeParameter('accountId', i) as string;
					const userEndpoint = userId ? `/user/${userId}` : '/user';
					const baseEndpoint = `${userEndpoint}/monetary-account/${accountId}/bunqme-fundraiser-result`;

					if (operation === 'create') {
						const amount = this.getNodeParameter('amount', i) as string;
						const currency = this.getNodeParameter('currency', i) as string;
						const description = this.getNodeParameter('description', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

						const bunqMeProfile: IDataObject = {
							pointer: {
								type: 'EMAIL', // Default pointer type
								value: 'bunqme@example.com', // This would typically be dynamic
							},
							description: description,
							goal: {
								value: amount,
								currency: currency,
							},
						};

						if (additionalFields.redirectUrl) {
							bunqMeProfile.redirect_url = additionalFields.redirectUrl;
						}
						if (additionalFields.merchantReference) {
							bunqMeProfile.merchant_reference = additionalFields.merchantReference;
						}
						if (additionalFields.allowAmountHigher) {
							bunqMeProfile.allow_amount_higher = additionalFields.allowAmountHigher;
						}
						if (additionalFields.allowAmountLower) {
							bunqMeProfile.allow_amount_lower = additionalFields.allowAmountLower;
						}
						if (additionalFields.wantTip) {
							bunqMeProfile.want_tip = additionalFields.wantTip;
						}

						const bunqMeData: IDataObject = {
							bunqme_fundraiser_profile: bunqMeProfile,
						};

						const responseData = await bunqApiRequest.call(this, 'POST', baseEndpoint, bunqMeData);
						const formattedResponse = formatBunqResponse(responseData);
						returnData.push(formattedResponse);
					}

					if (operation === 'get') {
						const bunqMeId = this.getNodeParameter('bunqMeId', i) as string;
						const endpoint = `${baseEndpoint}/${bunqMeId}`;
						
						const responseData = await bunqApiRequest.call(this, 'GET', endpoint);
						const formattedResponse = formatBunqResponse(responseData);
						returnData.push(formattedResponse);
					}

					if (operation === 'list') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i) as IDataObject;
						
						let qs: IDataObject = {};
						
						if (filters.status) {
							qs.status = filters.status;
						}
						if (filters.createdAfter) {
							qs.created_after = (filters.createdAfter as Date).toISOString();
						}
						if (filters.createdBefore) {
							qs.created_before = (filters.createdBefore as Date).toISOString();
						}
						if (filters.amountMin) {
							qs.amount_min = filters.amountMin;
						}
						if (filters.amountMax) {
							qs.amount_max = filters.amountMax;
						}
						
						if (returnAll) {
							const responseData = await bunqApiRequestAllItems.call(this, 'GET', baseEndpoint, {}, qs);
							returnData.push(...responseData.map(formatBunqResponse));
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							qs.count = limit;
							const responseData = await bunqApiRequest.call(this, 'GET', baseEndpoint, {}, qs);
							const formattedResponse = formatBunqResponse(responseData);
							
							if (formattedResponse.Response && Array.isArray(formattedResponse.Response)) {
								returnData.push(...formattedResponse.Response);
							} else {
								returnData.push(formattedResponse);
							}
						}
					}

					if (operation === 'update') {
						const bunqMeId = this.getNodeParameter('bunqMeId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
						const endpoint = `${baseEndpoint}/${bunqMeId}`;
						
						const updateData: IDataObject = {};
						
						if (updateFields.status) {
							updateData.status = updateFields.status;
						}
						if (updateFields.description) {
							updateData.description = updateFields.description;
						}
						if (updateFields.redirectUrl) {
							updateData.redirect_url = updateFields.redirectUrl;
						}

						const responseData = await bunqApiRequest.call(this, 'PUT', endpoint, updateData);
						const formattedResponse = formatBunqResponse(responseData);
						returnData.push(formattedResponse);
					}
				}

				if (resource === 'webhook') {
					const userId = this.getNodeParameter('userId', i) as string;
					const accountId = this.getNodeParameter('accountId', i) as string;
					const userEndpoint = userId ? `/user/${userId}` : '/user';
					const baseEndpoint = `${userEndpoint}/monetary-account/${accountId}/notification-filter-url`;

					if (operation === 'create') {
						const notificationTarget = this.getNodeParameter('notificationTarget', i) as string;
						const eventTypes = this.getNodeParameter('eventTypes', i) as string[];
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

						const webhookData: IDataObject = {
							notification_target: notificationTarget,
							category: additionalFields.category || 'MUTATION',
							notification_filters: eventTypes.map(eventType => ({
								notification_delivery_method: 'URL',
								notification_target: notificationTarget,
								category: additionalFields.category || 'MUTATION',
								event_type: eventType,
							})),
						};

						if (additionalFields.allMonetaryAccounts) {
							webhookData.all_monetary_account = true;
						}

						const responseData = await bunqApiRequest.call(this, 'POST', baseEndpoint, webhookData);
						const formattedResponse = formatBunqResponse(responseData);
						returnData.push(formattedResponse);
					}

					if (operation === 'get') {
						const webhookId = this.getNodeParameter('webhookId', i) as string;
						const endpoint = `${baseEndpoint}/${webhookId}`;
						
						const responseData = await bunqApiRequest.call(this, 'GET', endpoint);
						const formattedResponse = formatBunqResponse(responseData);
						returnData.push(formattedResponse);
					}

					if (operation === 'list') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						
						if (returnAll) {
							const responseData = await bunqApiRequestAllItems.call(this, 'GET', baseEndpoint);
							returnData.push(...responseData.map(formatBunqResponse));
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const responseData = await bunqApiRequest.call(this, 'GET', baseEndpoint, {}, { count: limit });
							const formattedResponse = formatBunqResponse(responseData);
							
							if (formattedResponse.Response && Array.isArray(formattedResponse.Response)) {
								returnData.push(...formattedResponse.Response);
							} else {
								returnData.push(formattedResponse);
							}
						}
					}

					if (operation === 'update') {
						const webhookId = this.getNodeParameter('webhookId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
						const endpoint = `${baseEndpoint}/${webhookId}`;
						
						const updateData: IDataObject = {};
						
						if (updateFields.notificationTarget) {
							updateData.notification_target = updateFields.notificationTarget;
						}
						if (updateFields.eventTypes) {
							const eventTypes = updateFields.eventTypes as string[];
							updateData.notification_filters = eventTypes.map(eventType => ({
								notification_delivery_method: 'URL',
								notification_target: updateFields.notificationTarget || updateData.notification_target,
								category: 'MUTATION',
								event_type: eventType,
							}));
						}

						const responseData = await bunqApiRequest.call(this, 'PUT', endpoint, updateData);
						const formattedResponse = formatBunqResponse(responseData);
						returnData.push(formattedResponse);
					}

					if (operation === 'delete') {
						const webhookId = this.getNodeParameter('webhookId', i) as string;
						const endpoint = `${baseEndpoint}/${webhookId}`;
						
						const responseData = await bunqApiRequest.call(this, 'DELETE', endpoint);
						const formattedResponse = formatBunqResponse(responseData);
						returnData.push(formattedResponse);
					}
				}

				if (resource === 'scheduledPayment') {
					const userId = this.getNodeParameter('userId', i) as string;
					const accountId = this.getNodeParameter('accountId', i) as string;
					const userEndpoint = userId ? `/user/${userId}` : '/user';
					const baseEndpoint = `${userEndpoint}/monetary-account/${accountId}/schedule-payment-entry`;

					if (operation === 'create') {
						const amount = this.getNodeParameter('amount', i) as string;
						const currency = this.getNodeParameter('currency', i) as string;
						const counterpartyType = this.getNodeParameter('counterpartyType', i) as string;
						const recipientName = this.getNodeParameter('recipientName', i) as string;
						const description = this.getNodeParameter('description', i) as string;
						const scheduleType = this.getNodeParameter('scheduleType', i) as string;
						const startDate = this.getNodeParameter('startDate', i) as string;
						const endDate = this.getNodeParameter('endDate', i) as string;

						let counterpartyAlias: IDataObject = {};
						
						if (counterpartyType === 'iban') {
							const iban = this.getNodeParameter('iban', i) as string;
							counterpartyAlias = {
								type: 'IBAN',
								value: iban,
								name: recipientName,
							};
						} else if (counterpartyType === 'email') {
							const email = this.getNodeParameter('email', i) as string;
							counterpartyAlias = {
								type: 'EMAIL',
								value: email,
								name: recipientName,
							};
						} else if (counterpartyType === 'phone') {
							const phone = this.getNodeParameter('phone', i) as string;
							counterpartyAlias = {
								type: 'PHONE_NUMBER',
								value: phone,
								name: recipientName,
							};
						}

						const scheduleData: IDataObject = {
							payment: {
								amount: {
									value: amount,
									currency: currency,
								},
								counterparty_alias: counterpartyAlias,
								description: description,
							},
							schedule: {
								time_start: new Date(startDate).toISOString(),
								time_end: endDate ? new Date(endDate).toISOString() : undefined,
								recurrence_unit: scheduleType,
								recurrence_size: 1,
							},
						};

						const responseData = await bunqApiRequest.call(this, 'POST', baseEndpoint, scheduleData);
						const formattedResponse = formatBunqResponse(responseData);
						returnData.push(formattedResponse);
					}

					if (operation === 'get') {
						const scheduledPaymentId = this.getNodeParameter('scheduledPaymentId', i) as string;
						const endpoint = `${baseEndpoint}/${scheduledPaymentId}`;
						
						const responseData = await bunqApiRequest.call(this, 'GET', endpoint);
						const formattedResponse = formatBunqResponse(responseData);
						returnData.push(formattedResponse);
					}

					if (operation === 'list') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i) as IDataObject;
						
						let qs: IDataObject = {};
						
						if (filters.status) {
							qs.status = filters.status;
						}
						if (filters.scheduleType) {
							qs.recurrence_unit = filters.scheduleType;
						}
						
						if (returnAll) {
							const responseData = await bunqApiRequestAllItems.call(this, 'GET', baseEndpoint, {}, qs);
							returnData.push(...responseData.map(formatBunqResponse));
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							qs.count = limit;
							const responseData = await bunqApiRequest.call(this, 'GET', baseEndpoint, {}, qs);
							const formattedResponse = formatBunqResponse(responseData);
							
							if (formattedResponse.Response && Array.isArray(formattedResponse.Response)) {
								returnData.push(...formattedResponse.Response);
							} else {
								returnData.push(formattedResponse);
							}
						}
					}

					if (operation === 'update') {
						const scheduledPaymentId = this.getNodeParameter('scheduledPaymentId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
						const endpoint = `${baseEndpoint}/${scheduledPaymentId}`;
						
						const updateData: IDataObject = {};
						
						if (updateFields.status) {
							updateData.status = updateFields.status;
						}
						if (updateFields.amount) {
							updateData.payment = {
								amount: {
									value: updateFields.amount,
									currency: 'EUR', // Default currency for updates
								},
							};
						}
						if (updateFields.description) {
							if (!updateData.payment) {
								updateData.payment = {};
							}
							(updateData.payment as IDataObject).description = updateFields.description;
						}
						if (updateFields.endDate) {
							updateData.schedule = {
								time_end: new Date(updateFields.endDate as string).toISOString(),
							};
						}

						const responseData = await bunqApiRequest.call(this, 'PUT', endpoint, updateData);
						const formattedResponse = formatBunqResponse(responseData);
						returnData.push(formattedResponse);
					}

					if (operation === 'delete') {
						const scheduledPaymentId = this.getNodeParameter('scheduledPaymentId', i) as string;
						const endpoint = `${baseEndpoint}/${scheduledPaymentId}`;
						
						const responseData = await bunqApiRequest.call(this, 'DELETE', endpoint);
						const formattedResponse = formatBunqResponse(responseData);
						returnData.push(formattedResponse);
					}
				}

				if (resource === 'export') {
					const userId = this.getNodeParameter('userId', i) as string;
					const accountId = this.getNodeParameter('accountId', i) as string;
					const userEndpoint = userId ? `/user/${userId}` : '/user';
					const baseEndpoint = `${userEndpoint}/monetary-account/${accountId}/export-statement`;

					if (operation === 'createStatement') {
						const statementFormat = this.getNodeParameter('statementFormat', i) as string;
						const dateFrom = this.getNodeParameter('dateFrom', i) as string;
						const dateTo = this.getNodeParameter('dateTo', i) as string;
						const additionalOptions = this.getNodeParameter('additionalOptions', i) as IDataObject;

						const exportData: IDataObject = {
							statement_format: statementFormat,
							date_start: new Date(dateFrom).toISOString().split('T')[0],
							date_end: new Date(dateTo).toISOString().split('T')[0],
						};

						if (additionalOptions.includeAttachments) {
							exportData.include_attachment = true;
						}
						if (additionalOptions.regionalFormat) {
							exportData.regional_format = additionalOptions.regionalFormat;
						}
						if (additionalOptions.includeBalance !== undefined) {
							exportData.include_balance = additionalOptions.includeBalance;
						}
						if (additionalOptions.language) {
							exportData.language = additionalOptions.language;
						}

						const responseData = await bunqApiRequest.call(this, 'POST', baseEndpoint, exportData);
						const formattedResponse = formatBunqResponse(responseData);
						returnData.push(formattedResponse);
					}

					if (operation === 'getStatement') {
						const statementId = this.getNodeParameter('statementId', i) as string;
						const endpoint = `${baseEndpoint}/${statementId}`;
						
						const responseData = await bunqApiRequest.call(this, 'GET', endpoint);
						const formattedResponse = formatBunqResponse(responseData);
						returnData.push(formattedResponse);
					}

					if (operation === 'listStatements') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i) as IDataObject;
						
						let qs: IDataObject = {};
						
						if (filters.status) {
							qs.status = filters.status;
						}
						if (filters.format) {
							qs.statement_format = filters.format;
						}
						if (filters.createdAfter) {
							qs.created_after = (filters.createdAfter as Date).toISOString();
						}
						if (filters.createdBefore) {
							qs.created_before = (filters.createdBefore as Date).toISOString();
						}
						
						if (returnAll) {
							const responseData = await bunqApiRequestAllItems.call(this, 'GET', baseEndpoint, {}, qs);
							returnData.push(...responseData.map(formatBunqResponse));
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							qs.count = limit;
							const responseData = await bunqApiRequest.call(this, 'GET', baseEndpoint, {}, qs);
							const formattedResponse = formatBunqResponse(responseData);
							
							if (formattedResponse.Response && Array.isArray(formattedResponse.Response)) {
								returnData.push(...formattedResponse.Response);
							} else {
								returnData.push(formattedResponse);
							}
						}
					}

					if (operation === 'downloadStatement') {
						const statementId = this.getNodeParameter('statementId', i) as string;
						const downloadOptions = this.getNodeParameter('downloadOptions', i) as IDataObject;
						
						// First get the statement details to find the download URL
						const statementEndpoint = `${baseEndpoint}/${statementId}`;
						const statementData = await bunqApiRequest.call(this, 'GET', statementEndpoint);
						
						if (statementData.Response && statementData.Response[0] && statementData.Response[0].ExportStatement) {
							const exportStatement = statementData.Response[0].ExportStatement;
							
							if (exportStatement.status === 'COMPLETED' && exportStatement.download_url) {
								const downloadUrl = exportStatement.download_url;
								
								// Download the file content
								const fileResponse = await this.helpers.request({
									method: 'GET',
									url: downloadUrl,
									encoding: null, // Important for binary data
								});
								
								const binaryPropertyName = downloadOptions.binaryPropertyName as string || 'data';
								const customFileName = downloadOptions.fileName as string;
								const fileName = customFileName || `statement_${statementId}.${exportStatement.statement_format.toLowerCase()}`;
								
								const binaryData = await this.helpers.prepareBinaryData(
									fileResponse,
									fileName,
									exportStatement.content_type || 'application/octet-stream'
								);
								
								returnData.push({
									json: {
										statement_id: statementId,
										format: exportStatement.statement_format,
										status: exportStatement.status,
										file_size: binaryData.data.length,
										download_url: downloadUrl,
									},
									binary: {
										[binaryPropertyName]: binaryData,
									},
								});
							} else {
								throw new NodeOperationError(
									this.getNode(), 
									`Statement ${statementId} is not ready for download. Status: ${exportStatement.status}`
								);
							}
						} else {
							throw new NodeOperationError(this.getNode(), `Statement ${statementId} not found`);
						}
					}

					if (operation === 'deleteStatement') {
						const statementId = this.getNodeParameter('statementId', i) as string;
						const endpoint = `${baseEndpoint}/${statementId}`;
						
						const responseData = await bunqApiRequest.call(this, 'DELETE', endpoint);
						const formattedResponse = formatBunqResponse(responseData);
						returnData.push(formattedResponse);
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ error: (error as Error).message });
					continue;
				}
				throw error;
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}