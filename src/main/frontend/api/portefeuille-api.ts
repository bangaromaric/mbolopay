/**
 * Endpoints typés du module {@code portefeuille} côté front.
 *
 * @author BANGA Romaric
 */
import { api } from './client.js';
import type {
  DepotRequest,
  PageOperationsResponse,
  PortefeuilleResponse,
  RetraitRequest,
} from './types.js';

export const portefeuilleApi = {
  /** GET /api/portefeuilles/abonne/{abonneId} — récupère le portefeuille d'un abonné. */
  parAbonne: (abonneId: string) =>
    api.get<PortefeuilleResponse>(`/api/portefeuilles/abonne/${encodeURIComponent(abonneId)}`),

  /** POST /api/portefeuilles/{portefeuilleId}/depot — dépose un montant sur le portefeuille. */
  deposer: (portefeuilleId: string, req: DepotRequest) =>
    api.post<PortefeuilleResponse>(
      `/api/portefeuilles/${encodeURIComponent(portefeuilleId)}/depot`,
      req,
    ),

  /** POST /api/portefeuilles/{portefeuilleId}/retrait — retire un montant du portefeuille. */
  retirer: (portefeuilleId: string, req: RetraitRequest) =>
    api.post<PortefeuilleResponse>(
      `/api/portefeuilles/${encodeURIComponent(portefeuilleId)}/retrait`,
      req,
    ),

  /**
   * GET /api/portefeuilles/{portefeuilleId}/operations — historique paginé.
   *
   * @param portefeuilleId identifiant du portefeuille
   * @param page numéro de page 0-indexé (défaut 0)
   * @param taille taille de page 1..100 (défaut 20)
   */
  historique: (portefeuilleId: string, page = 0, taille = 20) =>
    api.get<PageOperationsResponse>(
      `/api/portefeuilles/${encodeURIComponent(portefeuilleId)}/operations?page=${page}&taille=${taille}`,
    ),

  /** GET /api/portefeuilles/sante — health check du module. */
  verifierSante: () => api.get<string>('/api/portefeuilles/sante'),
};
