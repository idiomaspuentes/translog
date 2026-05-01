# Rutas de la app (TanStack Start)

Esta guía documenta las rutas que el equipo debe crear en `src/routes/` para
montar el flujo completo descrito en [`screens-state-integration.md`](./screens-state-integration.md).

Hoy el proyecto tiene **una sola ruta** (`src/routes/index.tsx`) que sirve
como showcase de las pantallas en `PhoneFrame`. Para la app real hay que
sustituirla por un árbol de rutas con file-based routing.

> **Convenciones de TanStack Start usadas aquí**
> - Archivos planos con puntos para anidar: `books.$bookId.sessions.tsx` →
>   `/books/:bookId/sessions`. **No** crear carpetas anidadas estilo Next.
> - El layout raíz es **siempre** `src/routes/__root.tsx`.
> - Parámetros dinámicos con `$`: `$bookId`, `$sessionId`, `$verseId`.
> - Nunca editar `src/routeTree.gen.ts` (lo regenera el plugin de Vite).
> - Para navegar: `<Link to="/books/$bookId" params={{ bookId }} />`.
>   Nunca interpolar params dentro del string `to`.

---

## Mapa de rutas

| Ruta | Archivo | Pantalla que monta | Acceso |
|---|---|---|---|
| `/` | `routes/index.tsx` | Landing / redirección a `/books` si hay sesión | Pública |
| `/onboarding/language` | `routes/onboarding.language.tsx` | `LanguageScreen` | Auth, sin idioma elegido |
| `/books` | `routes/books.index.tsx` | `BookListScreen` | Auth |
| `/books/$bookId` | `routes/books.$bookId.index.tsx` | `BookSessionsScreen` | Auth |
| `/books/$bookId/read` | `routes/books.$bookId.read.tsx` | `ChapterReadScreen` | Auth |
| `/books/$bookId/sessions/$sessionId` | `routes/books.$bookId.sessions.$sessionId.tsx` | `ChapterReviewScreen` | Auth + sesión abierta |
| `/sessions/$sessionId/threads/$threadId` | `routes/sessions.$sessionId.threads.$threadId.tsx` | `ThreadScreen` o `ReadOnlyThreadScreen` (según estado) | Auth |
| `/sessions/$sessionId/threads/$threadId/new` | `routes/sessions.$sessionId.threads.$threadId.new.tsx` | `NewCommentScreen` | Auth + sesión abierta |
| `/settings` | `routes/settings.tsx` | `SettingsScreen` | Auth |
| `/api/public/*` | `routes/api/public/*.ts` | Webhooks / endpoints públicos | Pública |

---

## Layout raíz (`__root.tsx`)

Responsabilidades:
- Provider de auth, react-query, theme, toaster.
- `<Outlet />` para los hijos.
- `notFoundComponent` global (404).
- Cargar las preferencias del usuario una sola vez (idioma, fontSize) y
  exponerlas por contexto a `SettingsScreen` y al lector.

```tsx
// src/routes/__root.tsx
import { createRootRoute, Outlet, Link } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: () => (
    <div>
      <h1>404</h1>
      <Link to="/">Inicio</Link>
    </div>
  ),
});
```

---

## Detalle ruta por ruta

### `/` — landing

- Si el usuario está autenticado y tiene idioma → `<Navigate to="/books" />`.
- Si no tiene idioma → `<Navigate to="/onboarding/language" />`.
- Si no hay sesión → marketing/login.

### `/onboarding/language` — `LanguageScreen`

- `loader`: lista de idiomas soportados.
- `onContinue` persiste el idioma y navega a `/books`.

### `/books` — `BookListScreen`

- `loader`: `listBooks()`.
- Click en libro → `/books/$bookId`.
- Botón **Añadir libro** → mutación + invalidar el loader.
- Icono ⚙ → `/settings`.

### `/books/$bookId` — `BookSessionsScreen`

- `loader`: `getBook(bookId)` + `listSessions(bookId)`.
- Click en sesión:
  - `status === "abierta"` → `/books/$bookId/sessions/$sessionId`
  - `status === "cerrada"` → buscar el último thread relevante o un índice
    de hilos cerrados (definir con producto).
