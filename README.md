# Picadito — Histórico de partidos

App para cargar jugadores, registrar partidos (resultado por equipo) y ver
el histórico. Pensada para que cualquiera del grupo pueda cargar datos desde
un link compartido, sin login.

**Stack:** React + Vite (frontend) · Vercel Serverless Functions (backend) ·
Prisma + PostgreSQL en Supabase (base de datos). Todo se deploya junto en
Vercel.

## 1. Crear la base de datos en Supabase

1. Andá a [supabase.com](https://supabase.com) y creá un proyecto nuevo (o
   usá uno que ya tengas, igual que en NaturaSur).
2. En **Project Settings → Database → Connection string**, elegí la pestaña
   **URI** y usá el **Session pooler** (puerto **5432**), no el directo.
3. Copiá esa URL, vas a necesitarla en el paso 3.

## 2. Instalar y probar en local

```powershell
npm install
```

Creá un archivo `.env` en la raíz (copiando `.env.example`) con tu
`DATABASE_URL` real de Supabase.

Aplicá el esquema a la base:

```powershell
npx prisma db push
```

Para probar todo junto en local (frontend + funciones serverless), lo más
simple es usar el CLI de Vercel:

```powershell
npm install -g vercel
vercel dev
```

Esto levanta todo en `http://localhost:3000` (frontend + `/api`), tal cual
va a funcionar en producción.

## 3. Deploy en Vercel

1. Subí este proyecto a un repo de GitHub (nuevo repo, por ejemplo
   `picadito`).
2. En [vercel.com](https://vercel.com), **Add New → Project** e importá el
   repo. Vercel detecta Vite automáticamente.
3. Antes de deployar, agregá la variable de entorno:
   - `DATABASE_URL` → la misma connection string de Supabase (Session
     pooler, puerto 5432).
4. Deploy. Vercel va a correr `npm install` (que dispara `prisma generate`
   automáticamente por el script `postinstall`) y `npm run build`.
5. Cuando termine, te da una URL pública (`https://picadito-xxxx.vercel.app`).
   Ese es el link que compartís con el grupo — cualquiera que entre puede
   cargar jugadores y partidos.

## Notas

- No hay login: quien tenga el link puede cargar y ver todo. Si más
  adelante querés restringir quién edita, se puede agregar un login simple
  después sin romper lo que ya está.
- "Desactivar" un jugador no lo borra (para no perder el histórico de
  partidos ya jugados), solo lo saca de la lista para partidos nuevos.
- Si en algún momento agregás muchísimos partidos y la home tarda, se puede
  paginar el histórico — por ahora trae todo de una.
