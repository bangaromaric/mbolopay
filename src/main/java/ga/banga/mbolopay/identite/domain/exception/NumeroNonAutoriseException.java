package ga.banga.mbolopay.identite.domain.exception;

import ga.banga.mbolopay.shared.exception.ExceptionDomaine;

/**
 * Exception métier levée quand un numéro de téléphone n'est pas autorisé (liste noire).
 *
 * @author BANGA Romaric
 */
public class NumeroNonAutoriseException extends ExceptionDomaine {

    /**
     * Crée une exception avec un message explicatif.
     *
     * @param message description du refus
     */
    public NumeroNonAutoriseException(String message) {
        super(message);
    }
}
