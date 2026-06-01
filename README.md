# Competitive Programming Analytics & Recommendation Platform

Production-grade analytics and recommendation platform for competitive
programming coaching. The first implementation slice imports a Codeforces
profile and opens a profile dashboard.

Current version: `v0.1.0`.

The v0.1.0 implementation uses:

- Express.js, TypeScript, MongoDB, and Mongoose for the backend.
- React, Vite, TypeScript, TailwindCSS, React Router, and Axios for the frontend.
- Codeforces `user.info` integration through `POST /api/users/import`.

See [docs/architecture.md](docs/architecture.md) for the generated production
architecture, database schema, API surface, service design, ML plan, and initial
development roadmap. See [docs/progress.md](docs/progress.md) for the current
v0.1.0 status, commands, environment variables, and verification notes.
