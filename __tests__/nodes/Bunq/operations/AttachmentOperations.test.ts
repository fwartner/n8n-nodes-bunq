import { Bunq } from '../../../../nodes/Bunq/Bunq.node';
import { IExecuteFunctions, IBinaryData, INode } from 'n8n-workflow';

// Mock the GenericFunctions
jest.mock('../../../../nodes/Bunq/GenericFunctions', () => ({
	bunqApiRequest: jest.fn(),
	bunqApiRequestAllItems: jest.fn(),
	formatBunqResponse: jest.fn((response) => response),
	initializeBunqSession: jest.fn(),
}));

const mockBunqApiRequest = require('../../../../nodes/Bunq/GenericFunctions').bunqApiRequest;
const mockInitializeBunqSession = require('../../../../nodes/Bunq/GenericFunctions').initializeBunqSession;

describe('Bunq Node - Attachment Operations', () => {
	let bunqNode: Bunq;
	let mockExecuteFunctions: Partial<IExecuteFunctions>;

	beforeEach(() => {
		bunqNode = new Bunq();
		
		mockExecuteFunctions = {
			getInputData: jest.fn(() => [{ json: {} }]),
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn(),
			helpers: {
				returnJsonArray: jest.fn((data) => data),
				request: jest.fn(),
				assertBinaryData: jest.fn(),
				prepareBinaryData: jest.fn(),
			} as any,
			getNode: jest.fn((): INode => ({
			id: 'test-node-id',
			name: 'test-node',
			typeVersion: 1,
			type: 'n8n-nodes-bunq.bunq',
			position: [0, 0],
			parameters: {},
		})),
			continueOnFail: jest.fn(() => false),
		};

		// Reset mocks
		jest.clearAllMocks();
		mockInitializeBunqSession.mockResolvedValue({});
	});

	describe('Upload Operation', () => {
		beforeEach(() => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((paramName) => {
					switch (paramName) {
						case 'resource': return 'attachment';
						case 'operation': return 'upload';
						case 'userId': return '';
						case 'file': return 'document';
						case 'description': return 'Test document';
						case 'contentType': return 'PDF';
						case 'linkContext': return { paymentId: '123' };
						default: return undefined;
					}
				});
		});

		it('should upload attachment with payment link', async () => {
			const mockBinaryData: IBinaryData = {
				data: Buffer.from('test pdf content').toString('base64'),
				mimeType: 'application/pdf',
				fileName: 'test.pdf',
				fileExtension: 'pdf',
			};

			(mockExecuteFunctions.helpers?.assertBinaryData as jest.Mock)
				.mockReturnValue(mockBinaryData);

			const mockUploadResponse = {
				Response: [{
					AttachmentPublic: {
						id: 456,
						attachment: {
							urls: {
								public: 'https://upload.bunq.com/upload/456'
							}
						}
					}
				}]
			};

			mockBunqApiRequest.mockResolvedValue(mockUploadResponse);
			(mockExecuteFunctions.helpers?.request as jest.Mock).mockResolvedValue('Upload success');

			await bunqNode.execute.call(mockExecuteFunctions as IExecuteFunctions);

			// Verify attachment metadata creation
			expect(mockBunqApiRequest).toHaveBeenCalledWith(
				'POST',
				'/user/attachment-public',
				expect.objectContaining({
					description: 'Test document',
					content_type: 'PDF',
					attached_object: {
						id: '123',
						type: 'Payment',
					},
				})
			);

			// Verify file upload
			expect(mockExecuteFunctions.helpers?.request).toHaveBeenCalledWith({
				method: 'PUT',
				url: 'https://upload.bunq.com/upload/456',
				body: mockBinaryData.data,
				headers: {
					'Content-Type': 'PDF',
					'Content-Length': '24',
				},
			});
		});

		it('should upload attachment with auto-detected content type', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((paramName) => {
					switch (paramName) {
						case 'resource': return 'attachment';
						case 'operation': return 'upload';
						case 'file': return 'image';
						case 'description': return 'Test image';
						case 'contentType': return 'auto';
						case 'linkContext': return {};
						default: return undefined;
					}
				});

			const mockBinaryData: IBinaryData = {
				data: Buffer.from('test image content').toString('base64'),
				mimeType: 'image/jpeg',
				fileName: 'test.jpg',
				fileExtension: 'jpg',
			};

			(mockExecuteFunctions.helpers?.assertBinaryData as jest.Mock)
				.mockReturnValue(mockBinaryData);

			const mockUploadResponse = {
				Response: [{
					AttachmentPublic: {
						attachment: {
							urls: { public: 'https://upload.bunq.com/upload/789' }
						}
					}
				}]
			};

			mockBunqApiRequest.mockResolvedValue(mockUploadResponse);

			await bunqNode.execute.call(mockExecuteFunctions as IExecuteFunctions);

			expect(mockBunqApiRequest).toHaveBeenCalledWith(
				'POST',
				'/user/attachment-public',
				expect.objectContaining({
					content_type: 'image/jpeg',
				})
			);
		});

		it('should upload attachment with request inquiry link', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((paramName) => {
					switch (paramName) {
						case 'resource': return 'attachment';
						case 'operation': return 'upload';
						case 'file': return 'document';
						case 'description': return 'Invoice';
						case 'contentType': return 'PDF';
						case 'linkContext': return { requestInquiryId: '999' };
						default: return undefined;
					}
				});

			const mockBinaryData: IBinaryData = {
				data: Buffer.from('invoice content').toString('base64'),
				mimeType: 'application/pdf',
				fileName: 'invoice.pdf',
				fileExtension: 'pdf',
			};

			(mockExecuteFunctions.helpers?.assertBinaryData as jest.Mock)
				.mockReturnValue(mockBinaryData);

			mockBunqApiRequest.mockResolvedValue({
				Response: [{
					AttachmentPublic: {
						attachment: { urls: { public: 'https://upload.bunq.com/upload/111' } }
					}
				}]
			});

			await bunqNode.execute.call(mockExecuteFunctions as IExecuteFunctions);

			expect(mockBunqApiRequest).toHaveBeenCalledWith(
				'POST',
				'/user/attachment-public',
				expect.objectContaining({
					attached_object: {
						id: '999',
						type: 'RequestInquiry',
					},
				})
			);
		});
	});

	describe('Get Operation', () => {
		it('should get specific attachment', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((paramName) => {
					switch (paramName) {
						case 'resource': return 'attachment';
						case 'operation': return 'get';
						case 'attachmentId': return '456';
						default: return undefined;
					}
				});

			const mockResponse = {
				Response: [{
					AttachmentPublic: {
						id: 456,
						description: 'Test document',
						content_type: 'application/pdf',
						size: 1024,
					}
				}]
			};

			mockBunqApiRequest.mockResolvedValue(mockResponse);

			await bunqNode.execute.call(mockExecuteFunctions as IExecuteFunctions);

			expect(mockBunqApiRequest).toHaveBeenCalledWith(
				'GET',
				'/user/attachment-public/456'
			);
		});
	});

	describe('List Operation', () => {
		it('should list attachments with filters', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((paramName) => {
					switch (paramName) {
						case 'resource': return 'attachment';
						case 'operation': return 'list';
						case 'returnAll': return false;
						case 'limit': return 25;
						case 'additionalFields': return {
							contentType: 'application/pdf',
							sizeMin: '1000',
							sizeMax: '10000',
							createdAfter: new Date('2024-01-01'),
							createdBefore: new Date('2024-12-31'),
						};
						default: return undefined;
					}
				});

			const mockResponse = {
				Response: [
					{ AttachmentPublic: { id: 1, content_type: 'application/pdf' } },
					{ AttachmentPublic: { id: 2, content_type: 'application/pdf' } },
				]
			};

			mockBunqApiRequest.mockResolvedValue(mockResponse);

			await bunqNode.execute.call(mockExecuteFunctions as IExecuteFunctions);

			expect(mockBunqApiRequest).toHaveBeenCalledWith(
				'GET',
				'/user/attachment-public',
				{},
				expect.objectContaining({
					count: 25,
					content_type: 'application/pdf',
					size_min: '1000',
					size_max: '10000',
					created_after: '2024-01-01T00:00:00.000Z',
					created_before: '2024-12-31T00:00:00.000Z',
				})
			);
		});

		it('should list all attachments when returnAll is true', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((paramName) => {
					switch (paramName) {
						case 'resource': return 'attachment';
						case 'operation': return 'list';
						case 'returnAll': return true;
						case 'additionalFields': return {};
						default: return undefined;
					}
				});

			const mockAttachments = [
				{ id: 1, description: 'Doc 1' },
				{ id: 2, description: 'Doc 2' },
				{ id: 3, description: 'Doc 3' },
			];

			const mockBunqApiRequestAllItems = require('../../../../nodes/Bunq/GenericFunctions').bunqApiRequestAllItems;
			mockBunqApiRequestAllItems.mockResolvedValue(mockAttachments);

			await bunqNode.execute.call(mockExecuteFunctions as IExecuteFunctions);

			expect(mockBunqApiRequestAllItems).toHaveBeenCalledWith(
				'GET',
				'/user/attachment-public',
				{},
				{}
			);
		});
	});

	describe('Delete Operation', () => {
		it('should delete attachment', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((paramName) => {
					switch (paramName) {
						case 'resource': return 'attachment';
						case 'operation': return 'delete';
						case 'attachmentId': return '456';
						default: return undefined;
					}
				});

			const mockResponse = { Response: [] };
			mockBunqApiRequest.mockResolvedValue(mockResponse);

			await bunqNode.execute.call(mockExecuteFunctions as IExecuteFunctions);

			expect(mockBunqApiRequest).toHaveBeenCalledWith(
				'DELETE',
				'/user/attachment-public/456'
			);
		});
	});

	describe('Error Handling', () => {
		it('should handle missing binary data', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((paramName) => {
					switch (paramName) {
						case 'resource': return 'attachment';
						case 'operation': return 'upload';
						case 'file': return 'missing';
						default: return undefined;
					}
				});

			(mockExecuteFunctions.helpers?.assertBinaryData as jest.Mock)
				.mockImplementation(() => {
					throw new Error('No binary data found');
				});

			await expect(
				bunqNode.execute.call(mockExecuteFunctions as IExecuteFunctions)
			).rejects.toThrow('No binary data found');
		});

		it('should handle upload URL not provided', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((paramName) => {
					switch (paramName) {
						case 'resource': return 'attachment';
						case 'operation': return 'upload';
						case 'file': return 'document';
						case 'description': return 'Test';
						case 'contentType': return 'PDF';
						case 'linkContext': return {};
						default: return undefined;
					}
				});

			(mockExecuteFunctions.helpers?.assertBinaryData as jest.Mock)
				.mockReturnValue({
					data: Buffer.from('test').toString('base64'),
					mimeType: 'application/pdf',
				});

			// Mock response without upload URL
			mockBunqApiRequest.mockResolvedValue({
				Response: [{ AttachmentPublic: { id: 456 } }]
			});

			await bunqNode.execute.call(mockExecuteFunctions as IExecuteFunctions);

			// Should still create attachment metadata even without upload URL
			expect(mockBunqApiRequest).toHaveBeenCalledWith(
				'POST',
				'/user/attachment-public',
				expect.any(Object)
			);
		});

		it('should fallback to default content type when auto-detection fails', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((paramName) => {
					switch (paramName) {
						case 'resource': return 'attachment';
						case 'operation': return 'upload';
						case 'file': return 'unknown';
						case 'description': return 'Unknown file';
						case 'contentType': return 'auto';
						case 'linkContext': return {};
						default: return undefined;
					}
				});

			(mockExecuteFunctions.helpers?.assertBinaryData as jest.Mock)
				.mockReturnValue({
					data: Buffer.from('unknown content').toString('base64'),
					// No mimeType provided
					fileName: 'unknown',
				});

			mockBunqApiRequest.mockResolvedValue({
				Response: [{ AttachmentPublic: { id: 789 } }]
			});

			await bunqNode.execute.call(mockExecuteFunctions as IExecuteFunctions);

			expect(mockBunqApiRequest).toHaveBeenCalledWith(
				'POST',
				'/user/attachment-public',
				expect.objectContaining({
					content_type: 'application/octet-stream',
				})
			);
		});
	});
});