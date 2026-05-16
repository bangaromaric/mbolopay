/**
 * Endpoints typés du module {@code identite} côté front.
 *
 * @author BANGA Romaric
 */
import { api } from './client.js';
import type { AbonneResponse, CreerAbonneRequest } from './types.js';

export const abonneApi = {
  /** POST /api/abonnes — crée un nouvel abonné. */
  creer: (req: CreerAbonneRequest) =>
    api.post<AbonneResponse>('/api/abonnes', req),

  /** GET /api/abonnes/{id} — récupère un abonné par son identifiant. */
  parId: (id: string) =>
    api.get<AbonneResponse>(`/api/abonnes/${encodeURIComponent(id)}`),
};
