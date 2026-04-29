# Guía de integración de estado por pantalla

Este documento describe cada pantalla de la app (`src/components/bible/*Screen.tsx`)
y los puntos donde el equipo debe **conectar la capa de estado real** (API,
store, contexto, react-query, etc.). Hoy todas las pantallas son de UI
**puramente presentacional** con datos mock locales: la idea es marcar
exactamente qué hay que reemplazar y qué eventos exponer.

> Convención general
> - Los componentes terminados en `Screen` son contenedores de pantalla.
> - Cuando un componente recibe estado desde fuera **el padre manda** (modo
>   controlado). Cuando no, la pantalla maneja un estado interno mínimo para
>   poder demostrarse en Storybook.
> - Para conectar a la app real, normalmente basta con: (1) reemplazar los
>   arrays mock por datos de tu store/API, y (2) pasar callbacks que ejecuten
>   las mutaciones correspondientes.

---

## 01 · `LanguageScreen`

**Archivo:** `src/components/bible/LanguageScreen.tsx`
**Propósito:** Selección del idioma de lectura en el onboarding.

### Props ya expuestas
| Prop | Tipo | Descripción |
|---|---|---|
| `languages` | `Language[]` | Catálogo completo a mostrar. |
| `onSearchChange` | `(q: string) => Language[] \| Promise<Language[]>` | Autocomplete remoto opcional. |

### Estado interno (a externalizar)
- `selected: string | null` → idioma elegido. Hoy arranca en `"Español"`.
- `searchOpen`, `query`, `suggestions` → UI local; puede quedarse interno.

### Qué conectar
1. Cargar `languages` desde el backend (idiomas soportados por el proyecto).
2. Subir `selected` al store global (`user.preferredLanguage`).
3. Añadir prop `onContinue?: (lang: Language) => void` en el botón
   **Continuar** y disparar la navegación / persistencia.
4. Inicializar `selected` desde el valor ya guardado del usuario.

---

## 02 · `BookListScreen`

**Archivo:** `src/components/bible/BookListScreen.tsx`
**Propósito:** Listar los libros disponibles para revisión comunitaria.

### Datos mock
- Constante `books` con `{ title, meta, description }`.

### Qué conectar
- Reemplazar `books` por datos del backend (`useBooks()` o equivalente).
- Añadir props:
  - `books: Book[]`
  - `onSelectBook(book)` → para entrar a `BookSessionsScreen`.
  - `onAddBook()` → acción del botón **Añadir libro**.
  - `onSearch()`, `onOpenSettings()` para los iconos del header.
- Manejar estados de carga / error (skeletons + retry).

---

## 03 · `BookSessionsScreen`

**Archivo:** `src/components/bible/BookSessionsScreen.tsx`
**Propósito:** Listar las **sesiones** del libro (cada una con su título
definido por el usuario) + acceso a "Leer libro". Al pulsar una sesión se
entra a `SessionRevisionsScreen`.

### Datos mock
- Constante `sessions: Session[]` con `{ id, title, range, date, status, revisions }`.
- El componente mantiene `openSession` en estado interno **solo para la demo**.
  En producción ese paso lo resuelve el router (ver más abajo).

### Props ya expuestas
| Prop | Tipo | Descripción |
|---|---|---|
| `onBack?` | `() => void` | Botón "atrás" del header. Hoy se pasa al `ScreenHeader`. |

### Qué conectar
- Reemplazar `sessions` por datos del backend.
- Props sugeridas a añadir:
  - `book: Book` (para título/subtítulo).
  - `sessions: Session[]`.
  - `onOpenSession(session)` → navega a `/books/:bookId/sessions/:sessionId`.
  - `onReadBook()` → navega a `ChapterReadScreen`.
  - `onCreateSession()` para el FAB de nueva sesión (cuando exista).
  - `onImportSessions()` / `onExportAllSessions()` → botones del header.
  - `onExportSession(session)` → botón de descarga por fila.
- Las etiquetas `abierta/cerrada` deben venir del backend.
- Eliminar el estado interno `openSession` cuando exista una ruta dedicada
  para `SessionRevisionsScreen`; dejar `onOpenSession` como única salida.

---

## 03b · `SessionRevisionsScreen`

**Archivo:** `src/components/bible/SessionRevisionsScreen.tsx`
**Propósito:** Mostrar las **revisiones** de una sesión. Cada revisión se
identifica por su fragmento (referencia + texto) al estilo de la barra
lateral de `ChapterReviewScreen`. Al pulsar una revisión se abre
`ReadOnlyThreadScreen`.

