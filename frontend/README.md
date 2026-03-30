# RepoSense AI — Frontend

React + Vite frontend for the RepoSense AI application.

## Stack

- **React 18** with hooks
- **Vite 8** for dev server and bundling
- **Framer Motion** for animations
- **Lucide React** for icons
- **ReactMarkdown** for rendering AI responses
- **Tailwind CSS** for utility styling

## Development

```bash
npm install
npm run dev
```

Runs at `http://localhost:5173`. Requires the backend to be running at `http://localhost:8000`.

## Build

```bash
npm run build
```

Output will be in the `dist/` directory.

## Environment

The frontend communicates with the backend via `http://localhost:8000`.
To change the backend URL, update `src/services/api.js`.
