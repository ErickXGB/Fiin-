# AGENTS.md - App de Finanzas Personales (Web + Android)

## Stack Técnico
- **Frontend:** React + TypeScript + Vite + Tailwind CSS (Mobile-First)
- **Empaquetado Móvil:** Capacitor (Android) / PWA
- **Backend / BD:** Firebase Auth + Cloud Firestore (SDK Modular v9+/v13)
- **Offline:** Caché persistente local vía `initializeFirestore` + `persistentLocalCache`

## Objetivo
Registro rápido de gastos e ingresos y control de presupuestos semanales (lunes a domingo) y mensuales en USD.

## Reglas de Ahorro de Tokens (ESTRICTAS)
1. **Aislamiento total de Firebase:** Ningún componente `.tsx` puede importar funciones de `firebase/firestore` ni `firebase/auth`. Toda lectura/escritura pasa exclusivamente por `src/services/`.
2. **Archivos cortos (<150 líneas):** Divide utilidades de fechas/cálculos en `src/utils/` y hooks de estado en `src/hooks/`.
3. **Ediciones quirúrgicas:** Al modificar archivos existentes, entrega únicamente el fragmento alterado o instrucciones exactas de reemplazo; no imprimas archivos completos salvo al crearlos.
4. **Cero librerías extra para fechas/moneda:** Usa `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })` y objetos `Date` nativos (lunes a domingo para ciclos semanales).
5. **Respuestas directas:** Entrega código y comandos sin explicaciones introductorias ni resúmenes largos.

## Flujo de Trabajo por Fases
1. Solo se implementa la fase solicitada. Prohibido adelantar código de fases futuras.
2. Sin refactors ni mejoras fuera del alcance de la fase actual.
3. Al finalizar una fase, detenerse y esperar confirmación explícita.

## Estructura de Carpetas
```
src/
  types/      # Interfaces y tipos de dominio (sin imports de Firebase)
  services/   # Única capa con acceso a Firebase (auth, firestore)
  utils/      # Fechas, cálculos, formato de moneda (funciones puras)
  hooks/      # Estado React y suscripciones a services
  components/ # UI reutilizable (sin Firebase)
  pages/      # Pantallas / rutas
```

## Reglas de Código
- Componentes de UI: funciones con nombre, props tipadas, sin lógica de negocio.
- Servicios: funciones `async` que devuelven `Promise` y listeners que devuelven `Unsubscribe`.
- Importar Firebase solo desde `src/services/firebase.ts`.
- Fechas almacenadas como string ISO (`YYYY-MM-DD`); montos como `number` en USD.
- IDs de documento gestionados por Firestore (`id` se añade al leer).

## Modelo de Datos en Firestore
- `users/{userId}/budgets/{budgetId}` -> `{ period: 'weekly' | 'monthly', limitAmount: number, startDate: string, categoryLimits?: Record<string, number>, createdAt?: number }`
- `users/{userId}/transactions/{txId}` -> `{ type: 'expense' | 'income', amount: number, category: string, date: string, note: string, createdAt?: number }`

## Fases del Proyecto
- **Fase 1:** AGENTS.md, tipos, inicialización Firebase y CRUD/listeners de finanzas. (actual)
- **Fase 2+:** Pendiente de definición por el usuario.
