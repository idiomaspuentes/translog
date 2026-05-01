import type { Meta, StoryObj } from "@storybook/react-vite";
import { PhoneFrame } from "./PhoneFrame";
import { LanguageScreen } from "./screens/LanguageScreen";
import { BookListScreen } from "./screens/BookListScreen";
import { BookReadScreen } from "./screens/BookReadScreen";
import { BookSessionScreen } from "./screens/BookSessionScreen";
import { ReviewScreen } from "./screens/ReviewScreen";
import { NewCommentScreen } from "./screens/NewCommentScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import {
  demoLanguages,
  demoBooks,
  demoUsfm,
  demoSessions,
  demoSessionReviews,
  demoReview,
  demoClosedReviewComments,
  demoReviewComments,
  demoQuote,
  demoReference,
  demoFontSizes,
} from "./demoData";

const meta = {
  title: "Pantallas/Flujo completo",
  component: PhoneFrame,
  parameters: { layout: "centered" },
} satisfies Meta<typeof PhoneFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idioma: Story = {
  args: {
    label: "01 · Idioma",
    children: <LanguageScreen languages={demoLanguages} initialSelected="Español" />,
  },
};

export const Libros: Story = {
  args: {
    label: "02 · Libros",
    children: <BookListScreen books={demoBooks} />,
  },
};

export const Lectura: Story = {
  args: {
    label: "03 · Lectura",
    children: <BookReadScreen bookTitle="Ester" usfm={demoUsfm} sessions={demoSessions} />,
  },
};

export const Sesion: Story = {
  args: {
    label: "04 · Sesión",
    children: (
      <BookSessionScreen bookTitle="Ester" usfm={demoUsfm} sessions={demoSessionReviews} />
    ),
  },
};

export const Revision: Story = {
  args: {
    label: "05 · Revisión",
    children: (
      <ReviewScreen
        title="Revisión"
        subtitle="Discusión comunitaria"
        quote={demoQuote}
        reference={demoReference}
        comments={demoReviewComments}
      />
    ),
  },
};

export const RevisionCerrada: Story = {
  args: {
    label: "06 · Revisión (cerrada)",
    children: (
      <ReviewScreen
        title={demoReview.title}
        subtitle={demoReview.subtitle}
        quote={demoReview.quote}
        reference={demoReview.reference}
        closedAt={demoReview.closedAt}
        comments={demoClosedReviewComments}
        closed
      />
    ),
  },
};

export const Comentario: Story = {
  args: {
    label: "07 · Comentario",
    children: <NewCommentScreen quote={demoQuote} reference={demoReference} />,
  },
};

export const Configuracion: Story = {
  args: {
    label: "08 · Configuración",
    children: (
      <SettingsScreen
        languages={demoLanguages}
        fontSizes={demoFontSizes}
        initialPreferences={{ language: "Español", fontSize: "Mediano" }}
      />
    ),
  },
};
