package ga.banga.mbolopay.portefeuille.infrastructure.primary.web.dto;

import ga.banga.mbolopay.portefeuille.domain.model.OperationPortefeuille;
import org.jspecify.annotations.NonNull;

/**
 * Réponse REST représentant une opération enregistrée sur un portefeuille.
 *
 * <p>Les champs {@code montant} et {@code soldeApres} exposent les valeurs brutes en FCFA
 * (long, sans décimales). Les champs {@code *Formate} fournissent la version lisible
 * « 5 000 FCFA » pour usage direct en UI.
 *
 * @author BANGA Romaric
 */
public record OperationResponse(
        @NonNull String id,
        @NonNull String portefeuilleId,
        @NonNull String type,
        long montant,
        @NonNull String montantFormate,
        long soldeApres,
        @NonNull String soldeApresFormate,
        @NonNull String dateOperation
) {

    /**
     * Construit la réponse depuis l'agrégat domaine.
     *
     * @param operation agrégat source
     * @return représentation DTO immuable
     */
    public static OperationResponse depuis(OperationPortefeuille operation) {
        return new OperationResponse(
                operation.id().toString(),
                operation.portefeuilleId().toString(),
                operation.type().name(),
                operation.montant().montant().longValueExact(),
                operation.montant().toString(),
                operation.soldeApres().montant().longValueExact(),
                operation.soldeApres().toString(),
                operation.dateOperation().toString()
        );
    }
}
