package ga.banga.mbolopay.identite.infrastructure.secondary.transaction;

import ga.banga.mbolopay.identite.application.service.RechercherAbonneService;
import ga.banga.mbolopay.identite.domain.model.Abonne;
import ga.banga.mbolopay.identite.domain.model.AbonneId;
import ga.banga.mbolopay.identite.domain.port.in.RechercherAbonneUseCase;
import ga.banga.mbolopay.identite.domain.port.out.DepotAbonne;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Adaptateur secondaire : décore le service d'application POJO
 * {@link RechercherAbonneService} avec une transaction Spring en lecture seule.
 *
 * @author BANGA Romaric
 */
@Component
class RechercherAbonneServiceTransactionnel implements RechercherAbonneUseCase {

    private final RechercherAbonneUseCase delegate;

    RechercherAbonneServiceTransactionnel(DepotAbonne depotAbonne) {
        this.delegate = new RechercherAbonneService(depotAbonne);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Abonne> executer(AbonneId id) {
        return delegate.executer(id);
    }
}
