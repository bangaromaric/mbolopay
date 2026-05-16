package ga.banga.mbolopay.identite.domain.exception;

import ga.banga.mbolopay.shared.exception.ExceptionDomaine;

/**
 * Exception métier levée lorsqu'une tentative est faite de construire un
 * {@link ga.banga.mbolopay.identite.domain.model.AbonneId} avec une valeur invalide.
 *
 * @author BANGA Romaric
 */
public class IdentifiantAbonneInvalideException extends ExceptionDomaine {

    /**
     * Crée une exception avec un message explicatif.
     *
     * @param message description de l'invariant violé
     */
    public IdentifiantAbonneInvalideException(String message) {
        super(message);
    }
}
