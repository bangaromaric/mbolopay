package ga.banga.mbolopay.portefeuille.domain.command;

import ga.banga.mbolopay.portefeuille.domain.model.vo.Argent;
import org.jspecify.annotations.NonNull;

/**
 * Commande pour retirer de l'argent depuis un portefeuille.
 *
 * @param portefeuilleId identifiant du portefeuille source (au format UUID textuel)
 * @param montant        montant à retirer (doit être positif et inférieur ou égal au solde,
 *                       validé par l'agrégat {@link ga.banga.mbolopay.portefeuille.domain.model.Portefeuille})
 * @author BANGA Romaric
 */
public record CommandeRetirerArgent(
        @NonNull String portefeuilleId,
        @NonNull Argent montant
) {}
