package ga.banga.mbolopay.portefeuille.infrastructure.primary.web.dto;

/**
 * Requête REST de retrait d'argent.
 *
 * @param montant montant à retirer en FCFA (entier positif attendu)
 * @author BANGA Romaric
 */
public record RetraitRequest(long montant) {}
