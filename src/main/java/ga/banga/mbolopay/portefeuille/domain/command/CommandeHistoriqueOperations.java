package ga.banga.mbolopay.portefeuille.domain.command;

import ga.banga.mbolopay.portefeuille.domain.model.RequetePagination;
import org.jspecify.annotations.NonNull;

/**
 * Commande de consultation paginée de l'historique des opérations d'un portefeuille.
 *
 * @param portefeuilleId identifiant du portefeuille concerné (UUID textuel)
 * @param pagination     bornes de pagination (page et taille)
 * @author BANGA Romaric
 */
public record CommandeHistoriqueOperations(
        @NonNull String portefeuilleId,
        @NonNull RequetePagination pagination
) {}
