package ga.banga.mbolopay.portefeuille.domain.port.in;

import ga.banga.mbolopay.portefeuille.domain.command.CommandeHistoriqueOperations;
import ga.banga.mbolopay.portefeuille.domain.model.PageOperations;
import org.jspecify.annotations.NonNull;

/**
 * Port primaire : cas d'usage de consultation paginée de l'historique des opérations
 * d'un portefeuille.
 *
 * @author BANGA Romaric
 */
public interface HistoriqueOperationsUseCase {

    /**
     * Retourne la page d'opérations associées au portefeuille désigné par la commande,
     * triée du plus récent au plus ancien.
     *
     * @param commande contient l'identifiant du portefeuille et les bornes de pagination
     * @return la page d'opérations correspondante (jamais {@code null})
     * @throws ga.banga.mbolopay.portefeuille.domain.exception.PortefeuilleIntrouvableException
     *         si le portefeuille n'existe pas
     * @throws ga.banga.mbolopay.portefeuille.domain.exception.IdentifiantPortefeuilleInvalideException
     *         si l'identifiant n'est pas un UUID valide
     */
    @NonNull PageOperations executer(@NonNull CommandeHistoriqueOperations commande);
}
