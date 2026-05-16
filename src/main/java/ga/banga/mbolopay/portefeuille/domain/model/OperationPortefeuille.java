package ga.banga.mbolopay.portefeuille.domain.model;

import ga.banga.mbolopay.portefeuille.domain.exception.MontantInvalideException;
import ga.banga.mbolopay.portefeuille.domain.model.vo.Argent;
import org.jmolecules.ddd.annotation.AggregateRoot;
import org.jmolecules.ddd.annotation.Identity;
import org.jspecify.annotations.NonNull;

import java.time.Instant;

/**
 * Agrégat enregistrant une opération (dépôt ou retrait) effectuée sur un portefeuille.
 *
 * <p>Chaque opération réussie publie un événement métier dans l'historique :
 * elle conserve le montant impliqué, le solde résultant et la date pour permettre
 * une consultation chronologique et auditive du compte.
 *
 * <p>Invariants validés à la construction :
 * <ul>
 *   <li>le montant doit être strictement positif (un dépôt/retrait de 0 ou négatif n'a pas de sens) ;</li>
 *   <li>le solde résultant doit être positif ou nul (un retrait ne peut pas laisser un solde négatif).</li>
 * </ul>
 *
 * @param id             identifiant de l'opération
 * @param portefeuilleId portefeuille concerné
 * @param type           {@link TypeOperation#DEPOT} ou {@link TypeOperation#RETRAIT}
 * @param montant        montant déposé ou retiré (strictement positif)
 * @param soldeApres     solde du portefeuille après application de l'opération
 * @param dateOperation  horodatage de l'opération
 * @author BANGA Romaric
 */
@AggregateRoot
public record OperationPortefeuille(
        @Identity @NonNull OperationId id,
        @NonNull PortefeuilleId portefeuilleId,
        @NonNull TypeOperation type,
        @NonNull Argent montant,
        @NonNull Argent soldeApres,
        @NonNull Instant dateOperation
) {

    public OperationPortefeuille {
        if (montant.estNegatif() || !montant.estPositif()) {
            throw new MontantInvalideException(
                    "Le montant de l'opération doit être strictement positif");
        }
        if (soldeApres.estNegatif()) {
            throw new MontantInvalideException(
                    "Le solde résultant ne peut pas être négatif");
        }
    }

    /**
     * Fabrique une nouvelle opération de dépôt horodatée à l'instant courant.
     *
     * @param portefeuilleId portefeuille crédité
     * @param montant        montant déposé
     * @param soldeApres     solde après crédit
     * @return l'opération à enregistrer dans l'historique
     */
    public static OperationPortefeuille enregistrerDepot(
            @NonNull PortefeuilleId portefeuilleId,
            @NonNull Argent montant,
            @NonNull Argent soldeApres
    ) {
        return new OperationPortefeuille(
                OperationId.generer(),
                portefeuilleId,
                TypeOperation.DEPOT,
                montant,
                soldeApres,
                Instant.now()
        );
    }

    /**
     * Fabrique une nouvelle opération de retrait horodatée à l'instant courant.
     *
     * @param portefeuilleId portefeuille débité
     * @param montant        montant retiré
     * @param soldeApres     solde après débit
     * @return l'opération à enregistrer dans l'historique
     */
    public static OperationPortefeuille enregistrerRetrait(
            @NonNull PortefeuilleId portefeuilleId,
            @NonNull Argent montant,
            @NonNull Argent soldeApres
    ) {
        return new OperationPortefeuille(
                OperationId.generer(),
                portefeuilleId,
                TypeOperation.RETRAIT,
                montant,
                soldeApres,
                Instant.now()
        );
    }
}
