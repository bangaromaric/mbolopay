package ga.banga.mbolopay.identite.infrastructure.primary.web.dto;

import ga.banga.mbolopay.identite.domain.model.Abonne;
import org.jspecify.annotations.NonNull;

/**
 * Réponse REST exposant les données d'un abonné.
 *
 * @author BANGA Romaric
 */
public record AbonneResponse(
        @NonNull String id,
        @NonNull String prenom,
        @NonNull String nom,
        @NonNull String numeroTelephone,
        @NonNull String numeroFormatInternational,
        @NonNull String dateInscription,
        boolean actif
) {
    public static AbonneResponse depuis(Abonne abonne) {
        return new AbonneResponse(
                abonne.id().toString(),
                abonne.nom().prenom(),
                abonne.nom().nom(),
                abonne.numeroTelephone().valeur(),
                abonne.numeroTelephone().versFormatInternational(),
                abonne.dateInscription().toString(),
                abonne.estActif()
        );
    }
}
