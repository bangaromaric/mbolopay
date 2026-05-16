package ga.banga.mbolopay.portefeuille.infrastructure.primary.web.dto;

/**
 * Requête REST de dépôt d'argent.
 *
 * @param montant montant à déposer en FCFA (entier positif attendu)
 * @author BANGA Romaric
 */
public record DepotRequest(long montant) {}
