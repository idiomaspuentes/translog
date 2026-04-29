import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/bible/PhoneFrame";
import { LanguageScreen } from "@/components/bible/screens/LanguageScreen";
import { BookListScreen } from "@/components/bible/screens/BookListScreen";
import { ChapterReadScreen } from "@/components/bible/screens/ChapterReadScreen";
import { ChapterReviewScreen } from "@/components/bible/screens/ChapterReviewScreen";
import { ThreadScreen } from "@/components/bible/screens/ThreadScreen";
import { NewCommentScreen } from "@/components/bible/screens/NewCommentScreen";
import { BookSessionsScreen } from "@/components/bible/screens/BookSessionsScreen";
import { ReadOnlyThreadScreen } from "@/components/bible/screens/ReadOnlyThreadScreen";
import { SettingsScreen } from "@/components/bible/screens/SettingsScreen";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Lectio — Revisión comunitaria de la Biblia" },
      {
        name: "description",
        content:
          "App móvil para revisión comunitaria de traducciones bíblicas. Lee, comenta y discute en comunidad.",
      },
    ],
  }),
});

function Index() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground">
              <span className="text-sm font-bold">L</span>
            </div>
            <span className="text-base font-semibold tracking-tight">Lectio</span>
          </div>
          <a
            href="/storybook/index.html"
            className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-foreground hover:bg-accent"
          >
            Storybook →
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16 text-center">
        <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
          Demo · UI sin estado
        </span>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Revisión comunitaria de la Biblia
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
          Una experiencia móvil moderna y minimalista para leer, revisar y
          discutir traducciones bíblicas en comunidad.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <PhoneFrame label="01 · Idioma">
            <LanguageScreen />
          </PhoneFrame>
          <PhoneFrame label="02 · Libros">
            <BookListScreen />
          </PhoneFrame>
          <PhoneFrame label="03 · Sesiones del libro">
            <BookSessionsScreen />
          </PhoneFrame>
          <PhoneFrame label="04 · Lectura">
            <ChapterReadScreen />
          </PhoneFrame>
          <PhoneFrame label="05 · Selección">
            <ChapterReviewScreen />
          </PhoneFrame>
          <PhoneFrame label="06 · Revisión">
            <ThreadScreen />
          </PhoneFrame>
          <PhoneFrame label="07 · Revisión (solo lectura)">
            <ReadOnlyThreadScreen />
          </PhoneFrame>
          <PhoneFrame label="08 · Comentario · idle">
            <NewCommentScreen state="idle" />
          </PhoneFrame>
          <PhoneFrame label="08 · Comentario · enviando">
            <NewCommentScreen state="submitting" />
          </PhoneFrame>
          <PhoneFrame label="08 · Comentario · publicado">
            <NewCommentScreen state="success" />
          </PhoneFrame>
          <PhoneFrame label="09 · Configuración">
            <SettingsScreen />
          </PhoneFrame>
        </div>
      </section>
    </main>
  );
}
