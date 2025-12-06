# Security Notes

This document tracks security-related issues, vulnerabilities, and mitigation strategies for the AIAS platform.

## Dependency Vulnerabilities

### Current Known Issues

#### Moderate Severity

1. **ai package (<=5.0.51)**
   - **Issue**: Vercel's AI SDK's filetype whitelists can be bypassed when uploading files
   - **CVE**: [GHSA-rwvc-j5jr-mgvh](https://github.com/advisories/GHSA-rwvc-j5jr-mgvh)
   - **Status**: Fix available via `npm audit fix --force` (will install ai@5.0.107, breaking change)
   - **Mitigation**: Review breaking changes before upgrading
   - **Priority**: Medium

2. **bl package (<=1.2.2)**
   - **Issue**: Memory Exposure in bl
   - **CVE**: [GHSA-wrw9-m778-g6mc](https://github.com/advisories/GHSA-wrw9-m778-g6mc)
   - **Status**: Fix available via `npm audit fix`
   - **Dependency Chain**: levelup → level-spaces → level-ttl
   - **Priority**: Low (dev dependency chain)

#### High Severity

1. **axios (<=0.30.1)**
   - **Issues**:
     - Cross-Site Request Forgery Vulnerability
     - DoS attack through lack of data size check
     - Requests Vulnerable To Possible SSRF and Credential Leakage
   - **CVEs**: 
     - [GHSA-wf5p-g6vw-rhxx](https://github.com/advisories/GHSA-wf5p-g6vw-rhxx)
     - [GHSA-4hjh-wcwx-xvwj](https://github.com/advisories/GHSA-4hjh-wcwx-xvwj)
     - [GHSA-jr5f-v2jv-69x6](https://github.com/advisories/GHSA-jr5f-v2jv-69x6)
   - **Status**: Fix available via `npm audit fix --force` (will install postmark@4.0.5, breaking change)
   - **Dependency Chain**: postmark → axios
   - **Priority**: High (requires breaking change review)

2. **cookie (<0.7.0)**
   - **Issue**: Accepts cookie name, path, and domain with out of bounds characters
   - **CVE**: [GHSA-pxg6-pf52-xh8x](https://github.com/advisories/GHSA-pxg6-pf52-xh8x)
   - **Status**: Fix available via `npm audit fix --force` (will install lighthouse-ci@1.10.0, breaking change)
   - **Dependency Chain**: @sentry/node → cookie (dev dependency)
   - **Priority**: Low (dev dependency)

## Security Best Practices

### Environment Variables

- ✅ All secrets are stored in environment variables
- ✅ `.env.example` file exists with placeholder values
- ✅ `.gitignore` excludes `.env*` files
- ✅ No hardcoded secrets in the codebase

### Authentication & Authorization

- ✅ Admin routes protected via Basic Auth or Vercel Access Controls
- ✅ Content Studio routes require authentication token
- ✅ Multi-tenant isolation enforced at middleware level
- ✅ Server-side validation for all protected operations

### Security Headers

- ✅ Content-Security-Policy configured
- ✅ X-Frame-Options: SAMEORIGIN
- ✅ X-Content-Type-Options: nosniff
- ✅ Strict-Transport-Security enabled
- ✅ Referrer-Policy configured
- ✅ Permissions-Policy configured

### Input Validation

- ✅ Zod schemas for environment variable validation
- ✅ Input validation on API routes
- ✅ Type-safe configuration module

### Rate Limiting

- ✅ Rate limiting implemented in middleware
- ✅ Per-endpoint rate limit configuration
- ✅ IP and user-based rate limiting

## Remediation Plan

### Immediate Actions

1. **Review and upgrade ai package** (breaking change)
   - Test file upload functionality after upgrade
   - Verify filetype whitelist behavior

2. **Review and upgrade postmark package** (breaking change)
   - Test email sending functionality
   - Verify API compatibility

### Ongoing Actions

1. **Regular dependency audits**: Run `npm audit` weekly
2. **Automated security scanning**: CI workflow includes security scan
3. **Dependency updates**: Review and apply security patches monthly

## Reporting Security Issues

**Do not** open public issues for security vulnerabilities.

Report security issues to: **scottrmhardie@gmail.com**

We will:
- Acknowledge receipt within 48 hours
- Work with you to resolve the issue
- Credit you for responsible disclosure (with your permission)

## Security Checklist

Before deploying to production:

- [ ] All environment variables set and validated
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Admin routes protected
- [ ] Content Studio routes protected
- [ ] No hardcoded secrets
- [ ] Input validation on all API routes
- [ ] Dependencies audited (`npm audit`)
- [ ] Security scan passed in CI

---

**Last Updated**: 2025-01-31  
**Next Review**: 2025-02-28
