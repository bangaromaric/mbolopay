package ga.banga.mbolopay.portefeuille.domain.model;

/**
 * Nature d'une opération enregistrée dans l'historique d'un portefeuille.
 *
 * @author BANGA Romaric
 */
public enum TypeOperation {

    /** Crédit du portefeuille (dépôt d'argent). */
    DEPOT,

    /** Débit du portefeuille (retrait d'argent). */
    RETRAIT
}