### Props ya expuestas
| Prop | Tipo | Descripción |
|---|---|---|
| `session` | `SessionLike` | Sesión activa: `title`, `range`, `status`, `revisions`. |
| `onBack?` | `() => void` | Volver a la lista de sesiones del libro. |

### Estado interno
- `openRevision` → demo de navegación. Eliminar al integrar con el router.

### Qué conectar
- Cargar `session` y `session.revisions` desde el backend.
- Añadir callbacks:
  - `onOpenRevision(revision)` → navega a
    `/books/:bookId/sessions/:sessionId/revisions/:revisionId`.
  - `onCloseSession()` / `onReopenSession()` si aplica al rol del usuario.
- Las revisiones deben llegar ya ordenadas (más reciente primero).

---

## 04 · `ChapterReadScreen`

**Archivo:** `src/components/bible/ChapterReadScreen.tsx`
**Propósito:** Lectura libre por capítulo, con navegación y `ChapterPickerModal`.

### Estado interno (a externalizar)
- `index` (capítulo actual) y `pickerOpen` (UI local, ok dejar interno).

### Qué conectar
- Reemplazar `chapters` y `TOTAL_CHAPTERS` por datos del libro activo.
- Props sugeridas:
  - `book`, `chapters`, `currentChapter`, `onChangeChapter(n)`.
  - `onStartReview()` para el `FloatingButton` "Iniciar revisión".
- Si los capítulos se cargan bajo demanda, exponer también `loading` por
  capítulo para mostrar skeletons en `VerseBlock`.

---

## 05 · `ChapterReviewScreen`

**Archivo:** `src/components/bible/ChapterReviewScreen.tsx`
**Propósito:** Lectura + selección de fragmento para comentar + sidebar con
revisiones de la sesión activa.

### Datos mock
- `chapters` (igual que la pantalla 04).
- `sessionReviews: Record<chapterN, Record<verseN, ReviewEntry[]>>`.

### Estado interno
- `index`, `pickerOpen`, `reviewsOpen` → UI local.
- `selectedText` → derivado de `window.getSelection()`. Útil mantenerlo local,
  pero se debe **emitir** cuando el usuario pulse el FAB.
- `internalSaveOpen` + `titleDraft` → controlan el modal de **Guardar sesión**
  cuando no se pasa `saveModalOpen` desde fuera. Si se pasa, el modal queda
  totalmente controlado por la capa de estado.

### Qué conectar
- Props sugeridas:
  - `chapters`, `currentChapter`, `onChangeChapter(n)`.
  - `reviews: ReviewMap` desde el backend (revisiones de la sesión activa).
  - `onCommentSelection({ verse, fragment })` → abre `NewCommentScreen`.
  - `onSave({ title })` → confirma el guardado de la sesión con el título
    introducido en el modal. La capa de estado debe ejecutar la mutación
    (crear/actualizar sesión) y, en caso de éxito, navegar a
    `BookSessionsScreen` o cerrar el modal.
  - `suggestedSessionTitle` → título prellenado en el input (p.ej.
    `"Ester 1-3"` calculado a partir del rango de capítulos revisados).
    Si se omite, el componente usa `"<bookTitle> <chapter.n>"`.
  - `saveModalOpen`, `onRequestSave()`, `onCancelSave()` → control externo
    opcional del modal (útil para abrirlo desde otra acción, mostrar estados
    de carga/error o reabrirlo tras un fallo de red).
  - `onOpenReview(verse, reviewIndex)` → navega al `ThreadScreen` del fragmento.
- El badge con `totalReviews` debe ser un contador derivado del store, no
  calculado a mano.

### Flujo de guardado
1. El usuario pulsa el FAB **Guardar** (icono `Check`).
2. El componente abre el modal y prellena el input con
   `suggestedSessionTitle` (o el fallback `<bookTitle> <chapter.n>`).
3. Al confirmar, se invoca `onSave({ title })` con el valor saneado
   (`trim()`); si está vacío el botón queda deshabilitado.
4. La capa de estado decide cuándo cerrar el modal: en modo no controlado
   se cierra automáticamente al confirmar; en modo controlado debe poner
   `saveModalOpen = false` tras la mutación exitosa.

---

## 06 · `ThreadScreen`

**Archivo:** `src/components/bible/ThreadScreen.tsx`
**Propósito:** Hilo de comentarios (texto + audio) de un fragmento en una
sesión **abierta**.

