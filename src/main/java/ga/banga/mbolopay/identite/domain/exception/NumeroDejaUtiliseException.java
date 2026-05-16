package ga.banga.mbolopay.identite.domain.exception;

import ga.banga.mbolopay.shared.exception.ExceptionDomaine;

/**
 * Exception métier levée quand un numéro de téléphone est déjà utilisé par un abonné existant.
 *
 * @author BANGA Romaric
 */
public class NumeroDejaUtiliseException extends ExceptionDomaine {

    /**
     * Crée une exception avec un message explicatif.
     *
     * @param message description du conflit (numéro concerné)
     */
    public NumeroDejaUtiliseException(String message) {
        super(message);
    }
}
