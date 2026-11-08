# Pendientes — tareas compartidas entre socios

React + Vite + Tailwind + Firebase (Auth + Firestore) + PWA.
Tiempo real y modo offline vienen de Firestore (cola local en IndexedDB que se sincroniza sola).

## 1. Firebase (10 min, plan gratuito Spark)
1. https://console.firebase.google.com → **Crear proyecto**.
2. **Authentication → Método de acceso → Correo/contraseña** → activar. En **Usuarios**, crea las 2 cuentas de los socios.
3. **Firestore Database → Crear base de datos** (modo producción). En **Reglas**, pega `firestore.rules` (con vuestros 2 correos) y publica.
4. **Configuración del proyecto → Tus apps → Web (</>)**: registra la app y copia la configuración.

## 2. Local
```bash
cp .env.example .env     # rellena con los datos de Firebase y los 2 correos/nombres
npm install
npm run dev
```

## 3. Despliegue (Vercel)
1. Sube la carpeta a un repositorio de GitHub (el `.env` NO se sube).
2. https://vercel.com → **Add New Project** → importa el repo (detecta Vite solo).
3. En **Environment Variables** añade todas las variables del `.env.example`. **Deploy**.
4. En Firebase → Authentication → Configuración → **Dominios autorizados**, añade `tu-app.vercel.app`.

Netlify: mismo proceso (Build `npm run build`, Publish `dist`) y añade un archivo `public/_redirects` con `/* /index.html 200`.

## 4. Instalar en el móvil
- Android (Chrome): menú ⋮ → **Instalar aplicación**.
- iPhone (Safari): Compartir → **Añadir a pantalla de inicio**.
