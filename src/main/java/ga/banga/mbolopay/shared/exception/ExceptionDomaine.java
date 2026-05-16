package ga.banga.mbolopay.shared.exception;

/**
 * Racine de la hiérarchie des exceptions du domaine.
 *
 * <p>Toute violation d'une règle métier — quel que soit le bounded context — lève une
 * sous-classe de {@code ExceptionDomaine}. Cela permet :
 * <ul>
 *   <li>aux adaptateurs primaires (REST, listeners) de traduire uniformément les erreurs métier
 *       vers la frontière externe (ex. HTTP 4xx) ;</li>
 *   <li>aux règles ArchUnit de vérifier qu'aucun code domaine ne lance d'exception technique
 *       générique (par exemple {@link IllegalArgumentException}).</li>
 * </ul>
 *
 * @author BANGA Romaric
 */
public abstract class ExceptionDomaine extends RuntimeException {

    /**
     * Crée une exception domaine avec un message explicatif.
     *
     * @param message description de la règle métier violée
     */
    protected ExceptionDomaine(String message) {
        super(message);
    }

    /**
     * Crée une exception domaine avec un message et une cause technique sous-jacente.
     *
     * @param message description de la règle métier violée
     * @param cause   exception d'origine
     */
    protected ExceptionDomaine(String message, Throwable cause) {
        super(message, cause);
    }
}
