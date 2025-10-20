# Tabla de componentes

| Componente actual        | Acción     | Nuevo/Ubicación                                  |
|--------------------------|------------|--------------------------------------------------|
| BalanceWidget.tsx        | Mantener   | components/wallet/BalanceCard.tsx                |
| BurnFeesWidget.tsx       | Fusionar   | components/tokenomics/BurnWidget.tsx             |
| BurnRateIndicator.tsx    | Fusionar   | components/tokenomics/BurnWidget.tsx             |
| BuyWFANSButton.tsx       | Mantener   | components/wallet/BuyWFANSButton.tsx             |
| Button.tsx               | Sustituir  | components/common/Button.tsx                     |
| ClaimCard.tsx            | Mantener   | components/home/ClaimCard.tsx                    |
| ContractLinks.tsx        | Mover      | components/common/ExternalLinks.tsx              |
| EpochProgress.tsx        | Fusionar   | components/tokenomics/EpochWidget.tsx            |
| EpochProgressWidget.tsx  | Fusionar   | components/tokenomics/EpochWidget.tsx            |
| Navigation.tsx           | Mantener   | (protected)/layout.tsx                           |
| PayDialog.tsx            | Absorber   | SubscribeButton/TipButton/UnlockButton           |
| ProtectedRoute.tsx       | Eliminar   | reemplazado por App Router layout guard          |
| VerifyBadge.tsx          | Mantener   | components/verify/VerifyGate.tsx (mostrar badge) |
| VerifyWithWorldId.tsx    | Renombrar  | components/verify/VerifyGate.tsx                 |
