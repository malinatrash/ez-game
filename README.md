# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

## Docker deployment

Build and run the container on the server:

```bash
npm run docker:build
npm run docker:run
```

Or rebuild and restart in one step:

```bash
npm run docker:rebuild
```

Then open the app at `https://<server-ip>/`.
