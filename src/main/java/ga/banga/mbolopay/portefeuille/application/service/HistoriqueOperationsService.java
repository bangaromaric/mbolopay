package ga.banga.mbolopay.portefeuille.application.service;

import ga.banga.mbolopay.portefeuille.domain.command.CommandeHistoriqueOperations;
import ga.banga.mbolopay.portefeuille.domain.exception.PortefeuilleIntrouvableException;
import ga.banga.mbolopay.portefeuille.domain.model.PageOperations;
import ga.banga.mbolopay.portefeuille.domain.model.PortefeuilleId;
import ga.banga.mbolopay.portefeuille.domain.port.in.HistoriqueOperationsUseCase;
import ga.banga.mbolopay.portefeuille.domain.port.out.DepotOperations;
import ga.banga.mbolopay.portefeuille.domain.port.out.DepotPortefeuille;

/**
 * Implémentation du cas d'usage de consultation paginée de l'historique des opérations.
 *
 * <p>POJO pur sans dépendance framework. La gestion transactionnelle (lecture seule) est
 * assurée par un décorateur situé dans la couche infrastructure (secondary/transaction).
 *
 * @author BANGA Romaric
 */
public class HistoriqueOperationsService implements HistoriqueOperationsUseCase {

    private final DepotPortefeuille depotPortefeuille;
    private final DepotOperations depotOperations;

    /**
     * Construit le service avec les ports de persistance.
     *
     * @param depotPortefeuille port d'accès aux portefeuilles (pour vérifier l'existence)
     * @param depotOperations   port d'accès à l'historique des opérations
     */
    public HistoriqueOperationsService(
            DepotPortefeuille depotPortefeuille,
            DepotOperations depotOperations
    ) {
        this.depotPortefeuille = depotPortefeuille;
        this.depotOperations = depotOperations;
    }

    @Override
    public PageOperations executer(CommandeHistoriqueOperations commande) {
        PortefeuilleId id = PortefeuilleId.depuis(commande.portefeuilleId());

        // Garantit qu'on ne renvoie pas une liste vide silencieuse pour un portefeuille
        // qui n'existe pas — c'est une erreur métier, on lève 404.
        if (depotPortefeuille.trouverParId(id).isEmpty()) {
            throw new PortefeuilleIntrouvableException(id.valeur().toString());
        }

        return depotOperations.trouverParPortefeuille(id, commande.pagination());
    }
}
