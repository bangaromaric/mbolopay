package ga.banga.mbolopay.portefeuille.domain.port.in;

import ga.banga.mbolopay.portefeuille.domain.command.CommandeDeposerArgent;
import ga.banga.mbolopay.portefeuille.domain.model.Portefeuille;
import org.jspecify.annotations.NonNull;

/**
 * Port primaire : cas d'usage de dépôt d'argent dans un portefeuille.
 *
 * @author BANGA Romaric
 */
public interface DeposerArgentUseCase {

    /**
     * Dépose un montant sur le portefeuille désigné par la commande.
     *
     * @param commande contient l'identifiant du portefeuille et le montant à déposer
     * @return le portefeuille après crédit, avec son nouveau solde
     * @throws ga.banga.mbolopay.portefeuille.domain.exception.PortefeuilleIntrouvableException
     *         si le portefeuille n'existe pas
     * @throws ga.banga.mbolopay.portefeuille.domain.exception.MontantInvalideException
     *         si le montant est négatif
     */
    @NonNull Portefeuille executer(@NonNull CommandeDeposerArgent commande);
}
