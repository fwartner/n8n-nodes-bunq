# Security Policy

## Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in the bunq n8n integration, please report it responsibly:

### Private Disclosure

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please:

1. **Email**: Send details to [fwartner@gmail.com](mailto:fwartner@gmail.com)
2. **Subject**: Include "SECURITY" in the subject line
3. **Details**: Provide as much detail as possible about the vulnerability

### What to Include

Please include the following information:

- **Description**: Clear description of the vulnerability
- **Impact**: Potential impact and affected components
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Proof of Concept**: If applicable, include PoC code (responsibly)
- **Suggested Fix**: If you have ideas for remediation

### Response Timeline

- **Initial Response**: Within 48 hours
- **Assessment**: Within 5 business days
- **Fix Timeline**: Depends on severity (see below)
- **Public Disclosure**: After fix is released and users have time to update

### Severity Classification

| Severity | Description | Response Time |
|----------|-------------|---------------|
| **Critical** | Immediate threat to financial data or unauthorized access | 24-48 hours |
| **High** | Significant security risk | 1 week |
| **Medium** | Moderate security concern | 2 weeks |
| **Low** | Minor security issue | 1 month |

## Security Best Practices

### For Users

#### Credential Security
- **Never commit credentials** to version control
- **Use environment variables** for sensitive data
- **Rotate API keys** regularly
- **Use bunq Sandbox** for testing and development

#### Environment Security
- **Production vs Sandbox**: Always test in Sandbox first
- **Network Security**: Ensure secure network connections
- **Access Control**: Limit access to n8n instances with banking integrations
- **Audit Logs**: Monitor workflow execution logs

#### API Key Management
- **Principle of Least Privilege**: Only grant necessary permissions
- **Key Rotation**: Regularly rotate bunq API keys
- **Monitoring**: Monitor API key usage for suspicious activity
- **Revocation**: Immediately revoke compromised keys

### For Developers

#### Code Security
- **Input Validation**: Validate all user inputs
- **Output Encoding**: Properly encode outputs
- **Error Handling**: Don't leak sensitive information in errors
- **Dependency Security**: Keep dependencies updated

#### Data Handling
- **Encryption**: Encrypt sensitive data at rest and in transit
- **Logging**: Don't log sensitive information
- **Memory Management**: Clear sensitive data from memory
- **Secure Communication**: Use HTTPS for all API communications

## Security Features

### Built-in Security

#### Authentication
- **RSA Key Generation**: Automatic generation of secure RSA key pairs
- **Request Signing**: All API requests are cryptographically signed
- **Session Management**: Secure session token handling
- **Token Refresh**: Automatic token refresh with error recovery

#### Data Protection
- **Credential Encryption**: All credentials stored encrypted in n8n
- **Secure Headers**: Proper security headers in API requests
- **Certificate Validation**: SSL/TLS certificate validation
- **Rate Limiting**: Respect bunq API rate limits

#### Error Handling
- **Secure Error Messages**: Error messages don't expose sensitive data
- **Logging Controls**: Configurable logging levels
- **Failure Recovery**: Graceful handling of authentication failures

### Compliance

#### Standards Adherence
- **PSD2 Compliance**: Follows EU Payment Services Directive requirements
- **bunq Security**: Implements bunq's security best practices
- **n8n Standards**: Follows n8n security guidelines

#### Regulatory Considerations
- **Data Residency**: Understand where your data is processed
- **Audit Requirements**: Maintain appropriate audit trails
- **Compliance Reporting**: Support for compliance reporting needs

## Known Security Considerations

### bunq API Limitations
- **Rate Limiting**: bunq enforces API rate limits
- **Session Timeouts**: Sessions expire and need renewal
- **Geographic Restrictions**: Some regions may have restrictions

### n8n Integration
- **Workflow Security**: Secure your n8n workflows appropriately
- **Data Flow**: Understand data flow through your workflows
- **Credential Scope**: Limit credential access to necessary workflows

## Security Updates

### Notification Process
1. **Security Advisory**: Published for significant security issues
2. **Version Release**: Security fixes released as patch versions
3. **Migration Guide**: Instructions for updating securely
4. **Verification**: Steps to verify the fix is applied

### Update Recommendations
- **Automatic Updates**: Enable automatic security updates where possible
- **Testing**: Test security updates in development first
- **Monitoring**: Monitor for security-related issues after updates
- **Backup**: Backup configurations before applying updates

## Responsible Disclosure

We follow responsible disclosure practices:

1. **Coordinated Disclosure**: Work with reporters to coordinate disclosure timing
2. **Credit**: Security researchers will be credited (with permission)
3. **Public Advisory**: Security advisories published after fixes
4. **Community Notification**: n8n community notified of security updates

## Contact Information

### Security Team
- **Email**: [fwartner@gmail.com](mailto:fwartner@gmail.com)
- **GPG Key**: Available upon request for encrypted communication

### General Support
- **GitHub Issues**: For non-security issues
- **Documentation**: For usage questions
- **Community**: n8n community forums

## Legal

### Scope
This security policy applies to:
- The bunq n8n integration package
- Associated documentation and examples
- Security of the integration itself

This policy does NOT cover:
- Security of the bunq platform itself
- Security of n8n platform itself
- Security of your specific n8n installation
- General cybersecurity practices

### Disclaimer
While we strive to maintain high security standards, users are responsible for:
- Properly configuring and securing their n8n instances
- Following bunq's terms of service and security guidelines
- Implementing appropriate security controls for their use case
- Regularly updating to the latest versions

Thank you for helping keep the bunq n8n integration secure!