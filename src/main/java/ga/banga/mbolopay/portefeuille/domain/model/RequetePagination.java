package ga.banga.mbolopay.portefeuille.domain.model;

import ga.banga.mbolopay.shared.exception.ExceptionDomaine;

/**
 * Demande de pagination du domaine, indépendante de tout framework (Spring Data,
 * JPA, etc.). Les adaptateurs secondaires se chargent de la traduire dans leur API
 * de persistance (ex. {@code PageRequest.of} côté Spring Data).
 *
 * <p>Garde le domaine pur conformément à la règle de l'architecture hexagonale
 * (CLAUDE.md §Domain : zéro dépendance framework).
 *
 * @param page   numéro de page (0-indexed)
 * @param taille nombre d'éléments par page (strictement positif)
 * @author BANGA Romaric
 */
public record RequetePagination(int page, int taille) {

    public RequetePagination {
        if (page < 0) {
            throw new RequetePaginationInvalideException(
                    "Le numéro de page doit être positif ou nul (reçu : " + page + ")");
        }
        if (taille <= 0) {
            throw new RequetePaginationInvalideException(
                    "La taille de page doit être strictement positive (reçu : " + taille + ")");
        }
        if (taille > 100) {
            throw new RequetePaginationInvalideException(
                    "La taille de page ne peut pas dépasser 100 (reçu : " + taille + ")");
        }
    }

    /** Première page par défaut, 20 éléments. */
    public static RequetePagination premiereParDefaut() {
        return new RequetePagination(0, 20);
    }

    /**
     * Exception levée par le constructeur compact en cas de paramètres invalides.
     * Visibilité package : levée localement, mappée comme {@link ExceptionDomaine}.
     */
    public static final class RequetePaginationInvalideException extends ExceptionDomaine {
        public RequetePaginationInvalideException(String message) {
            super(message);
        }
    }
}