### Datos mock
- Constante `comments: (CommentCardProps & { id })[]`.

### Estado interno
- `playingId: string | null` → **único audio reproduciéndose a la vez**.
  Se externaliza al `CommentCard` vía `playing`, `onTogglePlay`, `onEnded`.

### Qué conectar
- Props sugeridas:
  - `thread: { quote, reference }` y `comments: Comment[]` desde el backend.
  - `onNewComment()` para el `FloatingButton`.
  - Suscripción en tiempo real (websocket / supabase realtime) para
    actualizar `comments` cuando otros usuarios publiquen.
- `playingId` puede subirse a un store global de audio si se quiere que solo
  un audio suene **en toda la app** (no solo dentro de la pantalla).

---

## 07 · `ReadOnlyThreadScreen`

**Archivo:** `src/components/bible/ReadOnlyThreadScreen.tsx`
**Propósito:** Igual que `ThreadScreen` pero para sesiones **cerradas** —
no hay FAB de "nuevo comentario".

### Qué conectar
- Mismas props que `ThreadScreen` salvo `onNewComment`.
- Recibir `session: { closedAt }` para mostrar el pie "Sesión cerrada · sin
  nuevos comentarios".
- **Bloquear** mutaciones desde el backend; no basta con ocultar el botón.

---

## `CommentCard` (componente, lo usan 06 y 07)

**Archivo:** `src/components/bible/CommentCard.tsx`

### API ya expuesta
| Prop | Descripción |
|---|---|
| `playing` | Estado controlado de reproducción. |
| `onTogglePlay(next)` | Llamado al pulsar play/pause. **El padre decide** si reproduce. |
| `onSeek(progress)` | Posición 0..1 cuando el usuario hace seek en la onda. |
| `onEnded()` | El audio terminó (timer interno). |

> La barra de progreso es un `setInterval` puramente visual. Cuando se
> conecte el reproductor real, sustituir el efecto interno por el `currentTime`
> del `<audio>` y eliminar el cálculo basado en `duration`.

---

## 08 · `NewCommentScreen`

**Archivo:** `src/components/bible/NewCommentScreen.tsx`
**Propósito:** Formulario de nuevo comentario (texto o audio) con flujo
`idle → submitting → success`.

### Props
| Prop | Tipo | Descripción |
|---|---|---|
| `state?` | `"idle" \| "submitting" \| "success"` | Si se omite, la pantalla maneja el flujo internamente con timers (modo demo). |

### Qué conectar
- Pasar `state` controlado desde el padre (derivado de la mutación real).
- Añadir props:
  - `quote`, `reference` del fragmento al que se comenta.
  - `onSubmit({ kind: "text" \| "audio", payload })` → dispara la mutación.
  - `onCancel()`.
- Sustituir los `setTimeout` del modo no-controlado por la promesa real de la
  mutación. Ya está preparado: si pasas `state`, el código ignora los timers.
- `CommentForm` (hijo) recibe `state` para deshabilitar inputs durante
  `submitting` y limpiarse en `success`.

---

## 09 · `SettingsScreen`

**Archivo:** `src/components/bible/SettingsScreen.tsx`
**Propósito:** Preferencias de lectura (idioma + tamaño de letra).

### Estado interno
- `language`, `fontSize`. Hoy local.

### Qué conectar
- Hidratar desde las preferencias persistidas del usuario.
- Props sugeridas:
  - `initialPreferences: { language, fontSize }`.
  - `onSave(prefs)` para el botón **Guardar cambios** (mutación + toast).
- El tamaño de letra debería aplicarse globalmente vía contexto/CSS variable,
  no solo en la vista previa.

---

## Patrón recomendado para conectar cualquier pantalla

1. **Identifica los datos mock** (constantes en mayúsculas o arrays al tope
   del archivo). Conviértelos en props.
2. **Identifica el estado interno** (`useState`). Decide:
   - UI efímera (modales, búsqueda, acordeones) → puede quedarse interno.
   - Estado de dominio (selección, formularios, reproducción) → externalízalo
     con un par `value` + `onChange`.
3. **Expón callbacks** para cada acción del usuario en lugar de hardcodear
   navegación o efectos.
4. **No** introduzcas `react-query` ni stores dentro de los componentes
   `*Screen`: hazlo en un contenedor superior (route loader, page wrapper)
   y pasa props ya resueltas. Esto mantiene los componentes testables y
   reutilizables en Storybook.
