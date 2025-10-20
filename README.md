## Create a Mini App

[Mini apps](https://docs.worldcoin.org/mini-apps) enable third-party developers to create native-like applications within World App.

This template is a way for you to quickly get started with authentication and examples of some of the trickier commands.

## Getting Started

1. `cp .env.example .env.local`
2. Rellena las variables siguiendo los comentarios del archivo:
   - `NEXT_PUBLIC_APP_ID`, `WLD_CLIENT_ID` y credenciales de World App.
   - Ajusta `NEXTAUTH_SECRET` con `npx auth secret`.
   - Configura `NEXTAUTH_URL`/`AUTH_URL` cuando uses un túnel como ngrok.
3. Ejecuta `yarn dev --hostname 127.0.0.1 --port 3000` para arrancar la mini-app en local.
4. Añade tu dominio público en `next.config.ts` (`allowedDevOrigins`) cuando pruebas contra dispositivos reales.
5. Para apuntar a World Chain mainnet actualiza los endpoints de RPC, IDs de app y contratos en tus servicios/API antes de desplegar.

## Authentication

This starter kit uses [Minikit's](https://github.com/worldcoin/minikit-js) wallet auth to authenticate users, and [next-auth](https://authjs.dev/getting-started) to manage sessions.

## UI Library

This starter kit uses [Mini Apps UI Kit](https://github.com/worldcoin/mini-apps-ui-kit) to style the app. We recommend using the UI kit to make sure you are compliant with [World App's design system](https://docs.world.org/mini-apps/design/app-guidelines).

## Eruda

[Eruda](https://github.com/liriliri/eruda) is a tool that allows you to inspect the console while building as a mini app. You should disable this in production.

## Testing & Quality

- Instala los navegadores de Playwright una vez con `npx playwright install`.
- Ejecuta el smoke test suite en modo headless con `yarn test:e2e`.

Los flujos cubiertos incluyen verificación World ID, reclamaciones y pagos (tip & subscribe).

## Building for Production

- Ejecuta `yarn build` para generar el artefacto optimizado.
- Asegúrate de que `yarn lint` y `yarn test:e2e` pasen antes de desplegar.
- La configuración de CSP está definida en `next.config.ts` y puede ampliarse según tu backend.

## Contributing

This template was made with help from the amazing [supercorp-ai](https://github.com/supercorp-ai) team.
