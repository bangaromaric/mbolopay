package ga.banga.mbolopay.identite.infrastructure.primary.web.dto;

import org.jspecify.annotations.NonNull;

/**
 * Requête REST de création d'un abonné.
 *
 * @param prenom          prénom de l'abonné
 * @param nom             nom de l'abonné
 * @param numeroTelephone numéro de téléphone au format gabonais (+241XXXXXXXX ou 0[67]XXXXXXX)
 * @author BANGA Romaric
 */
public record CreerAbonneRequest(
        @NonNull String prenom,
        @NonNull String nom,
        @NonNull String numeroTelephone
) {}