5. **Loading / error / empty states**: añádelos como props discriminadas
   (`status: "loading" | "error" | "ready"`) o componentes hermanos. Hoy
   ninguna pantalla los modela.

---

## Mapa rápido pantalla → ruta del flujo

```
01 Idioma                → onboarding inicial
02 Libros                → home tras login
03 Sesiones de libro     → detalle de un libro
03b Revisiones de sesión → detalle de una sesión
04 Lectura               → modo lectura libre
05 Selección             → modo revisión (selecciona fragmento)
06 Revisión              → hilo de un fragmento (sesión abierta)
07 Revisión RO           → hilo de un fragmento (sesión cerrada)
08 Nuevo comentario      → modal/pantalla desde 05 o 06
09 Configuración         → ajustes globales
```

---

## Contrato de navegación (importante)

> **Las funcionalidades de navegación que existen hoy en el código son solo
> ejemplos para que las pantallas se puedan demostrar en Storybook.** El
> equipo de desarrollo es responsable de conectar la UI con el sistema de
> enrutamiento real (`@tanstack/react-router`) y con el store de la app.

### Qué hay hoy
- Algunos `*Screen` mantienen `useState` interno para mostrar la pantalla
  siguiente (p. ej. `BookSessionsScreen` → `SessionRevisionsScreen` →
  `ReadOnlyThreadScreen`). Es **modo demo**.
- Todas las pantallas que pueden anidarse aceptan una prop opcional
  `onBack?: () => void` que se cablea al botón de "atrás" del `ScreenHeader`.
- Todos los handlers presentes (clicks de export/import, FABs, selección de
  capítulo, etc.) **no tienen lógica real**; son `noop` o `console.log`.

### Qué debe hacer el equipo al integrar
1. **Crear las rutas reales** según `docs/routes.md` y montar cada `*Screen`
   como componente de su ruta.
2. **Eliminar los `useState` de navegación interna** (`openSession`,
   `openRevision`, etc.) y reemplazarlos por:
   - `useNavigate()` para transiciones,
   - `useParams()` / route loaders para los datos.
3. **Conectar `onBack`** al `router.history.back()` o a un `Link`/`navigate`
   explícito a la ruta padre — nunca dejar el botón sin handler.
4. **Reemplazar los handlers de ejemplo** (export, import, guardar,
   publicar, etc.) por mutaciones reales del backend.
5. **Sustituir los datos mock** (constantes en mayúsculas o arrays al tope
   del archivo) por datos resueltos en la ruta y pasados como props.
6. Cuando una acción dependa de permisos, **el backend manda**: ocultar un
   botón en UI no es suficiente.

### Pantallas que ya exponen `onBack?`

Todas las pantallas con botón "atrás" en el header aceptan ya la prop opcional
`onBack?: () => void`. Si no se pasa, el botón aparece pero no hace nada
(modo Storybook). Pantallas afectadas:

- `BookSessionsScreen`
- `SessionRevisionsScreen`
- `ChapterReadScreen`
- `ChapterReviewScreen`
- `ThreadScreen`
- `ReadOnlyThreadScreen`
- `NewCommentScreen`
- `SettingsScreen`

`LanguageScreen` y `BookListScreen` son pantallas raíz y no muestran botón
de volver.

### Handlers de ejemplo pendientes de cablear

Estos elementos hoy son `noop` o estado interno y deben recibir callbacks
reales al integrar:

| Pantalla | Acciones a cablear |
|---|---|
| `LanguageScreen` | `onContinue(lang)`, persistencia de `selected`. |
| `BookListScreen` | `onSelectBook`, `onAddBook`, `onSearch`, `onOpenSettings`. |
| `BookSessionsScreen` | `onOpenSession`, `onReadBook`, `onCreateSession`, `onImportSessions`, `onExportAllSessions`, `onExportSession`. |
| `SessionRevisionsScreen` | `onOpenRevision`, `onCloseSession`/`onReopenSession`. |
| `ChapterReadScreen` | `onChangeChapter`, `onStartReview` (FAB). |
| `ChapterReviewScreen` | `onChangeChapter`, `onCommentSelection`, `onSave({ title })`, `suggestedSessionTitle`, `saveModalOpen`/`onRequestSave`/`onCancelSave`, `onOpenReview`. |
| `ThreadScreen` | `onNewComment` (FAB), suscripción realtime de `comments`. |
| `ReadOnlyThreadScreen` | (solo lectura, sin mutaciones). |
| `NewCommentScreen` | `onSubmit({ kind, payload })`, `onCancel`, `state` controlado. |
| `SettingsScreen` | `onSave(prefs)`, `onExportAllData`, `onImportAllData`. |

