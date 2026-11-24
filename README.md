# kanto62 frontend

This Next.js app connects to the existing kanto62 Django API. It has its own dependencies and development server.

From this folder, run `npm ci` and `npm run dev`, then open [localhost:3063](http://localhost:3063). The API defaults to `http://127.0.0.1:8000/api/v1`. Set `KANTO62_API_URL` to use another API and see the [pilot setup](../README.md) for fixture accounts and API configuration.

The [studio sign-in guide](../sso/README.md) explains the optional broker and product integrations. When configuring the replacement for SSO, register its own callback origin and use its matching `KANTO62_WEB_ORIGIN`.

Run `npm run build` and `npm run test:e2e` to verify the app. Browser tests use a disposable API database.

The UI uses [shadcn/ui’s Radix registry](https://ui.shadcn.com/docs/cli) and Tailwind v4. Theme roles live in `app/style.css`. Feature layout, appearance, and state styles live in Tailwind classes alongside the markup.
