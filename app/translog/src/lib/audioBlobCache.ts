/**
 * Web audio-blob cache keyed by comment ID.
 *
 * Used on web (non-native) where the Capacitor Filesystem is unavailable.
 * Persists blobs as base64 in sessionStorage (survives SPA navigation AND
 * page refreshes within the same browser tab) with a module-level Blob cache
 * for zero-cost repeated lookups within the same render cycle.
 */

const SESSION_KEY_PREFIX = 'audio_blob_'
const memCache = new Map<number, Blob>()

/** Converts a Blob to a raw base64 string (no data-URI prefix). */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Persists the blob in sessionStorage and the in-memory cache.
 * Called right after saveComment() returns the new comment ID.
 */
export async function storeAudioBlob(commentId: number, blob: Blob): Promise<void> {
  console.log('[audioBlobCache] storeAudioBlob id:', commentId, 'size:', blob.size, 'type:', blob.type)
  memCache.set(commentId, blob)
  try {
    const b64 = await blobToBase64(blob)
    const mimeType = blob.type || 'audio/webm'
    const value = `${mimeType}|${b64}`
    sessionStorage.setItem(`${SESSION_KEY_PREFIX}${commentId}`, value)
    console.log('[audioBlobCache] stored in sessionStorage key:', `${SESSION_KEY_PREFIX}${commentId}`, 'valueLen:', value.length)
  } catch (e) {
    console.warn('[audioBlobCache] sessionStorage write failed:', e)
    // sessionStorage quota exceeded or unavailable — in-memory cache is still usable
  }
}

/**
 * Returns a Blob for the given comment, first from the in-memory cache,
 * then from sessionStorage. Returns undefined if not found.
 */
export function getAudioBlob(commentId: number): Blob | undefined {
  const cached = memCache.get(commentId)
  if (cached) { console.log('[audioBlobCache] getAudioBlob', commentId, '→ from memCache'); return cached }

  try {
    const key = `${SESSION_KEY_PREFIX}${commentId}`
    const stored = sessionStorage.getItem(key)
    console.log('[audioBlobCache] getAudioBlob', commentId, '→ sessionStorage key', key, ':', stored ? `found (${stored.length} chars)` : 'not found')
    if (stored) {
      const pipe = stored.indexOf('|')
      const mimeType = stored.slice(0, pipe)
      const b64 = stored.slice(pipe + 1)
      const binary = atob(b64)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
      const blob = new Blob([bytes], { type: mimeType })
      memCache.set(commentId, blob)
      return blob
    }
  } catch {
    // sessionStorage unavailable
  }

  return undefined
}
