package ga.banga.mbolopay.portefeuille.domain.model;

import org.jspecify.annotations.NonNull;

import java.util.List;

/**
 * Page de résultats du domaine, indépendante de Spring Data {@code Page}.
 *
 * <p>Permet aux adaptateurs primaires (REST) et aux services applicatifs de
 * manipuler une pagination sans importer {@code org.springframework.data} — ce
 * qui violerait l'isolation du domaine vérifiée par
 * {@link ga.banga.mbolopay.HexagonalArchitectureTest}.
 *
 * @param contenu       liste des éléments de la page courante
 * @param pageActuelle  numéro de la page courante (0-indexed)
 * @param taillePage    nombre maximal d'éléments par page
 * @param totalElements nombre total d'éléments toutes pages confondues
 * @param totalPages    nombre total de pages
 * @author BANGA Romaric
 */
public record PageOperations(
        @NonNull List<OperationPortefeuille> contenu,
        int pageActuelle,
        int taillePage,
        long totalElements,
        int totalPages
) {

    public PageOperations {
        contenu = List.copyOf(contenu);
    }

    /** Construit une page vide (utile pour requêtes sans résultats). */
    public static PageOperations vide(RequetePagination requete) {
        return new PageOperations(List.of(), requete.page(), requete.taille(), 0L, 0);
    }
}
