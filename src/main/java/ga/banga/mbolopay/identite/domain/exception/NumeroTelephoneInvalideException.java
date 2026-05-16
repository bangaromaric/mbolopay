package ga.banga.mbolopay.identite.domain.exception;

import ga.banga.mbolopay.shared.exception.ExceptionDomaine;

/**
 * Exception métier levée lorsqu'un
 * {@link ga.banga.mbolopay.identite.domain.model.vo.NumeroTelephoneGabonais}
 * est construit avec une valeur invalide (vide ou format non gabonais).
 *
 * @author BANGA Romaric
 */
public class NumeroTelephoneInvalideException extends ExceptionDomaine {

    /**
     * Crée une exception avec un message explicatif.
     *
     * @param message description de l'invariant violé
     */
    public NumeroTelephoneInvalideException(String message) {
        super(message);
    }
}
