import { openDb } from "./db.js";

export async function createReview(sessionId, reviewData) {
  const db = await openDb();

  const fullReview = {
    sessionId,
    text: reviewData.text || "",
    reference: {
      chapterStart: reviewData.chapterStart || 1,
      verseStart:  reviewData.verseStart  || 1,
      chapterEnd:    reviewData.chapterEnd   || 1,
      verseEnd:      reviewData.verseEnd     || 1,
    },
    startDate: reviewData.date
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction("reviews", "readwrite");
    const req = tx.objectStore("reviews").add(fullReview);

    req.onsuccess = () => {
      const id = req.result; // ID autoincremental de IndexedDB
      const review = { ...fullReview, id };
      console.log("✅ Review creado:", review);
      resolve(review);
    };

    req.onerror = () => {
      console.error("❌ Error al crear review:", req.error);
      reject(req.error);
    };
  });
}

export async function saveReview(review) {
  const db = await openDb();
  const fullReview = { ...review, startDate: new Date().toISOString() };
  return new Promise((resolve, reject) => {
    const tx = db.transaction("reviews", "readwrite");
    const req = tx.objectStore("reviews").add(fullReview);
    req.onsuccess = () => resolve({ ...fullReview, id: req.result });
    tx.onerror = () => reject(tx.error);
  });
}

export async function listReviewsBySession(sessionId) {
  const db = await openDb();
  return new Promise((resolve) => {
    const tx = db.transaction("reviews", "readonly");
    const req = tx.objectStore("reviews").index("bySession").getAll(sessionId);
    req.onsuccess = () => resolve(req.result.map(review => ({
      id: review.id,
      text: review.text,
      reference: review.reference,
      date: review.date
    })));
  });
}

export async function getReview(reviewId) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("reviews", "readonly");
    const req = tx.objectStore("reviews").get(reviewId);
    req.onsuccess = () => {
      if (!req.result) return reject(new Error(`Review not found: ${reviewId}`));
      resolve(req.result);
    };
  });
}