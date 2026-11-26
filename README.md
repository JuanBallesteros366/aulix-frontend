# Aulix — Frontend

Interfaz web de **Aulix, Salón de Estudio Colaborativo en Tiempo Real**, hecha con React, TypeScript, Vite y Tailwind CSS. El servidor está en otro repositorio: [aulix-backend](https://github.com/JuanBallesteros366/aulix-backend).

**En producción:** https://aulix-frontend.vercel.app

El frontend no consulta Firestore directamente. Todos los datos llegan por la API.

## Pantallas

Inicio de sesión, registro, elegir nombre de usuario (ingreso con Google), panel, perfil con avatar, ayuda, estado técnico (`/firestore`), sala (en construcción) y página 404.

## Cómo ejecutarlo

Necesitas Node.js 20 o superior.

```bash
cp .env.example .env     # completa los valores
npm install
npm run dev              # http://localhost:5173
```

Para que funcione el registro y el inicio de sesión, el backend debe estar corriendo (en local en el puerto 4000) o apuntar a la API de Render.

## Variables de entorno

| Variable | Valor |
|---|---|
| `VITE_API_URL` | URL de la API, sin barra final |
| `VITE_FIREBASE_API_KEY` | Configuración web de Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | Configuración web de Firebase |
| `VITE_FIREBASE_PROJECT_ID` | Configuración web de Firebase |
| `VITE_FIREBASE_APP_ID` | Configuración web de Firebase |

Estos valores salen de Firebase: Configuración del proyecto, Tus apps, app web.

## Docker

```bash
docker compose up --build   # http://localhost:5173
```

Usa el mismo `.env` de arriba: Docker Compose lo lee solo. Para levantar todo el sistema en local, primero arranca el backend con su `docker-compose.yml` (puerto 4000) y después este.

## Despliegue en Vercel

1. Importar el repositorio. Root Directory: `./`. Preset: Vite.
2. Agregar las variables de entorno de la tabla.
3. Agregar el dominio de Vercel en Firebase, Authentication, Settings, Dominios autorizados.

## Accesibilidad

Idioma `es` declarado, enlace para saltar al contenido, regiones semánticas, foco visible y mensajes de error y éxito anunciados a lectores de pantalla.
