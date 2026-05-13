# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| Latest minor | Yes |
| Older minors | Bug fixes only for 6 months after the next minor release |

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Report security issues by email to **baotrung06092003@gmail.com** with the subject line:

```
[react-truncate] Security vulnerability report
```

Include:
- A description of the vulnerability and its potential impact
- Steps to reproduce or a proof-of-concept
- Affected versions

You will receive a response within **72 hours**. Once the issue is confirmed, a fix will be released as a patch version and the vulnerability will be disclosed publicly after the fix is available.

## Scope

This package is a client-side React component with no server-side execution, no network requests, and no persistence layer. The attack surface is limited to:

- Malicious content in the `children` (text) prop — rendered as text nodes, not HTML, so XSS via props is not possible
- Supply chain attacks via compromised dependencies — mitigated by lockfile integrity checks and weekly automated audits (see [security workflow](.github/workflows/security.yml))