### Convención de props para navegación
| Prop | Significado |
|---|---|
| `onBack?` | Volver a la pantalla anterior en la jerarquía. |
| `onOpen<Entidad>(entity)` | Abrir el detalle de una entidad listada. |
| `onCreate<Entidad>()` | Acción del FAB / botón de creación. |
| `onSubmit(payload)` | Enviar un formulario (mutación). |
| `onCancel()` | Cerrar/descartar un formulario o modal. |
| `onSave(value)` | Persistir cambios en preferencias o estado. |

Mantener estos nombres consistentes en todas las pantallas hace que el
contenedor superior (route component) sea trivial de escribir.

---

## Componentes presentacionales reutilizables

Estos componentes ya son **puros** (sin estado de dominio). Se mencionan aquí
para que el equipo sepa que **no hace falta cablearlos**: basta con pasarles
las props correctas desde la pantalla contenedora.

| Componente | Archivo | API esperada del padre |
|---|---|---|
| `ScreenHeader` | `ScreenHeader.tsx` | `title`, `subtitle?`, `showBack?`, `onBack?`, `right?` (ReactNode). |
| `FloatingButton` | `FloatingButton.tsx` | `label`, `icon?`, `onClick`, `offset?`. |
| `ListItem` | `ListItem.tsx` | `title`, `meta?`, `description?`, `onClick`. |
| `LanguageOption` | `LanguageOption.tsx` | `flag`, `name`, `native`, `selected`, `onSelect`. |
| `InputField` | `InputField.tsx` | `value`, `onChange`, `placeholder?`, `type?`. |
| `VerseBlock` | `VerseBlock.tsx` | `title`, `verses: { n, text }[]`. Selección de texto vía `window.getSelection()` — **el padre escucha** con un ref si necesita el fragmento. |
| `ThreadHeader` | `ThreadHeader.tsx` | `quote`, `reference`. Mantiene `expanded` interno (UI pura). |
| `ChapterPickerModal` | `ChapterPickerModal.tsx` | `open`, `onClose`, `total`, `current`, `onSelect(n)`. |
| `CommentCard` | `CommentCard.tsx` | Ver tabla de la sección 06. |
| `CommentForm` | `CommentForm.tsx` | `state?`, `defaultAuthorName?`, `defaultText?`, `onSubmit({ name, text, audio })`, `onChange?`. |
| `PhoneFrame` | `PhoneFrame.tsx` | Solo wrapper visual para Storybook — no se usa en producción. |

### Notas específicas

- **`VerseBlock`**: hoy permite seleccionar texto pero no notifica al padre.
  Cuando se conecte la revisión real, añadir `onSelectionChange?(fragment, verseNumber)`
  o exponer un `ref` para que `ChapterReviewScreen` lea la selección.
- **`CommentCard`**: el `setInterval` de progreso es solo demo. Al conectar
  un `<audio>` real, eliminar el efecto interno y derivar `progress` de
  `currentTime / duration`.
- **`CommentForm`**: ya expone `onSubmit` con `{ name, text, audio: Blob | null }`.
  El audio real debe llegar como `Blob` desde `MediaRecorder`; hoy la
  grabación es simulada con un timer.
- **`ChapterPickerModal`**: es controlado (`open`/`onClose`). No persiste
  estado propio.

---

## Checklist consolidado de cableado

Estado actual de la API de cada pantalla. Todos los componentes ya aceptan
los datos como props (con valores mock por defecto para Storybook) y exponen
los callbacks necesarios. Lo único que queda **fuera del código de UI** es
trabajo del contenedor/router.

### Datos mock que ya son props (con default para Storybook)
- [x] `BookListScreen.books` → `books: Book[]`.
- [x] `BookSessionsScreen.sessions` + `bookTitle` → props.
- [x] `ChapterReadScreen` → `chapters`, `currentChapter`, `onChangeChapter`.
- [x] `ChapterReviewScreen` → `chapters`, `reviews`, `currentChapter`.
- [x] `ThreadScreen.comments` + `thread` → props.
- [x] `ReadOnlyThreadScreen.comments` + `thread` → props.
- [x] `NewCommentScreen` → `quote`, `reference`, `defaultAuthorName`.
- [x] `SettingsScreen` → `languages`, `fontSizes`, `initialPreferences`.
- [x] `SessionRevisionsScreen.session` → prop.

