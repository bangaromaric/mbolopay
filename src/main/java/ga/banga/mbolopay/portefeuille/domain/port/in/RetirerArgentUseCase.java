package ga.banga.mbolopay.portefeuille.domain.port.in;

import ga.banga.mbolopay.portefeuille.domain.command.CommandeRetirerArgent;
import ga.banga.mbolopay.portefeuille.domain.model.Portefeuille;
import org.jspecify.annotations.NonNull;

/**
 * Port primaire : cas d'usage de retrait d'argent depuis un portefeuille.
 *
 * @author BANGA Romaric
 */
public interface RetirerArgentUseCase {

    /**
     * Débite le portefeuille désigné par la commande.
     *
     * @param commande contient l'identifiant du portefeuille et le montant à retirer
     * @return le portefeuille après débit, avec son nouveau solde
     * @throws ga.banga.mbolopay.portefeuille.domain.exception.PortefeuilleIntrouvableException
     *         si le portefeuille n'existe pas
     * @throws ga.banga.mbolopay.portefeuille.domain.exception.MontantInvalideException
     *         si le montant est négatif
     * @throws ga.banga.mbolopay.portefeuille.domain.exception.SoldeInsuffisantException
     *         si le solde du portefeuille est inférieur au montant demandé
     * @throws ga.banga.mbolopay.portefeuille.domain.exception.IdentifiantPortefeuilleInvalideException
     *         si l'identifiant n'est pas un UUID valide
     */
    @NonNull Portefeuille executer(@NonNull CommandeRetirerArgent commande);
}
