package ga.banga.mbolopay.portefeuille.infrastructure.primary.web.dto;

import ga.banga.mbolopay.portefeuille.domain.model.PageOperations;
import org.jspecify.annotations.NonNull;

import java.util.List;

/**
 * Réponse REST paginée représentant une page d'opérations.
 *
 * @author BANGA Romaric
 */
public record PageOperationsResponse(
        @NonNull List<OperationResponse> contenu,
        int pageActuelle,
        int taillePage,
        long totalElements,
        int totalPages
) {

    /**
     * Construit la réponse depuis la page domaine.
     *
     * @param page page source
     * @return représentation DTO immuable
     */
    public static PageOperationsResponse depuis(PageOperations page) {
        List<OperationResponse> contenu = page.contenu().stream()
                .map(OperationResponse::depuis)
                .toList();
        return new PageOperationsResponse(
                contenu,
                page.pageActuelle(),
                page.taillePage(),
                page.totalElements(),
                page.totalPages()
        );
    }
}
