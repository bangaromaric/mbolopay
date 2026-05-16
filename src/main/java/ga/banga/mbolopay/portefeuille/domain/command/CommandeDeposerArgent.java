package ga.banga.mbolopay.portefeuille.domain.command;

import ga.banga.mbolopay.portefeuille.domain.model.vo.Argent;
import org.jspecify.annotations.NonNull;

/**
 * Commande pour déposer de l'argent dans un portefeuille.
 *
 * @param portefeuilleId identifiant du portefeuille destinataire (au format UUID textuel)
 * @param montant        montant à déposer (doit être positif, validé par l'agrégat)
 * @author BANGA Romaric
 */
public record CommandeDeposerArgent(
        @NonNull String portefeuilleId,
        @NonNull Argent montant
) {}
