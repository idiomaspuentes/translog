// types.ts

export interface Comment {
  id: number;
  date: string; // ISO string: "2026-04-30T16:38:34.131Z"
  author: string;
  text: string;
  type?: string; // "text" | "audio"
  name?: string; // filename of the audio clip, e.g. "comment_1234.webm"
  path?: string; // Filesystem-relative path, e.g. "comments/audios/comment_1234.webm"
  audioDurationMs?: number; // duration in milliseconds (audio comments only)
}


export interface ChapterRef {
  chapterStart: number;
  verseStart: number;
  chapterEnd: number;
  verseEnd: number;
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
  endDate?: string; // ISO string — set when session is closed
  title?: string;
  bookId: string;
  reviews: Review[];
}

export interface Book {
  id: string;
  code: string;
  langCode: string;
  name: string;
  version: string;
  content: string; //USFM string format.
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