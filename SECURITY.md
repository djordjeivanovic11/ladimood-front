# Security Policy

## Supported Versions

Security fixes are applied to the active development branch. Older deployments are not supported unless agreed separately.

| Version / branch | Supported |
| ---------------- | --------- |
| `main` (latest)  | Yes       |
| Other branches   | No        |

## Reporting a Vulnerability

If you discover a security issue in **ladimood-front**, please report it responsibly.

**Preferred:** [Open a private security advisory](https://github.com/djordjeivanovic11/ladimood-front/security/advisories/new) on GitHub.

Please include:

- A clear description of the issue
- Steps to reproduce
- Impact (what an attacker could do)
- Any suggested fix, if you have one

Do **not** open a public GitHub issue for security vulnerabilities.

### What to expect

- **Acknowledgement:** within 3 business days
- **Status update:** within 7 business days with triage outcome (accepted, needs more info, or declined)
- **Fix timeline:** depends on severity; critical issues are prioritized
- **Disclosure:** we coordinate with you before any public disclosure once a fix is available

## Dependency Security

This repository uses [Dependabot](https://github.com/djordjeivanovic11/ladimood-front/security/dependabot) to monitor third-party dependencies.

Maintainers review and address alerts on the default branch. If you see a vulnerable dependency in production, report it through the process above or open a regular issue for non-sensitive dependency upgrade requests.

## Scope

This policy covers the **ladimood-front** repository (Next.js storefront and admin UI). Backend/API issues for the Ladimood platform should be reported separately if they affect customer data or authentication.
