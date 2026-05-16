/**
 * Wrapper `fetch` typé pour l'API REST MboloPay.
 *
 * Discrimination des erreurs en 4 variantes :
 *   - `NetworkError` : réseau indisponible, CORS, etc.
 *   - `ValidationError` : 400 avec corps JSON métier
 *   - `ClientError` : 4xx autres (404, 409…)
 *   - `ServerError` : 5xx
 *
 * Le pattern union discriminée + `switch` exhaustif côté appelant garantit
 * que tous les cas sont gérés à la compilation.
 *
 * <p>En mode pédagogique, chaque appel est journalisé dans
 * {@code lib/journal-http.ts} (alimenté avant fetch, terminé après réponse
 * ou erreur). Le mapping URL→port et le mapping exception→HTTP sont
 * appliqués à ce stade pour enrichir l'Inspector.
 *
 * @author BANGA Romaric
 */
import type { ReponseErreur } from './types.js';
import { decoder } from '../lib/mapping-http.js';
import { demarrer, terminer, terminerErreurReseau } from '../lib/journal-http.js';
import { deduire } from '../lib/exceptions-metier.js';
import { estActif as modePedagogiqueActif } from '../lib/mode-pedagogique.js';

export type ApiError =
  | { kind: 'NetworkError'; cause: unknown }
  | { kind: 'ClientError'; status: number; body: ReponseErreur | unknown }
  | { kind: 'ServerError'; status: number; body: ReponseErreur | unknown }
  | { kind: 'ValidationError'; status: 400; body: ReponseErreur };

const API_BASE = '';

type Verbe = 'GET' | 'POST' | 'PUT' | 'DELETE';

function parseBodyJson(body: BodyInit | null | undefined): unknown {
  if (typeof body !== 'string') return undefined;
  try {
    return JSON.parse(body);
  } catch {
    return undefined;
  }
}

async function appel<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = ((init.method ?? 'GET').toUpperCase()) as Verbe;
  const tracker = modePedagogiqueActif();
  let idJournal: string | null = null;
  if (tracker) {
    idJournal = demarrer({
      method,
      url: path,
      port: decoder(method, path),
      requestBody: parseBodyJson(init.body),
    });
  }

  let reponse: Response;
  try {
    reponse = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'fr-GA',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    });
  } catch (cause) {
    if (idJournal) terminerErreurReseau(idJournal, cause);
    throw { kind: 'NetworkError', cause } satisfies ApiError;
  }

  if (!reponse.ok) {
    const body = (await reponse.json().catch(() => ({}))) as ReponseErreur;
    if (idJournal) {
      const message =
        (body as { message?: string }).message ??
        (body as { details?: string }).details;
      terminer(idJournal, {
        statutHttp: reponse.status,
        body,
        exceptionMetier: deduire(method, path, reponse.status, message),
      });
    }
    if (reponse.status === 400) {
      throw { kind: 'ValidationError', status: 400, body } satisfies ApiError;
    }
    if (reponse.status >= 500) {
      throw { kind: 'ServerError', status: reponse.status, body } satisfies ApiError;
    }
    throw { kind: 'ClientError', status: reponse.status, body } satisfies ApiError;
  }

  if (reponse.status === 204) {
    if (idJournal) terminer(idJournal, { statutHttp: 204 });
    return undefined as T;
  }
  const data = (await reponse.json()) as T;
  if (idJournal) terminer(idJournal, { statutHttp: reponse.status, body: data });
  return data;
}

/**
 * Façade unique d'appel HTTP. Préférer cet objet à `fetch` direct dans le code applicatif :
 * les erreurs sont normalisées en {@link ApiError} discriminées.
 */
export const api = {
  get:    <T>(path: string)                 => appel<T>(path, { method: 'GET' }),
  post:   <T>(path: string, body: unknown)  => appel<T>(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown)  => appel<T>(path, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: <T>(path: string)                 => appel<T>(path, { method: 'DELETE' }),
};
