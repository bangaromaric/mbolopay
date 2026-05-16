/**
 * Types DTO miroirs des records Java exposés par les `@RestController`
 * (cf. `infrastructure/primary/web/dto/`).
 *
 * Toute évolution côté Java doit être répercutée ici — TypeScript est l'unique
 * filet de sécurité pour le contrat HTTP.
 *
 * @author BANGA Romaric
 */

/** Requête POST /api/abonnes — cf. {@code CreerAbonneRequest.java}. */
export interface CreerAbonneRequest {
  prenom: string;
  nom: string;
  numeroTelephone: string;
}

/** Réponse de POST /api/abonnes et GET — cf. {@code AbonneResponse.java}. */
export interface AbonneResponse {
  id: string;
  prenom: string;
  nom: string;
  numeroTelephone: string;
  numeroFormatInternational: string;
  dateInscription: string;
  actif: boolean;
}

/** Format JSON d'erreur unifié — cf. {@code ReponseErreur.java}. */
export interface ReponseErreur {
  code: number;
  message: string;
  details: string;
  timestamp: string;
}

/** Requête POST /api/portefeuilles/{id}/depot — cf. {@code DepotRequest.java}. */
export interface DepotRequest {
  montant: number;
}

/** Réponse des endpoints portefeuille — cf. {@code PortefeuilleResponse.java}. */
export interface PortefeuilleResponse {
  id: string;
  abonneId: string;
  solde: number;
  soldeFormate: string;
  dateCreation: string;
}

/** Requête POST /api/portefeuilles/{id}/retrait — cf. {@code RetraitRequest.java}. */
export interface RetraitRequest {
  montant: number;
}

/** Nature d'une opération (miroir de {@code TypeOperation.java}). */
export type TypeOperation = 'DEPOT' | 'RETRAIT';

/** Réponse REST représentant une opération — cf. {@code OperationResponse.java}. */
export interface OperationResponse {
  id: string;
  portefeuilleId: string;
  type: TypeOperation;
  montant: number;
  montantFormate: string;
  soldeApres: number;
  soldeApresFormate: string;
  dateOperation: string;
}

/** Page paginée d'opérations — cf. {@code PageOperationsResponse.java}. */
export interface PageOperationsResponse {
  contenu: OperationResponse[];
  pageActuelle: number;
  taillePage: number;
  totalElements: number;
  totalPages: number;
}
