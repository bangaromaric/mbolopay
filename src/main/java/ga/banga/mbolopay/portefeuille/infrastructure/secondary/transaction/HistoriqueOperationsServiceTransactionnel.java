package ga.banga.mbolopay.portefeuille.infrastructure.secondary.transaction;

import ga.banga.mbolopay.portefeuille.application.service.HistoriqueOperationsService;
import ga.banga.mbolopay.portefeuille.domain.command.CommandeHistoriqueOperations;
import ga.banga.mbolopay.portefeuille.domain.model.PageOperations;
import ga.banga.mbolopay.portefeuille.domain.port.in.HistoriqueOperationsUseCase;
import ga.banga.mbolopay.portefeuille.domain.port.out.DepotOperations;
import ga.banga.mbolopay.portefeuille.domain.port.out.DepotPortefeuille;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Adaptateur secondaire : décore le service d'application POJO
 * {@link HistoriqueOperationsService} avec une transaction en lecture seule.
 *
 * @author BANGA Romaric
 */
@Component
class HistoriqueOperationsServiceTransactionnel implements HistoriqueOperationsUseCase {

    private final HistoriqueOperationsUseCase delegate;

    HistoriqueOperationsServiceTransactionnel(
            DepotPortefeuille depotPortefeuille,
            DepotOperations depotOperations
    ) {
        this.delegate = new HistoriqueOperationsService(depotPortefeuille, depotOperations);
    }

    @Override
    @Transactional(readOnly = true)
    public PageOperations executer(CommandeHistoriqueOperations commande) {
        return delegate.executer(commande);
    }
}
