package ga.banga.mbolopay.portefeuille.infrastructure.primary.web.advice;

import org.jspecify.annotations.NonNull;

import java.time.Instant;

/**
 * Format standard de réponse d'erreur pour le module Portefeuille.
 *
 * @param code      code HTTP
 * @param message   libellé technique court (ex. {@code "NOT_FOUND"})
 * @param details   détail lisible côté utilisateur
 * @param timestamp horodatage de l'erreur
 * @author BANGA Romaric
 */
public record ReponseErreur(int code,
                            @NonNull String message,
                            @NonNull String details,
                            @NonNull Instant timestamp) {

    /**
     * Construit une réponse HTTP 404 NOT_FOUND (ressource demandée inexistante :
     * portefeuille introuvable).
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
     * Construit une réponse HTTP 400 BAD_REQUEST (violation métier non bloquante : montant
     * négatif, solde insuffisant, identifiant invalide, etc.).
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
