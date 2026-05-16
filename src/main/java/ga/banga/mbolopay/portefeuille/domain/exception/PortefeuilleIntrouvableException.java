package ga.banga.mbolopay.portefeuille.domain.exception;

import ga.banga.mbolopay.shared.exception.ExceptionDomaine;

/**
 * Exception métier levée quand un portefeuille n'est pas trouvé.
 *
 * @author BANGA Romaric
 */
public class PortefeuilleIntrouvableException extends ExceptionDomaine {

    /**
     * Crée une exception référant le portefeuille manquant par son identifiant.
     *
     * @param id identifiant du portefeuille introuvable
     */
    public PortefeuilleIntrouvableException(String id) {
        super("Portefeuille introuvable : " + id);
    }
}
