package ga.banga.mbolopay.portefeuille.application.service;

import ga.banga.mbolopay.portefeuille.domain.command.CommandeDeposerArgent;
import ga.banga.mbolopay.portefeuille.domain.exception.PortefeuilleIntrouvableException;
import ga.banga.mbolopay.portefeuille.domain.model.OperationPortefeuille;
import ga.banga.mbolopay.portefeuille.domain.model.Portefeuille;
import ga.banga.mbolopay.portefeuille.domain.model.PortefeuilleId;
import ga.banga.mbolopay.portefeuille.domain.port.in.DeposerArgentUseCase;
import ga.banga.mbolopay.portefeuille.domain.port.out.DepotOperations;
import ga.banga.mbolopay.portefeuille.domain.port.out.DepotPortefeuille;

/**
 * Implémentation du cas d'usage de dépôt d'argent.
 *
 * <p>POJO pur sans dépendance framework : orchestration uniquement. La gestion transactionnelle
 * est assurée par un décorateur situé dans la couche infrastructure (secondary/transaction).
 *
 * <p>Le service enregistre <b>dans la même transaction</b> la mise à jour du solde du
 * portefeuille et l'opération correspondante dans l'historique. En cas d'échec sur l'un
 * ou l'autre, le rollback global garantit la cohérence.
 *
 * @author BANGA Romaric
 */
public class DeposerArgentService implements DeposerArgentUseCase {

    private final DepotPortefeuille depotPortefeuille;
    private final DepotOperations depotOperations;

    /**
     * Construit le service avec ses ports de persistance.
     *
     * @param depotPortefeuille port de persistance des portefeuilles
     * @param depotOperations   port d'enregistrement de l'historique des opérations
     */
    public DeposerArgentService(
            DepotPortefeuille depotPortefeuille,
            DepotOperations depotOperations
    ) {
        this.depotPortefeuille = depotPortefeuille;
        this.depotOperations = depotOperations;
    }

    @Override
    public Portefeuille executer(CommandeDeposerArgent commande) {
        PortefeuilleId id = PortefeuilleId.depuis(commande.portefeuilleId());
        Portefeuille portefeuille = depotPortefeuille.trouverParId(id)
                .orElseThrow(() -> new PortefeuilleIntrouvableException(id.valeur().toString()));

        portefeuille.deposer(commande.montant());

        OperationPortefeuille operation = OperationPortefeuille.enregistrerDepot(
                portefeuille.id(),
                commande.montant(),
                portefeuille.solde()
        );
        depotOperations.enregistrer(operation);

        return depotPortefeuille.sauvegarder(portefeuille);
    }
}
