export function groupCommentsByVerse(sessionComments) {
  const reviewsMap = {};
  sessionComments.forEach(c => {
    const key = c.verseKey || "general";
    if (!reviewsMap[key]) {
      reviewsMap[key] = {
        text: "",
        reference: parseVerse(key),
        date: c.date,
        comments: []
      };
    }
    reviewsMap[key].comments.push({ date: c.date, author: c.author, text: c.text });
  });
  return Object.values(reviewsMap);
}

export function parseVerse(key) {
  if (!key.includes('.')) return { chapterStart: 1, verseStart: 1, chapterEnd: 1, verseEnd: 1 };
  const [, chapter, verse] = key.split('.');
  const ch = parseInt(chapter) || 1;
  const v = parseInt(verse) || 1;
  return { chapterStart: ch, verseStart: v, chapterEnd: ch, verseEnd: v };
}