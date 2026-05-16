package ga.banga.mbolopay.portefeuille.domain.port.out;

import ga.banga.mbolopay.portefeuille.domain.model.OperationPortefeuille;
import ga.banga.mbolopay.portefeuille.domain.model.PageOperations;
import ga.banga.mbolopay.portefeuille.domain.model.PortefeuilleId;
import ga.banga.mbolopay.portefeuille.domain.model.RequetePagination;
import org.jspecify.annotations.NonNull;

/**
 * Port secondaire : persistance des opérations enregistrées sur les portefeuilles.
 *
 * <p>Ne dépend d'aucune API de pagination Spring : les types d'entrée / sortie
 * sont {@link RequetePagination} et {@link PageOperations}, des records du
 * domaine. Les adaptateurs (JPA, en-mémoire, etc.) sont responsables de
 * traduire dans leur propre API.
 *
 * <p>Les implémentations doivent garantir un ordre <b>chronologique
 * descendant</b> (la plus récente en premier). En cas d'opérations
 * concomitantes, un tri secondaire par identifiant assure un ordre déterministe.
 *
 * @author BANGA Romaric
 */
public interface DepotOperations {

    /**
     * Persiste une nouvelle opération.
     *
     * @param operation opération à enregistrer
     * @return l'opération persistée (identique à l'entrée pour ce port — l'identifiant
     *         étant attribué par le domaine, pas par la base)
     */
    @NonNull OperationPortefeuille enregistrer(@NonNull OperationPortefeuille operation);

    /**
     * Récupère une page d'opérations associées à un portefeuille, triée du plus
     * récent au plus ancien.
     *
     * @param portefeuilleId portefeuille dont on veut consulter l'historique
     * @param requete        bornes de pagination
     * @return la page demandée (vide si aucune opération)
     */
    @NonNull PageOperations trouverParPortefeuille(
            @NonNull PortefeuilleId portefeuilleId,
            @NonNull RequetePagination requete);
}
