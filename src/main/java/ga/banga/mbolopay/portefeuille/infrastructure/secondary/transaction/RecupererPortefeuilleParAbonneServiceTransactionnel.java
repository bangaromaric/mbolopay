package ga.banga.mbolopay.portefeuille.infrastructure.secondary.transaction;

import ga.banga.mbolopay.portefeuille.application.service.RecupererPortefeuilleParAbonneService;
import ga.banga.mbolopay.portefeuille.domain.model.AbonneIdReference;
import ga.banga.mbolopay.portefeuille.domain.model.Portefeuille;
import ga.banga.mbolopay.portefeuille.domain.port.in.RecupererPortefeuilleParAbonneUseCase;
import ga.banga.mbolopay.portefeuille.domain.port.out.DepotPortefeuille;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Adaptateur secondaire : décore le service d'application POJO
 * {@link RecupererPortefeuilleParAbonneService} avec une transaction Spring en lecture seule.
 *
 * @author BANGA Romaric
 */
@Component
class RecupererPortefeuilleParAbonneServiceTransactionnel implements RecupererPortefeuilleParAbonneUseCase {

    private final RecupererPortefeuilleParAbonneUseCase delegate;

    RecupererPortefeuilleParAbonneServiceTransactionnel(DepotPortefeuille depotPortefeuille) {
        this.delegate = new RecupererPortefeuilleParAbonneService(depotPortefeuille);
    }

    @Override
    @Transactional(readOnly = true)
    public Portefeuille executer(AbonneIdReference abonneId) {
        return delegate.executer(abonneId);
    }
}
