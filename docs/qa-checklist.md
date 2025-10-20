# QA Checklist Mainnet

## Verify Gate
- [ ] Incognito action configurada en Dev Portal.
- [ ] `nullifierHash` persistido en base de datos después de la verificación.

## Claim
- [ ] Claim inhabilitado si el usuario no está verificado.
- [ ] Límite de una reclamación cada 24 horas aplicado y registrado.

## Pagos
- [ ] Tip/Subscribe/Unlock actualizan el feed de actividad en tiempo real.
- [ ] Errores de `pay` gestionados con mensajes de usuario y logs.

## Wallet
- [ ] Balance on-chain y conversión ≈USD visibles.
- [ ] "Buy WFANS" abre el flujo de pago correcto.

## Tokenomics
- [ ] Widgets (Supply, Epoch, Burn) cargan sin errores en testnet.

## Rendimiento
- [ ] Sin `hydration mismatch` en consola durante renderizado.

## Seguridad
- [ ] CSP básica configurada.
- [ ] No exponer claves o secretos en cliente/logs.