### Callbacks ya expuestos
- [x] `LanguageScreen`: `onSelectLanguage`, `onContinue(lang)`.
- [x] `BookListScreen`: `onSelectBook`, `onAddBook`, `onOpenSettings`.
- [x] `BookSessionsScreen`: `onOpenSession`, `onReadBook`, `onImportSessions`,
      `onExportAllSessions`, `onExportSession(session)`.
- [x] `SessionRevisionsScreen`: `onOpenRevision`, `onCloseSession`,
      `onReopenSession`.
- [x] `ChapterReadScreen`: `onChangeChapter(n)`, `onStartReview`.
- [x] `ChapterReviewScreen`: `onChangeChapter(n)`, `onCommentSelection`,
      `onSave({ title })`, `suggestedSessionTitle`, `saveModalOpen` /
      `onRequestSave` / `onCancelSave` (modal de título controlable),
      `onOpenReview(verse, idx)`.
- [x] `ThreadScreen`: `onNewComment`, `playingId` controlable.
- [x] `ReadOnlyThreadScreen`: `playingId` / `onTogglePlay` controlables.
- [x] `NewCommentScreen`: `onSubmit({ name, text, audio })`, `onCancel`,
      `state` controlado.
- [x] `SettingsScreen`: `onSave(prefs)`, `onChangeLanguage`,
      `onChangeFontSize`, `onExportAllData`, `onImportAllData`.
- [x] `VerseBlock`: `onSelectionChange({ fragment, verse })` para que
      `ChapterReviewScreen` capture la selección sin tocar `window.getSelection()`.

### Estado interno de navegación a eliminar al integrar el router
Estos `useState` siguen ahí **como modo demo** para Storybook. Cuando se
monten las rutas, basta con pasar el callback equivalente y dejar que el
router controle la transición:

- [ ] `BookSessionsScreen.openSession` → ruta hija
      `/books/:bookId/sessions/:sessionId` + usar `onOpenSession`.
- [ ] `SessionRevisionsScreen.openRevision` → ruta hija
      `/books/:bookId/sessions/:sessionId/revisions/:revisionId` + usar
      `onOpenRevision`.

### Pendiente en la capa de integración (no en los componentes)
- [ ] Conectar `onBack` de cada pantalla a `router.history.back()` o a la
      ruta padre concreta.
- [ ] Hidratar las props desde route loaders (`useLoaderData`) /
      react-query / store.
- [ ] Cablear los handlers de mutación (`onSubmit`, `onSave`,
      `onExport*`, `onImport*`) a las llamadas reales del backend.
- [ ] Añadir suscripción realtime para refrescar `ThreadScreen.comments`.
- [ ] Validar permisos en backend para acciones sensibles (cerrar sesión,
      exportar todo). Ocultar el botón en UI **no** es suficiente.

### Estado interno de UI que **puede quedarse** local
Estos `useState` no son de dominio; el equipo no necesita externalizarlos
salvo que quiera testearlos o controlarlos desde tests:

- `LanguageScreen`: `searchOpen`, `query`, `suggestions`.
- `ChapterReadScreen` / `ChapterReviewScreen`: `pickerOpen`, `reviewsOpen`.
- `ChapterReviewScreen`: `selectedText` (derivado de `getSelection`),
  `internalSaveOpen` + `titleDraft` (modal **Guardar sesión** cuando no se
  pasa `saveModalOpen`).
- `CommentCard`: `progress`, `localPlaying` (cuando no es controlado).
- `CommentForm`: `recording`, `recordingSeconds`, `recordedSeconds`, `playing`.
- `ThreadHeader`: `expanded`.
- `NewCommentScreen.internalState`: solo se usa cuando `state` no es controlado.

### Loading / error / empty states
**Hoy ninguna pantalla los modela.** Al conectar a la API añadir, por pantalla,
una de estas dos formas:

1. Prop discriminada: `status: "loading" | "error" | "ready"` + `data`.
2. Componentes hermanos en la ruta (`ErrorBoundary`, `Suspense`, skeletons).

### Permisos y rol
Las acciones que dependen del rol del usuario (cerrar sesión de revisión,
exportar todos los datos, etc.) deben validarse en backend. Ocultar el
botón en UI **no** es suficiente — el backend manda.


