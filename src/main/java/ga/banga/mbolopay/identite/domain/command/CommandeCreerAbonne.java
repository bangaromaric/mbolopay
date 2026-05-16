package ga.banga.mbolopay.identite.domain.command;

import ga.banga.mbolopay.identite.domain.model.vo.NomGabonais;
import ga.banga.mbolopay.identite.domain.model.vo.NumeroTelephoneGabonais;
import org.jspecify.annotations.NonNull;

/**
 * Commande pour créer un nouvel abonné.
 *
 * @param nom             nom complet gabonais
 * @param numeroTelephone numéro de téléphone gabonais valide
 * @author BANGA Romaric
 */
public record CommandeCreerAbonne(
        @NonNull NomGabonais nom,
        @NonNull NumeroTelephoneGabonais numeroTelephone
) {}
