package ga.banga.mbolopay.portefeuille.application.service;

import ga.banga.mbolopay.portefeuille.domain.command.CommandeRetirerArgent;
import ga.banga.mbolopay.portefeuille.domain.exception.PortefeuilleIntrouvableException;
import ga.banga.mbolopay.portefeuille.domain.model.OperationPortefeuille;
import ga.banga.mbolopay.portefeuille.domain.model.Portefeuille;
import ga.banga.mbolopay.portefeuille.domain.model.PortefeuilleId;
import ga.banga.mbolopay.portefeuille.domain.port.in.RetirerArgentUseCase;
import ga.banga.mbolopay.portefeuille.domain.port.out.DepotOperations;
import ga.banga.mbolopay.portefeuille.domain.port.out.DepotPortefeuille;

/**
 * Implémentation du cas d'usage de retrait d'argent.
 *
 * <p>POJO pur sans dépendance framework : orchestration uniquement. La gestion transactionnelle
 * est assurée par un décorateur situé dans la couche infrastructure (secondary/transaction).
 *
 * <p>L'agrégat {@link Portefeuille} valide lui-même les invariants métier
 * (montant négatif → {@code MontantInvalideException}, solde insuffisant →
 * {@code SoldeInsuffisantException}) avant que l'opération soit enregistrée dans l'historique.
 *
 * @author BANGA Romaric
 */
public class RetirerArgentService implements RetirerArgentUseCase {

    private final DepotPortefeuille depotPortefeuille;
    private final DepotOperations depotOperations;

    /**
     * Construit le service avec ses ports de persistance.
     *
     * @param depotPortefeuille port de persistance des portefeuilles
     * @param depotOperations   port d'enregistrement de l'historique des opérations
     */
    public RetirerArgentService(
            DepotPortefeuille depotPortefeuille,
            DepotOperations depotOperations
    ) {
        this.depotPortefeuille = depotPortefeuille;
        this.depotOperations = depotOperations;
    }

    @Override
    public Portefeuille executer(CommandeRetirerArgent commande) {
        PortefeuilleId id = PortefeuilleId.depuis(commande.portefeuilleId());
        Portefeuille portefeuille = depotPortefeuille.trouverParId(id)
                .orElseThrow(() -> new PortefeuilleIntrouvableException(id.valeur().toString()));

        portefeuille.retirer(commande.montant());

        OperationPortefeuille operation = OperationPortefeuille.enregistrerRetrait(
                portefeuille.id(),
                commande.montant(),
                portefeuille.solde()
        );
        depotOperations.enregistrer(operation);

        return depotPortefeuille.sauvegarder(portefeuille);
    }
}
