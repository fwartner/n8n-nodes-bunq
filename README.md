# bunq n8n Integration

A comprehensive n8n community node package that provides full integration with the bunq API, enabling automated banking workflows and financial process automation.

[![npm version](https://badge.fury.io/js/n8n-nodes-bunq.svg)](https://badge.fury.io/js/n8n-nodes-bunq)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://github.com/fwartner/n8n-nodes-bunq/actions/workflows/test.yml/badge.svg)](https://github.com/fwartner/n8n-nodes-bunq/actions/workflows/test.yml)

## Features

### 🏦 **Complete Banking Operations**
- **User Management**: Retrieve user information and account details
- **Monetary Accounts**: List and manage bank accounts, check balances
- **Payments**: Create, list, update, and cancel payments with IBAN/email support
- **Transactions**: Comprehensive transaction history with advanced filtering
- **Request Inquiries**: Create and manage payment requests

### 💳 **Advanced Card Management**
- **Card Operations**: List, activate, and deactivate cards
- **Limits Management**: Set and retrieve daily/monthly spending limits
- **PIN Management**: Update card PINs securely
- **Real-time Control**: Instant card status updates

### 📎 **File & Document Handling**
- **Attachments**: Upload and manage files (receipts, invoices, documents)
- **Content Types**: Support for PDF, images, and various document formats
- **Linking**: Attach files to payments, requests, or transactions

### 🔗 **Payment Links & Automation**
- **bunq.me Links**: Create shareable payment links with custom amounts
- **QR Codes**: Generate QR codes for instant payments
- **Expiration Control**: Set automatic link expiration

### 🔔 **Real-time Webhooks**
- **Event Triggers**: Real-time notifications for payments, transactions, card usage
- **Smart Filtering**: Filter by amount, description, account, or event type
- **Instant Automation**: Trigger workflows immediately when events occur

### 📊 **Export & Reporting**
- **Statement Generation**: Create CSV/PDF statements for any date range
- **Bulk Export**: Export transaction data for accounting systems
- **Scheduled Reports**: Automate regular financial reports

### ⚡ **Scheduled Operations**
- **Recurring Payments**: Set up automatic recurring transfers
- **Payment Scheduling**: Schedule future payments and transfers
- **Batch Processing**: Handle multiple operations efficiently

## Installation

### Community Nodes (Recommended)

1. Go to **Settings > Community Nodes** in your n8n instance
2. Click **Install a community node**
3. Enter: `n8n-nodes-bunq`
4. Click **Install**

### Manual Installation

```bash
# In your n8n installation directory
npm install n8n-nodes-bunq
```

### Docker

Add to your docker-compose.yml:

```yaml
version: '3.8'
services:
  n8n:
    image: n8nio/n8n
    environment:
      - N8N_NODES_INCLUDE=n8n-nodes-bunq
```

## Quick Setup

### 1. Get Your bunq API Key

1. Open the bunq app on your phone
2. Go to **Profile → Security & Settings → Developers → API keys**
3. Create a new API key
4. **Important**: Start with Sandbox environment for testing

### 2. Configure Credentials in n8n

1. Create new **bunq API** credentials
2. Enter your API key
3. Select environment (Sandbox for testing, Production for real use)
4. Save credentials (other fields auto-generate on first use)

### 3. Add bunq Node to Workflow

1. Add the **bunq** node to your workflow
2. Select your credentials
3. Choose resource (User, Payment, Transaction, etc.)
4. Configure the specific operation

## Usage Examples

### Simple Payment Creation

```javascript
// Create a payment to an IBAN
Resource: Payment
Operation: Create
Account ID: 12345
Amount: 100.00
Currency: EUR
Recipient Type: IBAN
IBAN: NL91ABNA0417164300
Recipient Name: John Doe
Description: Invoice payment
```

### Real-time Payment Monitoring

```javascript
// BunqTrigger node configuration
Events: Payment Created, Payment Updated
Account ID: 12345
Filters:
  - Minimum Amount: 50.00
  - Description Contains: "invoice"
```

### Automated Statement Generation

```javascript
// Export monthly statements
Resource: Export
Operation: Create Statement
Account ID: 12345
Format: CSV
Date From: {{ $now.minus({months: 1}).startOf('month') }}
Date To: {{ $now.minus({months: 1}).endOf('month') }}
```

### Transaction Analysis

```javascript
// Get transactions with filters
Resource: Transaction
Operation: List
Account ID: 12345
Filters:
  - Date From: 2024-01-01
  - Date To: 2024-01-31
  - Minimum Amount: 100.00
Return All: true
```

## Available Resources

| Resource | Operations | Description |
|----------|------------|-------------|
| **User** | Get, List | User account information |
| **Monetary Account** | List, Get, Update | Bank account management |
| **Payment** | Create, Get, List, Update, Cancel | Payment operations |
| **Transaction** | List, Get | Transaction history |
| **Request Inquiry** | Create, Get, List, Update, Cancel | Payment requests |
| **Card** | List, Get, Set Limits, Get Limits, Update PIN | Card management |
| **Attachment** | Upload, Get, List, Delete | File management |
| **bunq.me** | Create, Get, List, Update | Payment links |
| **Webhook** | Create, Get, List, Delete | Notification management |
| **Scheduled Payment** | Create, Get, List, Update, Delete | Recurring payments |
| **Export** | Create Statement, Get Statement, Download | Data export |

## Advanced Features

### Webhook Integration

The BunqTrigger node provides real-time event processing:

- **Automatic Setup**: Webhooks are automatically registered with bunq
- **Event Filtering**: Only receive events you're interested in
- **Smart Filtering**: Filter by amount, description, or other criteria
- **Reliable Delivery**: Built-in retry logic and error handling

### Error Handling

- **Comprehensive Error Messages**: Clear, actionable error descriptions
- **Retry Logic**: Automatic retries for transient failures
- **Continue on Fail**: Option to continue workflow on errors
- **Rate Limiting**: Automatic handling of API rate limits

### Security Features

- **Secure Credential Storage**: All sensitive data encrypted
- **Auto-generated Keys**: RSA keys generated automatically
- **Session Management**: Automatic session token refresh
- **Request Signing**: All requests cryptographically signed

## Testing

The package includes comprehensive tests covering all functionality:

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --testNamePattern="Payment Operations"

# Run tests with coverage
npm run test:coverage
```

## API Coverage

This package provides access to **300+ bunq API endpoints** across all major banking operations:

- ✅ Complete user and account management
- ✅ Full payment lifecycle (create, track, cancel)
- ✅ Comprehensive transaction handling
- ✅ Advanced card management and controls
- ✅ File attachment and document management
- ✅ Payment link generation and management
- ✅ Real-time webhook notifications
- ✅ Scheduled and recurring payments
- ✅ Statement generation and export
- ✅ Advanced filtering and search capabilities

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/fwartner/n8n-nodes-bunq.git
cd n8n-nodes-bunq

# Install dependencies
npm install

# Run tests
npm test

# Build the package
npm run build
```

### Reporting Issues

Please use the [GitHub Issues](https://github.com/fwartner/n8n-nodes-bunq/issues) page to report bugs or request features.

## Documentation

- [bunq API Documentation](https://doc.bunq.com/)
- [n8n Community Nodes](https://docs.n8n.io/integrations/community-nodes/)
- [Node Development Guide](https://docs.n8n.io/integrations/creating-nodes/)

## Support

- 📖 [Documentation](https://github.com/fwartner/n8n-nodes-bunq/wiki)
- 🐛 [Bug Reports](https://github.com/fwartner/n8n-nodes-bunq/issues)
- 💬 [Discussions](https://github.com/fwartner/n8n-nodes-bunq/discussions)
- 🔗 [n8n Community](https://community.n8n.io/)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This is an unofficial integration. bunq is a trademark of bunq B.V. This project is not affiliated with, endorsed by, or sponsored by bunq B.V.

**Important**: Always test thoroughly in the bunq Sandbox environment before using in production with real money.

---

**Made with ❤️ for the n8n and bunq communities**

[![GitHub stars](https://img.shields.io/github/stars/fwartner/n8n-nodes-bunq?style=social)](https://github.com/fwartner/n8n-nodes-bunq/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/fwartner/n8n-nodes-bunq?style=social)](https://github.com/fwartner/n8n-nodes-bunq/network/members)