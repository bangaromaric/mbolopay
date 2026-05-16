package ga.banga.mbolopay.portefeuille.infrastructure.secondary.transaction;

import ga.banga.mbolopay.portefeuille.application.service.RetirerArgentService;
import ga.banga.mbolopay.portefeuille.domain.command.CommandeRetirerArgent;
import ga.banga.mbolopay.portefeuille.domain.model.Portefeuille;
import ga.banga.mbolopay.portefeuille.domain.port.in.RetirerArgentUseCase;
import ga.banga.mbolopay.portefeuille.domain.port.out.DepotOperations;
import ga.banga.mbolopay.portefeuille.domain.port.out.DepotPortefeuille;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Adaptateur secondaire : décore le service d'application POJO
 * {@link RetirerArgentService} avec la gestion transactionnelle Spring.
 *
 * @author BANGA Romaric
 */
@Component
class RetirerArgentServiceTransactionnel implements RetirerArgentUseCase {

    private final RetirerArgentUseCase delegate;

    RetirerArgentServiceTransactionnel(
            DepotPortefeuille depotPortefeuille,
            DepotOperations depotOperations
    ) {
        this.delegate = new RetirerArgentService(depotPortefeuille, depotOperations);
    }

    @Override
    @Transactional
    public Portefeuille executer(CommandeRetirerArgent commande) {
        return delegate.executer(commande);
    }
}
