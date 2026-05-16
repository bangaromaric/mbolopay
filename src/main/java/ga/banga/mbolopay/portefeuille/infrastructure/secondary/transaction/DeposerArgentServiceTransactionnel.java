package ga.banga.mbolopay.portefeuille.infrastructure.secondary.transaction;

import ga.banga.mbolopay.portefeuille.application.service.DeposerArgentService;
import ga.banga.mbolopay.portefeuille.domain.command.CommandeDeposerArgent;
import ga.banga.mbolopay.portefeuille.domain.model.Portefeuille;
import ga.banga.mbolopay.portefeuille.domain.port.in.DeposerArgentUseCase;
import ga.banga.mbolopay.portefeuille.domain.port.out.DepotOperations;
import ga.banga.mbolopay.portefeuille.domain.port.out.DepotPortefeuille;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Adaptateur secondaire : décore le service d'application POJO
 * {@link DeposerArgentService} avec la gestion transactionnelle Spring.
 *
 * @author BANGA Romaric
 */
@Component
class DeposerArgentServiceTransactionnel implements DeposerArgentUseCase {

    private final DeposerArgentUseCase delegate;

    DeposerArgentServiceTransactionnel(
            DepotPortefeuille depotPortefeuille,
            DepotOperations depotOperations
    ) {
        this.delegate = new DeposerArgentService(depotPortefeuille, depotOperations);
    }

    @Override
    @Transactional
    public Portefeuille executer(CommandeDeposerArgent commande) {
        return delegate.executer(commande);
    }
}
