package ga.banga.mbolopay.portefeuille.domain.exception;

import ga.banga.mbolopay.shared.exception.ExceptionDomaine;

/**
 * Exception métier levée lorsqu'un montant invalide est utilisé dans une opération financière.
 * Par exemple : tenter de déposer ou retirer un montant négatif.
 *
 * @author BANGA Romaric
 */
public class MontantInvalideException extends ExceptionDomaine {

    /**
     * Crée une exception avec un message explicatif.
     *
     * @param message description du problème
     */
    public MontantInvalideException(String message) {
        super(message);
    }
}
