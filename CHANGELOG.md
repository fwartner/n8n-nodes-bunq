# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of bunq n8n integration
- Complete bunq API integration with 300+ endpoints
- Comprehensive banking operations support
- Real-time webhook functionality
- Advanced security with automatic session management

## [0.1.0] - 2024-06-11

### Added

#### Core Banking Operations
- **User Management**: Get user information and list users
- **Monetary Accounts**: List, get, and update bank account information
- **Payments**: Create, get, list, update, and cancel payments
  - Support for IBAN and email recipients
  - Amount and currency validation
  - Custom descriptions and references
- **Transactions**: Comprehensive transaction history with advanced filtering
  - Date range filtering
  - Amount range filtering
  - Description and reference filtering
  - Pagination support

#### Payment Management
- **Request Inquiries**: Create and manage payment requests
  - Incoming payment request creation
  - Status tracking and updates
  - Accept/reject functionality
  - Automatic expiration handling

#### Card Management
- **Card Operations**: List and manage payment cards
- **Limit Management**: Set and retrieve daily/monthly spending limits
  - ATM withdrawal limits
  - POS payment limits
  - Online payment limits
- **PIN Management**: Secure PIN update functionality
- **Card Status**: Activate, deactivate, and freeze cards

#### File Management
- **Attachments**: Upload and manage files
  - PDF, image, and document support
  - Link attachments to payments and transactions
  - Content type auto-detection
  - File size validation

#### Payment Links
- **bunq.me Integration**: Create shareable payment links
  - Custom amounts and descriptions
  - Expiration date control
  - Allow higher amounts option
  - Custom redirect URLs

#### Real-time Notifications
- **Webhook Support**: Real-time event notifications via BunqTrigger node
  - Payment created/updated events
  - Transaction notifications
  - Card usage alerts
  - Request inquiry updates
  - Smart filtering by amount, description, or account
  - Automatic webhook registration and cleanup

#### Automation Features
- **Scheduled Payments**: Set up recurring payment automation
  - Daily, weekly, monthly, and yearly schedules
  - Custom start dates and end conditions
  - Automatic execution with error handling
- **Export/Statement**: Generate and download account statements
  - CSV, PDF, MT940, and CAMT053 formats
  - Custom date ranges
  - Include attachments option
  - Automatic file download to n8n

#### Advanced Features
- **Session Management**: Automatic bunq API session handling
  - Device registration
  - Session token generation and refresh
  - Request signing with RSA keys
  - Error recovery and retry logic
- **Pagination**: Efficient handling of large datasets
  - Automatic pagination for list operations
  - Configurable page sizes
  - "Return All" option for complete datasets
- **Error Handling**: Comprehensive error management
  - bunq-specific error codes
  - Network failure recovery
  - Rate limit handling
  - User-friendly error messages

#### Security Features
- **Credential Management**: Secure storage of sensitive data
  - Encrypted API keys and tokens
  - Auto-generated RSA key pairs
  - Session token encryption
- **Request Signing**: Cryptographic request authentication
  - SHA-256 signature generation
  - Request integrity verification
  - Automatic signature headers

#### Testing Infrastructure
- **Comprehensive Test Suite**: 86 passing tests covering all functionality
  - Unit tests for all operations
  - Integration tests for complete workflows
  - Mock implementations for safe testing
  - Error scenario coverage
  - TypeScript type safety validation

### Technical Details
- Built with TypeScript for type safety
- Follows n8n community node standards
- Compatible with n8n v1.0+
- Supports both bunq Sandbox and Production environments
- Full ESLint and Prettier integration
- Jest testing framework with 100% pass rate

### Documentation
- Comprehensive README with usage examples
- Contributing guidelines
- GitHub issue templates
- Pull request templates
- Automated CI/CD with GitHub Actions