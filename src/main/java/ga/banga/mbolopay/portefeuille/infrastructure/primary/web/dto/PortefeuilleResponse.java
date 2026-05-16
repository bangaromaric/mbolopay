package ga.banga.mbolopay.portefeuille.infrastructure.primary.web.dto;

import ga.banga.mbolopay.portefeuille.domain.model.Portefeuille;
import org.jspecify.annotations.NonNull;

/**
 * Réponse REST représentant un portefeuille.
 *
 * <p>Le solde est exposé en {@code long} (FCFA brut, sans décimales — cf.
 * {@link ga.banga.mbolopay.portefeuille.domain.model.vo.Argent}). Le champ {@code soldeFormate}
 * fournit la version lisible « 125 000 FCFA » pour les usages d'affichage direct.
 *
 * @author BANGA Romaric
 */
public record PortefeuilleResponse(
        @NonNull String id,
        @NonNull String abonneId,
        long solde,
        @NonNull String soldeFormate,
        @NonNull String dateCreation
) {
    /**
     * Construit la réponse depuis l'agrégat domaine.
     *
     * @param portefeuille agrégat source
     * @return représentation DTO immuable
     */
    public static PortefeuilleResponse depuis(Portefeuille portefeuille) {
        return new PortefeuilleResponse(
                portefeuille.id().toString(),
                portefeuille.abonneId().valeur(),
                portefeuille.solde().montant().longValueExact(),
                portefeuille.solde().toString(),
                portefeuille.dateCreation().toString()
        );
    }
}
