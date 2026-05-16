package ga.banga.mbolopay.portefeuille.domain.exception;

import ga.banga.mbolopay.shared.exception.ExceptionDomaine;

/**
 * Exception métier levée lorsque le solde d'un portefeuille est insuffisant
 * pour couvrir une opération de retrait.
 *
 * @author BANGA Romaric
 */
public class SoldeInsuffisantException extends ExceptionDomaine {

    /**
     * Crée une exception avec un message explicatif.
     *
     * @param message description du problème (solde disponible, montant demandé)
     */
    public SoldeInsuffisantException(String message) {
        super(message);
    }
}
