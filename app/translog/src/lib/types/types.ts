// types.ts

export interface Comment {
  id: number;
  date: string; // ISO string: "2026-04-30T16:38:34.131Z"
  author: string;
  text: string;
  type: string; // "text" o "audio"
  name?: string; // Solo para tipo "audio", el nombre del archivo de audio
  path?: string; // Solo para tipo "audio", el path del archivo de audio
}


export interface ChapterRef {
  chapterStart: number;
  verseStart:  number;
  chapterEnd:    number;
  verseEnd:      number;
}

export interface Review {
  id: number;
  text: string;
  reference: ChapterRef;
  comments: Comment[];
}

export interface Session {
  id: number; // timestamp-like
  startDate: string; // ISO string
  bookId: string;
  reviews: Review[];
}

export interface Book {
  id: string;
  code: string;
  langCode: string;
  name: string;
  version: string;
  content: string;
  sessions: Session[];
}

export interface Language {
  code: string;
  name: string;
  books: Book[];
}

// si ese JSON es lo que te devuelve tu API:
export interface ApiResponse {
  language: Language[];
}