# Vue 3 + TypeScript + Vite

## Telemedicine mock data

The telemedicine module now persists demo data in `localStorage` under the key `telemedicine.apps.v1`. All CRUD operations flow through `src/api/mock/telemedicine.repository.ts`, which keeps the in-browser data store in sync and broadcasts changes across tabs via `BroadcastChannel` and `storage` events.

- To reset the mock dataset, run in the browser console:

	```js
	localStorage.removeItem('telemedicine.apps.v1');
	```

- Any open telemedicine list or detail view auto-refreshes when another tab changes the data.

The rest of the project continues to follow the standard Vue 3 + Vite setup. For IDE tips and TypeScript tooling guidance see the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

