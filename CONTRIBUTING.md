# Contributing to QNU — University Resource Planner

Thank you for considering contributing to QNU! Your help is greatly appreciated.

## How to Contribute

### 1. Fork & Clone
```bash
git clone https://github.com/<your-username>/university-resource-planner.git
cd university-resource-planner
```

### 2. Install Dependencies
```bash
# From the root — uses npm workspaces to install both server & client
npm install
```

### 3. Create a Branch
- **Features:** `feature/your-feature-name`
- **Bug fixes:** `bugfix/your-bug-description`
- **Docs:** `docs/what-you-changed`

```bash
git checkout -b feature/my-new-feature
```

### 4. Make Your Changes
- Follow the existing code style (Clean Architecture on the server, component-based on the client).
- Server code lives in `server/` and follows domain → application → infrastructure → interfaces layering.
- Client code lives in `client/src/ui/`.

### 5. Run Tests
```bash
# Server tests
npm test

# Client tests (when available)
npm run test -w client

# Lint
npm run lint
```

### 6. Commit Your Changes
We follow the [Conventional Commits](https://www.conventionalcommits.org/) style:

```
feat: add QR code expiry notifications
fix: resolve CORS error in production Docker build
docs: update README with Docker instructions
refactor: extract schedule validation into use case
test: add smoke test for /api/health endpoint
```

### 7. Push & Open a Pull Request
```bash
git push origin feature/my-new-feature
```
Then open a Pull Request against the `main` branch on GitHub.

## Development Setup

See `README.md` for full setup instructions. Key commands:

| Command | Description |
|---|---|
| `npm run dev` | Start both server & client in development mode |
| `npm test` | Run server tests |
| `npm run seed -w server` | Seed the database (development only) |
| `npm run build` | Build client for production |

## Code Style Guidelines

- **Server:** CommonJS modules, Clean Architecture, Zod for validation.
- **Client:** ES modules, React 19, Zustand for state, i18next for i18n.
- **CSS:** Vanilla CSS with custom properties — no inline styles.
- **No `console.log`** in production paths — use conditional `NODE_ENV` checks.

## Questions?

Open a [GitHub Discussion](https://github.com/omarmohamed-909/university-resource-planner/discussions) or create an issue.
