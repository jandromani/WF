# Switch de World Chain Sepolia a Mainnet

Checklist paso a paso para migrar la dApp desde la testnet de World Chain hacia mainnet.

## 1. Inventario de despliegues
- [ ] Confirmar direcciones mainnet de **token**, **pay** y **treasury** en el repositorio de despliegues.
- [ ] Subir los **ABIs mainnet** actualizados a `src/abi/` y publicar en el repositorio de artefactos compartido.
- [ ] Registrar en Notion/Runbook la fecha del último despliegue y el commit utilizado.

## 2. Configuración de variables
- [ ] Actualizar `.env.production` con las direcciones mainnet (`NEXT_PUBLIC_TOKEN_ADDRESS`, `NEXT_PUBLIC_PAY_ADDRESS`, `NEXT_PUBLIC_TREASURY_ADDRESS`).
- [ ] Verificar que `.env.development` y `.env.build` siguen apuntando a Sepolia para evitar fugas.
- [ ] Documentar en README las tres variantes de entorno (build/dev/prod) y su propósito.

## 3. Smoke test en mainnet
- [ ] Ejecutar `pnpm ts-node scripts/read-contract.ts --network mainnet` para probar `readContract` sin enviar transacciones.
- [ ] Validar que el endpoint RPC principal y el fallback responden en < 500 ms.
- [ ] Verificar que la respuesta coincide con el estado esperado (saldo del treasury, supply total, etc.).

## 4. Dev Portal
- [ ] Iniciar sesión en el Worldcoin Dev Portal.
- [ ] Habilitar **Incognito Actions** para el proyecto de producción.
- [ ] Registrar evidencia (captura o enlace) de la configuración.

## 5. Flujo end-to-end (producción)
- [ ] Ejecutar una corrida rápida: **verify → claim → tip → subscribe → unlock** en el entorno mainnet.
- [ ] Confirmar que cada paso actualiza los logs de actividad y que no hay errores en consola.
- [ ] Levantar incidencias inmediatamente si alguna acción falla.

## 6. Checklist final
- [ ] Confirmar que todos los contratos tienen monitorización en mainnet.
- [ ] Validar que las alertas y dashboards de observabilidad fueron actualizados a los nuevos contratos.
- [ ] Comunicar al equipo (canal #launch) que el switch a mainnet está listo.

> Resultado esperado: el equipo puede conmutar a mainnet siguiendo este documento sin pasos implícitos.
