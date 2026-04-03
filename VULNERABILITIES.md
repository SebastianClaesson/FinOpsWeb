# Vulnerabilities & Security Considerations

This document tracks known security considerations, potential vulnerabilities, and mitigations for the FinOps Website.

## Authentication & Authorization

| Risk | Severity | Status | Notes |
|---|---|---|---|
| No authentication implemented yet | High | Planned | MSAL/Entra ID auth is on the roadmap. Until implemented, the site should only be run locally or behind a network-level access control (VPN, private network). |
| No role-based access control (RBAC) | Medium | Planned | All authenticated users see all data. Future: map Entra ID roles/groups to report visibility. |

## Data Handling

| Risk | Severity | Status | Notes |
|---|---|---|---|
| Cost data may contain sensitive financial information | High | Mitigated (Phase 1) | Phase 1 uses only dummy data. When real data is introduced, ensure data is not cached in browser storage or exposed in client-side bundles unnecessarily. |
| CSV/JSON parsing of untrusted exports | Medium | Monitor | When ingesting Azure exports (Phase 2), validate and sanitize all fields. CSV injection is possible if data is re-exported. Use a well-maintained parser library. |
| Tags field may contain arbitrary user content | Medium | Monitor | The FOCUS `Tags` column is a JSON string with user-defined keys/values. Always sanitize before rendering to prevent XSS. |
| API tokens / credentials in client bundle | High | Preventable | Never embed API keys, client secrets, or tenant-specific secrets in client-side code. Use server-side API routes (Next.js Route Handlers) for authenticated API calls. |

## Client-Side Security

| Risk | Severity | Status | Notes |
|---|---|---|---|
| XSS via rendered data values | Medium | Monitor | Resource names, tag values, and other user-generated strings must be escaped before rendering. React's JSX auto-escapes by default, but `dangerouslySetInnerHTML` must never be used with cost data. |
| Dependency vulnerabilities | Medium | Ongoing | Run `npm audit` regularly. Keep dependencies up to date. Pin major versions in package.json. |
| Source maps in production | Low | Preventable | Disable source maps in production builds to avoid exposing application logic. |

## Infrastructure (Future)

| Risk | Severity | Status | Notes |
|---|---|---|---|
| CORS misconfiguration | Medium | Future | When API routes call Azure APIs, ensure CORS is properly restricted to the application's origin. |
| MSAL token storage | Medium | Future | Use `sessionStorage` (not `localStorage`) for token cache to limit exposure window. Configure appropriate token lifetimes. |
| Azure Cost Management API rate limits | Low | Future | Implement retry logic with exponential backoff. Do not expose raw API errors to clients. |
| Deployment without HTTPS | High | Future | Always deploy behind HTTPS. MSAL requires HTTPS in production. Local dev on http://localhost is acceptable. |

## Open Data Files

| Risk | Severity | Status | Notes |
|---|---|---|---|
| Integrity of downloaded open data | Low | Acceptable | Open data CSVs (Regions, Services, etc.) are sourced from Microsoft's GitHub releases. Verify checksums if automating downloads. |

---

## Reporting a Vulnerability

If you discover a security issue, please open an issue in the repository or contact the maintainers directly. Do not post sensitive vulnerability details in public issues.
