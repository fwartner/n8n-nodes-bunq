# bunq OAuth2 Setup Guide

This guide explains how to set up OAuth2 authentication for the bunq n8n integration.

## Overview

The bunq n8n node now supports both OAuth2 and legacy API key authentication methods:

- **OAuth2 (Recommended)**: More secure, follows modern standards, easier token management
- **Legacy API Key**: Still supported for backward compatibility

## OAuth2 Setup

### 1. Register Your OAuth Application

1. **Visit bunq Developer Portal:**
   - Sandbox: https://developer.sandbox.bunq.com/
   - Production: https://developer.bunq.com/

2. **Create a New Application:**
   - Log in with your bunq account
   - Navigate to "My Apps" or "Applications"
   - Click "Create new app"

3. **Configure Your Application:**
   - **Name**: Choose a descriptive name (e.g., "My n8n Integration")
   - **Description**: Describe what your integration does
   - **Redirect URI**: Set to your n8n callback URL (see below)
   - **Scopes**: Select the permissions you need:
     - `account_info`: Access to account information
     - `payments`: Create and manage payments
     - `user_info`: Access to user profile information

4. **Note Your Credentials:**
   - **Client ID**: Public identifier for your app
   - **Client Secret**: Secret key (keep this secure!)

### 2. Configure n8n Redirect URI

Your OAuth redirect URI should follow this pattern:
```
https://your-n8n-instance.com/rest/oauth2-credential/callback
```

Examples:
- Local development: `http://localhost:5678/rest/oauth2-credential/callback`
- Production: `https://n8n.yourcompany.com/rest/oauth2-credential/callback`

### 3. Set Up Credentials in n8n

1. **Create OAuth2 Credentials:**
   - In n8n, go to "Credentials"
   - Click "Create new credential"
   - Select "bunq OAuth2 API"

2. **Fill in the Configuration:**
   - **Environment**: Choose "Sandbox" or "Production"
   - **Client ID**: From your bunq app registration
   - **Client Secret**: From your bunq app registration
   - **API Key**: Your bunq API key (still required for some operations)

3. **Complete OAuth Flow:**
   - Click "Connect my account"
   - You'll be redirected to bunq for authorization
   - Log in and approve the permissions
   - You'll be redirected back to n8n with access tokens

## Using OAuth2 in Workflows

### Basic Usage

1. **Create a Bunq Node:**
   - Add a "bunq" node to your workflow
   - In the credential dropdown, select your OAuth2 credentials

2. **The node will automatically:**
   - Use OAuth Bearer tokens for authentication
   - Handle token refresh when needed
   - Fallback to legacy authentication if OAuth fails

### Supported Operations

All bunq operations work with OAuth2:
- User management
- Account operations
- Payments and transactions
- Webhooks and triggers
- File attachments
- bunq.me links

## Testing OAuth Integration

### 1. Test OAuth Flow

Use the provided test script:
```bash
node test-oauth-flow.js
```

This will:
- Generate authorization URLs for both environments
- Provide a callback server for testing
- Show examples for token exchange

### 2. Test n8n Integration

Use the n8n OAuth test:
```bash
node test-n8n-oauth.js
```

Update the script with your actual OAuth credentials to test API calls.

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**
   - Ensure the redirect URI in bunq matches exactly what n8n expects
   - Check for trailing slashes and protocol (http vs https)

2. **"Invalid client credentials"**
   - Verify Client ID and Client Secret are correct
   - Ensure you're using the right environment (sandbox vs production)

3. **"Insufficient permissions"**
   - Check that your OAuth app has the required scopes
   - Re-authorize if you've changed scopes

4. **Token expired errors**
   - OAuth tokens are automatically refreshed
   - If issues persist, re-authorize the connection

### Debug Mode

Enable debug logging in n8n to see OAuth requests:
```bash
N8N_LOG_LEVEL=debug npm start
```

## Security Best Practices

1. **Keep Client Secret Secure:**
   - Never commit client secrets to version control
   - Use environment variables for sensitive data
   - Rotate secrets regularly

2. **Use HTTPS:**
   - Always use HTTPS for production redirect URIs
   - Secure your n8n instance with SSL/TLS

3. **Scope Limitation:**
   - Only request the minimum scopes needed
   - Review permissions regularly

4. **Token Management:**
   - Tokens are stored securely by n8n
   - They're automatically refreshed when needed
   - Revoke access if no longer needed

## Migration from API Key

If you're currently using API key authentication:

1. **Create OAuth credentials** as described above
2. **Update your workflows** to use the new OAuth credentials
3. **Test thoroughly** in sandbox environment first
4. **Keep API key credentials** as backup during transition

The integration supports both methods simultaneously, so you can migrate gradually.

## API Rate Limits

OAuth2 authentication may have different rate limits than API key authentication:

- **Sandbox**: Usually more generous limits for testing
- **Production**: Standard bunq API limits apply
- **Best Practice**: Implement proper error handling and retry logic

## Further Reading

- [bunq API Documentation](https://doc.bunq.com/)
- [OAuth 2.0 Specification](https://tools.ietf.org/html/rfc6749)
- [n8n Credential Documentation](https://docs.n8n.io/credentials/)

## Support

If you encounter issues:

1. Check this documentation first
2. Review bunq's API documentation
3. Test with the provided scripts
4. Check n8n logs for detailed error messages
5. Contact bunq support for API-specific issues