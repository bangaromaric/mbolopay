package ga.banga.mbolopay.identite.domain.exception;

import ga.banga.mbolopay.shared.exception.ExceptionDomaine;

/**
 * Exception métier levée quand un abonné n'est pas trouvé par son identifiant.
 *
 * <p>Mappée sur HTTP 404 NOT_FOUND par
 * {@link ga.banga.mbolopay.identite.infrastructure.primary.web.advice.GestionnaireExceptionsIdentite}.
 *
 * @author BANGA Romaric
 */
public class AbonneIntrouvableException extends ExceptionDomaine {

    /**
     * Crée une exception référant l'abonné manquant par son identifiant.
     *
     * @param id identifiant de l'abonné introuvable
     */
    public AbonneIntrouvableException(String id) {
        super("Abonné introuvable : " + id);
    }
}
