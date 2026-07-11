# Authentication

> **Branch:** this documentation applies only to the `auth` branch.

&nbsp;

## Choosing the approach

### Why JWT access + refresh in HttpOnly cookies

There are various architectural approaches to authentication. We chose **a JWT access token (15 min) + a refresh token with rotation in PostgreSQL**.

| Approach                                            | When it fits                                                     | Why we didn't choose it                                                       |
| --------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Session cookie** (nuxt-auth-utils, iron-session)  | Monolith, simple app, no need for logout across all devices      | Can't revoke a session instantly, no device history, no reuse detection      |
| **Pure stateless JWT**                              | Microservices, service-to-service, very short TTL                | A JWT can't be invalidated — a stolen token is valid until it expires        |
| **Managed auth** (Clerk, Auth0)                     | Startup, no data-storage requirements                            | External dependency, data goes to a third party, cost at scale               |
| **OAuth / OIDC** (Keycloak, Google)                 | B2B SaaS, corporate SSO                                          | Overkill for a template; can be added on top of the current solution         |
| **JWT access + refresh in DB** ← our choice         | Nuxt/Next + a separate API, full security needed                 | —                                                                            |

### Why not stateless JWT

A stateless JWT doesn't require a DB lookup on every request — the token is self-contained. But it has a fundamental limitation: **the token can't be invalidated early**. If the token is stolen or the user changed their password — the token stays valid until its TTL expires.

The only workaround is a blacklist in Redis, which effectively makes the JWT stateful, only more complex.

### Why not a session cookie

A session cookie (the whole session encrypted in the cookie, no DB) is a simple solution, but it doesn't provide:

- Forced logout: you can't "revoke" a cookie already held by the client
- Device history: there's no sessions table — nothing to show
- Reuse detection: without a DB record it's impossible to detect token reuse

### Our choice: a hybrid

```
access_token  (JWT, 15 min)  — verified without the DB on every request
refresh_token (in DB, 7 days) — refreshes the access_token, full control over the session
```

This is the **de facto standard** for web apps with a separate backend: a balance between performance (a DB lookup only once every 15 minutes) and security (a refresh can be revoked instantly, reuse detection, session history).

### Difference from the microservices approach

In a microservices architecture JWT is used differently:

```
Browser → API Gateway → Service A (orders)
                      → Service B (payments)
                      → Service C (notifications)
```

The gateway verifies the JWT once at the entry point, and each service receives an already-verified request. The refresh token lives in a centralized Auth Service. The services don't touch sessions at all — it's not their responsibility.

We have a single backend that manages both access and refresh tokens itself. That's the right fit for a monolith — porting the microservices pattern here would be overkill.
