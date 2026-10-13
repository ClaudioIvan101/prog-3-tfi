# Security implementation checklist

**Status: planned, not implemented or audited by this scaffold.** This is a
starting checklist, not proof of compliance. Select controls for the API's data,
clients and deployment, implement them, and verify them before production.

## Request boundary

- [ ] Validate allowed fields, types, ranges and formats in `src/validators`;
  reject unexpected input instead of passing request objects into persistence.
- [ ] Set explicit body-size limits, accepted content types, timeouts and
  rate limits suited to each endpoint. Exercise oversized and abusive requests.
- [ ] Log operational/security events without credentials, tokens or unnecessary
  personal data; return only the response fields the contract permits.

These checks draw on [OWASP Node.js security guidance](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html).

## Identity and data

- [ ] Choose authentication only when its requirements are known. Deny protected
  access by default; check resource/ownership permissions on every operation.
  Keep resource authorization in services and scope repository queries, not only
  route middleware. Test access to another user's resources.
  [OWASP authorization guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).
- [ ] If SQL persistence is introduced, bind values through parameterized queries;
  input validation is not a substitute. Grant the database account only required
  privileges. [OWASP SQL injection guidance](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html).
- [ ] If browser cookies carry credentials, use appropriate `Secure`, `HttpOnly`
  and `SameSite` settings and implement CSRF defenses for state changes.
  [Express security guidance](https://expressjs.com/en/advanced/best-practice-security/)
  and [OWASP CSRF guidance](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html#use-anti-csrf-tokens).
- [ ] Configure CORS only for required browser origins. CORS controls browser
  response access, **not authentication or authorization**; non-browser clients
  are not restricted by it. [Express CORS guidance](https://expressjs.com/en/resources/middleware/cors/).

## Deployment and failures

- [ ] Serve production traffic over TLS; configure security response headers
  appropriate to the API, using maintained middleware such as Helmet if needed.
- [ ] Keep supported Node.js/Express versions and reviewed dependencies; check
  dependency advisories and apply relevant updates.
- [ ] Keep secrets outside Git and validate required configuration at startup.
  Run the process with least privilege.
- [ ] Return client-safe errors without stack traces or internal details. Place
  the four-argument error handler after routes and the not-found handler.

See [Express production security](https://expressjs.com/en/advanced/best-practice-security/),
[Express error-handler conventions](https://expressjs.com/en/guide/using-middleware/#error-handling-middleware)
and [OWASP Node.js security](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html).

- [ ] Configure `trust proxy` only to match the actual trusted proxy topology;
  verify forwarded headers cannot be spoofed before relying on client IPs or
  protocol for rate limiting and secure cookies.
  [Express proxy guidance](https://expressjs.com/en/guide/behind-proxies/).

Before marking a check complete, retain evidence from tests or deployment
configuration. Unit tests should cover validation and authorization decisions;
integration tests should cover rejected requests, error responses and scoped
data access. No test runner or security middleware was added by this scaffold.
