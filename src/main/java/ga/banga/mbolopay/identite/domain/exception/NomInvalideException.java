package ga.banga.mbolopay.identite.domain.exception;

import ga.banga.mbolopay.shared.exception.ExceptionDomaine;

/**
 * Exception métier levée lorsqu'un {@link ga.banga.mbolopay.identite.domain.model.vo.NomGabonais}
 * est construit avec un prénom ou un nom invalide (vide).
 *
 * @author BANGA Romaric
 */
public class NomInvalideException extends ExceptionDomaine {

    /**
     * Crée une exception avec un message explicatif.
     *
     * @param message description de l'invariant violé
     */
    public NomInvalideException(String message) {
        super(message);
    }
}