- Click en **Leer libro** → `/books/$bookId/read`.

### `/books/$bookId/read` — `ChapterReadScreen`

- `search` params: `?chapter=3`. Usar `validateSearch` con Zod.
- `loader`: capítulos del libro (paginar si pesa).
- FAB **Iniciar revisión** → crea sesión y navega a
  `/books/$bookId/sessions/$sessionId`.

### `/books/$bookId/sessions/$sessionId` — `ChapterReviewScreen`

- `loader`: capítulos + revisiones de la sesión activa.
- `search`: `?chapter=N`.
- Al comentar un fragmento → `/sessions/$sessionId/threads/$threadId/new`
  (creando primero el thread del fragmento si no existe).
- Sidebar de revisiones → click navega al `ThreadScreen` correspondiente.

### `/sessions/$sessionId/threads/$threadId` — Thread

- `loader`: `getSession(sessionId)` + `getThread(threadId)` + `listComments(threadId)`.
- En el `component`, ramificar:
  ```tsx
  return session.status === "abierta"
    ? <ThreadScreen ... />
    : <ReadOnlyThreadScreen ... />;
  ```
- Suscripción realtime para nuevos comentarios.

### `/sessions/$sessionId/threads/$threadId/new` — `NewCommentScreen`

- Solo accesible si la sesión está abierta. Si no, redirigir al thread RO.
- `onSubmit` ejecuta la mutación; el `state` controlado pasa de
  `idle → submitting → success` y al terminar navega de vuelta al thread
  invalidando el loader.

### `/settings` — `SettingsScreen`

- `loader`: preferencias del usuario.
- `onSave` → mutación + toast + `router.invalidate()` para refrescar el
  contexto raíz que aplica `fontSize`.

---

## Patrones obligatorios

### Type-safe links

```tsx
// ✅
<Link to="/books/$bookId" params={{ bookId: b.id }}>{b.title}</Link>

// ❌ rompe el tipado y el encoding
<Link to={`/books/${b.id}`}>{b.title}</Link>
```

### Errores y 404 por ruta

Toda ruta con `loader` debe declarar:

```tsx
export const Route = createFileRoute("/books/$bookId")({
  loader: ({ params }) => getBook(params.bookId),
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <ErrorState
        message={error.message}
        onRetry={() => { router.invalidate(); reset(); }}
      />
    );
  },
  notFoundComponent: () => <NotFoundBook />,
  component: BookSessionsRoute,
});
```

Y el router config debe tener `defaultErrorComponent`.

### Search params validados

```tsx
import { z } from "zod";

const search = z.object({ chapter: z.coerce.number().min(1).default(1) });

export const Route = createFileRoute("/books/$bookId/read")({
  validateSearch: search.parse,
  loaderDeps: ({ search }) => ({ chapter: search.chapter }),
  loader: ({ params, deps }) => getChapter(params.bookId, deps.chapter),
});
```

### Preload `intent`

Configurar en `src/router.tsx`:

```tsx
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0, // dejar que react-query gobierne la frescura
  scrollRestoration: true,
});
```

### Endpoints públicos

Webhooks o cron viven en `src/routes/api/public/*.ts` (sin auth). Cualquier
endpoint autenticado va en `src/routes/api/*.ts` con middleware de auth.
**No** inventar archivos `_redirects`, `vercel.json` ni `BrowserRouter`:
TanStack Start sobre Lovable resuelve deep links solo.

---

## Checklist al crear una ruta nueva

- [ ] Archivo creado bajo `src/routes/` con nombre plano y puntos.
- [ ] `createFileRoute("/...")` con el path exacto que declara el archivo.
- [ ] `head()` con `title` + `description` propios (SEO).
- [ ] `loader` + `errorComponent` + `notFoundComponent` si trae datos.
- [ ] `validateSearch` (Zod) si usa query params.
- [ ] Navegación con `<Link to params>` tipado, nunca con template strings.
- [ ] La pantalla (`*Screen`) recibe datos por props, no fetchea por su cuenta.
