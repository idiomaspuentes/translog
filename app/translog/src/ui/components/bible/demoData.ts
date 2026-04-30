/**
 * All mock/fixture data used by the demo index page and Storybook stories.
 * Screen components themselves ship with no hardcoded data.
 */

import type { Language } from "./screens/LanguageScreen";
import type { Book } from "./screens/BookListScreen";
import type { Session } from "./screens/BookReadScreen";
import type { SessionMap } from "./screens/BookSessionScreen";
import type { ReviewComment } from "./screens/ReviewScreen";
import type { FontSizeOption } from "./screens/SettingsScreen";

export const demoLanguages: Language[] = [
  { flag: "🇪🇸", name: "Español", native: "Spanish" },
  { flag: "🇬🇧", name: "English", native: "English" },
  { flag: "🇵🇹", name: "Português", native: "Portuguese" },
  { flag: "🇫🇷", name: "Français", native: "French" },
  { flag: "🇩🇪", name: "Deutsch", native: "German" },
  { flag: "🇮🇹", name: "Italiano", native: "Italian" },
];

export const demoBooks: Book[] = [
  { id: "ester", name: "Ester" },
  { id: "jonas", name: "Jonás" },
  { id: "tito", name: "Tito" },
  { id: "rut", name: "Rut" },
  { id: "filemon", name: "Filemón" },
  { id: "habacuc", name: "Habacuc" },
];

export const demoSessions: Session[] = [
  {
    id: 1746000000004,
    bookId: "ester",
    startDate: "2026-04-30T09:00:00.000Z",
    title: "Sesión matutina en la comunidad Raudal del Danto",
    range: "Ester 1–2",
    status: "abierta",
    reviewCount: 2,
  },
  {
    id: 1744500000003,
    bookId: "ester",
    startDate: "2026-04-12T14:00:00.000Z",
    title: "Taller con ancianos en Puerto Inírida",
    range: "Ester 1",
    status: "cerrada",
    reviewCount: 3,
  },
  {
    id: 1743700000002,
    bookId: "ester",
    startDate: "2026-04-03T17:00:00.000Z",
    title: "Revisión vespertina con el equipo traductor",
    range: "Ester 2",
    status: "cerrada",
    reviewCount: 2,
  },
  {
    id: 1742500000001,
    bookId: "ester",
    startDate: "2026-03-21T10:00:00.000Z",
    title: "Primera lectura comunitaria — Caño Bocón",
    range: "Ester 1",
    status: "cerrada",
    reviewCount: 1,
  },
];

export const demoSessionReviews: SessionMap = {
  1: {
    1: [
      { fragment: "en los días de Asuero", comments: 3 },
      { fragment: "ciento veintisiete provincias", comments: 1 },
    ],
    3: [{ fragment: "hizo banquete a todos sus príncipes y cortesanos", comments: 5 }],
    4: [
      { fragment: "las riquezas de la gloria de su reino", comments: 2 },
      { fragment: "el brillo y la magnificencia de su poder", comments: 0 },
      { fragment: "ciento ochenta días", comments: 4 },
    ],
  },
  2: {
    2: [{ fragment: "Busquen para el rey jóvenes vírgenes de buen parecer", comments: 2 }],
  },
  3: {},
};

/**
 * Demo USFM content for the book of Esther (chapters 1–3).
 * Used by ChapterReadScreen in the demo app and Storybook.
 */
export const demoUsfm = String.raw`\id EST
\h Ester
\toc1 Ester
\mt Ester
\c 1
\s1 La reina Vasti desafía a Asuero
\p
\v 1 Aconteció en los días de Asuero, el Asuero que reinó desde la India hasta Etiopía sobre ciento veintisiete provincias,
\v 2 que en aquellos días, cuando fue afirmado el rey Asuero sobre el trono de su reino, el cual estaba en Susa capital del reino,
\v 3 en el tercer año de su reinado hizo banquete a todos sus príncipes y cortesanos, teniendo delante de él a los más poderosos de Persia y de Media.
\v 4 Y mostró las riquezas de la gloria de su reino, y el brillo y la magnificencia de su poder, por muchos días, ciento ochenta días.
\c 2
\s1 Ester es proclamada reina
\p
\v 1 Pasadas estas cosas, sosegada ya la ira del rey Asuero, se acordó de Vasti y de lo que ella había hecho, y de la sentencia contra ella.
\v 2 Y dijeron los criados del rey, sus cortesanos: Busquen para el rey jóvenes vírgenes de buen parecer;
\v 3 y ponga el rey personas en todas las provincias de su reino, que lleven a todas las jóvenes vírgenes de buen parecer a Susa.
\c 3
\s1 Amán trama destruir a los judíos
\p
\v 1 Después de estas cosas el rey Asuero engrandeció a Amán hijo de Hamedata agagueo, y lo honró,
\v 2 y todos los siervos del rey que estaban a la puerta del rey se arrodillaban y se inclinaban ante Amán, porque así lo había mandado el rey.
`;

export const demoQuote =
  "que en aquellos días, cuando fue afirmado el rey Asuero sobre el trono de su reino, el cual estaba en Susa capital del reino, en el tercer año de su reinado hizo banquete a todos sus príncipes y cortesanos, teniendo delante de él a los más poderosos de Persia y de Media, mostrando las riquezas de la gloria de su reino y el brillo y la magnificencia de su poder por muchos días";

export const demoReference = "Ester 1:2";

export const demoReview = {
  title: "Revisión #3",
  subtitle: "Ester · 12 abr 2026",
  quote: demoQuote + "\n" + demoQuote,
  reference: demoReference,
  closedAt: "12 abr 2026",
};

export const demoClosedReviewComments: ReviewComment[] = [
  {
    id: 1,
    author: "María",
    time: "12 abr",
    text: "¿A qué días específicos se refiere el texto? Parece ambiguo en esta traducción.",
  },
  { id: 2, author: "Pablo", time: "12 abr", audio: { duration: "0:45" } },
  {
    id: 3,
    author: "Lucía",
    time: "13 abr",
    text: "Sería bueno revisar el texto hebreo para mayor precisión.",
  },
  {
    id: 4,
    author: "Daniel",
    time: "13 abr",
    audio: {
      duration: "0:22",
      waveform: [40, 70, 55, 85, 30, 65, 50, 80, 45, 60, 35, 75, 90, 50, 65, 40, 70, 55],
    },
  },
];

export const demoReviewComments: ReviewComment[] = [
  {
    id: 1,
    author: "María",
    time: "hace 2h",
    text: "¿A qué días específicos se refiere el texto? Parece ambiguo en esta traducción.",
  },
  { id: 2, author: "Pablo", time: "hace 1h", audio: { duration: "0:32" } },
  {
    id: 3,
    author: "Lucía",
    time: "hace 30m",
    text: "Sería bueno revisar el texto hebreo para mayor precisión.",
  },
  {
    id: 4,
    author: "Daniel",
    time: "hace 10m",
    audio: {
      duration: "0:18",
      waveform: [25, 60, 80, 45, 70, 35, 90, 55, 40, 75, 60, 50, 30, 85, 65, 45, 70, 55],
    },
  },
];

export const demoFontSizes: FontSizeOption[] = [
  { label: "Pequeño", sample: "Aa", size: "text-sm" },
  { label: "Mediano", sample: "Aa", size: "text-base" },
  { label: "Grande", sample: "Aa", size: "text-lg" },
  { label: "Muy grande", sample: "Aa", size: "text-xl" },
];
