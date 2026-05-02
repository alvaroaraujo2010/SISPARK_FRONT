import { HttpErrorResponse } from '@angular/common/http';

/**
 * Extrae un mensaje legible de respuestas Problem Details (RFC 7807) o errores de validacion.
 */
export function getHttpErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    return extractProblemDetail(error.error) ?? fallback;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

function extractProblemDetail(body: unknown): string | null {
  if (!body || typeof body !== 'object') {
    return null;
  }

  const problem = body as Record<string, unknown>;

  if (typeof problem['detail'] === 'string' && problem['detail'].trim()) {
    return problem['detail'].trim();
  }

  if (typeof problem['message'] === 'string' && problem['message'].trim()) {
    return problem['message'].trim();
  }

  if (typeof problem['title'] === 'string' && problem['title'].trim()) {
    return problem['title'].trim();
  }

  const errors = problem['errors'];
  if (errors && typeof errors === 'object') {
    const firstKey = Object.keys(errors as object)[0];
    if (firstKey) {
      const messages = (errors as Record<string, unknown>)[firstKey];
      if (Array.isArray(messages) && messages.length > 0 && typeof messages[0] === 'string') {
        return messages[0];
      }
    }
  }

  return null;
}
