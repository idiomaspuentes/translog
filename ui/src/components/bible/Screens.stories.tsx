import type { Meta, StoryObj } from "@storybook/react-vite";
import { PhoneFrame } from "./PhoneFrame";
import { LanguageScreen } from "./screens/LanguageScreen";
import { BookListScreen } from "./screens/BookListScreen";
import { BookSessionsScreen } from "./screens/BookSessionsScreen";
import { SessionRevisionsScreen } from "./screens/SessionRevisionsScreen";
import { ChapterReadScreen } from "./screens/ChapterReadScreen";
import { ChapterReviewScreen } from "./screens/ChapterReviewScreen";
import { ThreadScreen } from "./screens/ThreadScreen";
import { ReadOnlyThreadScreen } from "./screens/ReadOnlyThreadScreen";
import { NewCommentScreen } from "./screens/NewCommentScreen";
import { SettingsScreen } from "./screens/SettingsScreen";

const meta = {
  title: "Pantallas/Flujo completo",
  component: PhoneFrame,
  parameters: { layout: "centered" },
} satisfies Meta<typeof PhoneFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idioma: Story = {
  args: { label: "01 · Idioma", children: <LanguageScreen /> },
};
export const Libros: Story = {
  args: { label: "02 · Libros", children: <BookListScreen /> },
};
export const SesionesDelLibro: Story = {
  args: { label: "03 · Sesiones del libro", children: <BookSessionsScreen /> },
};
export const RevisionesDeSesion: Story = {
  args: {
    label: "03b · Revisiones de la sesión",
    children: (
      <SessionRevisionsScreen
        session={{
          title: "Sesión #3",
          range: "Ester 1",
          status: "cerrada",
          revisions: [
            { id: "r3", title: "Revisión #3", passage: "Ester 1:10–22", date: "12 abr 2026", comments: 28 },
            { id: "r2", title: "Revisión #2", passage: "Ester 1:1–9", date: "11 abr 2026", comments: 14 },
            { id: "r1", title: "Revisión #1", passage: "Ester 1", date: "10 abr 2026", comments: 6 },
          ],
        }}
      />
    ),
  },
};
export const Lectura: Story = {
  args: { label: "04 · Lectura", children: <ChapterReadScreen /> },
};
export const Seleccion: Story = {
  args: { label: "05 · Selección", children: <ChapterReviewScreen /> },
};
export const Revision: Story = {
  args: { label: "06 · Revisión", children: <ThreadScreen /> },
};
export const RevisionSoloLectura: Story = {
  args: { label: "07 · Revisión (solo lectura)", children: <ReadOnlyThreadScreen /> },
};

// Pantalla de comentario interactiva: el flujo idle → enviando → publicado
// se dispara con el clic en "Publicar comentario" (estado interno).
export const Comentario: Story = {
  args: { label: "08 · Comentario", children: <NewCommentScreen /> },
};

export const Configuracion: Story = {
  args: { label: "09 · Configuración", children: <SettingsScreen /> },
};
