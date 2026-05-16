package ga.banga.mbolopay.identite.infrastructure.primary.web.advice;

import org.jspecify.annotations.NonNull;

import java.time.Instant;

/**
 * Format standard de réponse d'erreur pour le module Identité.
 *
 * @param code      code HTTP
 * @param message   libellé technique court (ex. {@code "BAD_REQUEST"})
 * @param details   détail lisible côté utilisateur
 * @param timestamp horodatage de l'erreur
 * @author BANGA Romaric
 */
public record ReponseErreur(int code,
                            @NonNull String message,
                            @NonNull String details,
                            @NonNull Instant timestamp) {

    /**
     * Construit une réponse HTTP 400 BAD_REQUEST (violation métier non bloquante : numéro
     * invalide, format incorrect, etc.).
     *
     * @param message description lisible côté utilisateur
     * @return la réponse d'erreur 400 horodatée
     */
    public static ReponseErreur badRequest(String message) {
        return new ReponseErreur(
                400,
                "BAD_REQUEST",
                message,
                Instant.now()
        );
    }

    /**
     * Construit une réponse HTTP 409 CONFLICT (ressource déjà existante : numéro de
     * téléphone déjà enregistré).
     *
     * @param message description du conflit
     * @return la réponse d'erreur 409 horodatée
     */
    public static ReponseErreur conflict(String message) {
        return new ReponseErreur(
                409,
                "CONFLICT",
                message,
                Instant.now()
        );
    }

    /**
     * Construit une réponse HTTP 404 NOT_FOUND (ressource demandée inexistante :
     * abonné introuvable par identifiant).
     *
     * @param message description lisible côté utilisateur
     * @return la réponse d'erreur 404 horodatée
     */
    public static ReponseErreur notFound(String message) {
        return new ReponseErreur(
                404,
                "NOT_FOUND",
                message,
                Instant.now()
        );
    }

    /**
     * Construit une réponse HTTP 500 INTERNAL_ERROR (erreur inattendue non métier).
     * Le message technique n'est pas exposé au client pour des raisons de sécurité.
     *
     * @return la réponse d'erreur 500 horodatée
     */
    public static ReponseErreur internalError() {
        return new ReponseErreur(
                500,
                "INTERNAL_ERROR",
                "Une erreur inattendue s'est produite",
                Instant.now()
        );
    }
}
