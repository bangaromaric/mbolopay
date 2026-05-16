package ga.banga.mbolopay.portefeuille.domain.exception;

import ga.banga.mbolopay.shared.exception.ExceptionDomaine;

/**
 * Exception métier levée lorsqu'une tentative est faite de construire un
 * {@link ga.banga.mbolopay.portefeuille.domain.model.PortefeuilleId} avec une valeur invalide.
 *
 * @author BANGA Romaric
 */
public class IdentifiantPortefeuilleInvalideException extends ExceptionDomaine {

    /**
     * Crée une exception avec un message explicatif.
     *
     * @param message description de l'invariant violé
     */
    public IdentifiantPortefeuilleInvalideException(String message) {
        super(message);
    }
}
