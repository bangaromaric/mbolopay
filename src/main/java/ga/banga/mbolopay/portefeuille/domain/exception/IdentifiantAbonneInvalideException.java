package ga.banga.mbolopay.portefeuille.domain.exception;

import ga.banga.mbolopay.shared.exception.ExceptionDomaine;

/**
 * Exception métier levée lorsqu'une {@code AbonneIdReference} (référence locale du module
 * portefeuille vers un abonné) est construite avec une valeur invalide.
 *
 * <p>Ne pas confondre avec l'exception du même nom dans le module Identité : ici c'est la
 * frontière du portefeuille — l'abonné n'est référencé qu'en valeur, jamais par son agrégat.
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
