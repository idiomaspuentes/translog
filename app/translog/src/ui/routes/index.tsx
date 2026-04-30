import { createFileRoute } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/bible/PhoneFrame";
import { LanguageScreen } from "@/components/bible/screens/LanguageScreen";
import { BookListScreen } from "@/components/bible/screens/BookListScreen";
import { BookReadScreen } from "@/components/bible/screens/BookReadScreen";
import { BookSessionScreen } from "@/components/bible/screens/BookSessionScreen";
import { ReviewScreen } from "@/components/bible/screens/ReviewScreen";
import { NewCommentScreen } from "@/components/bible/screens/NewCommentScreen";
import { SettingsScreen } from "@/components/bible/screens/SettingsScreen";
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
} from "@/components/bible/demoData";

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
          Una experiencia móvil moderna y minimalista para leer, revisar y discutir traducciones
          bíblicas en comunidad.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <PhoneFrame label="01 · Idioma">
            <LanguageScreen languages={demoLanguages} initialSelected="Español" />
          </PhoneFrame>
          <PhoneFrame label="02 · Libros">
            <BookListScreen books={demoBooks} />
          </PhoneFrame>
          <PhoneFrame label="03 · Lectura">
            <BookReadScreen bookTitle="Ester" usfm={demoUsfm} sessions={demoSessions} />
          </PhoneFrame>
          <PhoneFrame label="04 · Sesión">
            <BookSessionScreen bookTitle="Ester" usfm={demoUsfm} sessions={demoSessionReviews} />
          </PhoneFrame>
          <PhoneFrame label="05 · Revisión">
            <ReviewScreen
              title="Revisión"
              subtitle="Discusión comunitaria"
              quote={demoQuote}
              reference={demoReference}
              comments={demoReviewComments}
            />
          </PhoneFrame>
          <PhoneFrame label="06 · Revisión (cerrada)">
            <ReviewScreen
              title={demoReview.title}
              subtitle={demoReview.subtitle}
              quote={demoReview.quote}
              reference={demoReview.reference}
              closedAt={demoReview.closedAt}
              comments={demoClosedReviewComments}
              closed
            />
          </PhoneFrame>
          <PhoneFrame label="07 · Comentario · idle">
            <NewCommentScreen state="idle" quote={demoQuote} reference={demoReference} />
          </PhoneFrame>
          <PhoneFrame label="07 · Comentario · enviando">
            <NewCommentScreen state="submitting" quote={demoQuote} reference={demoReference} />
          </PhoneFrame>
          <PhoneFrame label="07 · Comentario · publicado">
            <NewCommentScreen state="success" quote={demoQuote} reference={demoReference} />
          </PhoneFrame>
          <PhoneFrame label="08 · Configuración">
            <SettingsScreen
              languages={demoLanguages}
              fontSizes={demoFontSizes}
              initialPreferences={{ language: "Español", fontSize: "Mediano" }}
            />
          </PhoneFrame>
        </div>
      </section>
    </main>
  );
}
