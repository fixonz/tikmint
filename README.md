# TikMint Frontend

This is the frontend for TikMint, allowing users to launch pump.fun tokens directly from TikTok.

## Development

```bash
npm install
npm run dev
```

## Deployment

This application is deployed to Vercel. The backend API is implemented using Vercel Serverless Functions located in the `api` directory.

### API Endpoints

- `/api/launches` - Get all launches
- `/api/wallet/:address/launches` - Get launches for a specific wallet

## Tracking Wallet

The application tracks token launches from the following wallet:
```
MiNT5ERW9ResSsKRmeg4b29XPj5LDvW7MoBCrNmdiPL
```

## API Implementation Notes

- In production, the API uses static data for demonstration
- To implement actual blockchain connectivity, extend the serverless functions in the `/api` directory
- The original backend code is kept in the `/backend` directory for reference

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
