import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.erick.fiin',
  appName: 'Fiin',
  webDir: 'dist',
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com'],
    },
    AppShortcuts: {
      shortcuts: [
        { id: 'add-expense', title: 'Nuevo Gasto', description: 'Registrar un egreso rápido' },
        { id: 'add-income', title: 'Nuevo Ingreso', description: 'Registrar un ingreso rápido' },
      ],
    },
  },
};

export default config;
