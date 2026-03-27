/**
 * Extracts a human-readable error message string from an axios error response.
 *
 * When a backend returns a JSON error body (e.g. { error: "Username taken" } or
 * { message: "Bad request" }), `err.response.data` is an object. Rendering that
 * object directly as a React child causes the runtime error:
 *   "Objects are not valid as a React child (found: object with keys {error})"
 *
 * Use this helper everywhere an API error is displayed in JSX.
 *
 * @param {unknown} err - The caught error (typically an axios error).
 * @param {string} fallback - User-friendly message shown when no specific message is found.
 * @returns {string} A plain string suitable for rendering in JSX.
 */
export function extractErrorMessage(err, fallback = 'An unexpected error occurred.') {
  const data = err?.response?.data;
  if (typeof data === 'string' && data.trim()) return data;
  if (data && typeof data === 'object') {
    if (typeof data.error === 'string' && data.error.trim()) return data.error;
    if (typeof data.message === 'string' && data.message.trim()) return data.message;
    // Return fallback when the shape isn't recognizable
    return fallback;
  }
  if (err?.message) return err.message;
  return fallback;
}
