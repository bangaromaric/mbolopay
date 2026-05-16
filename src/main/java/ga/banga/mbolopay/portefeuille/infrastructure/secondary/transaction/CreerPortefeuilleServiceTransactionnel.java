package ga.banga.mbolopay.portefeuille.infrastructure.secondary.transaction;

import ga.banga.mbolopay.portefeuille.application.service.CreerPortefeuilleService;
import ga.banga.mbolopay.portefeuille.domain.model.AbonneIdReference;
import ga.banga.mbolopay.portefeuille.domain.model.Portefeuille;
import ga.banga.mbolopay.portefeuille.domain.port.in.CreerPortefeuilleUseCase;
import ga.banga.mbolopay.portefeuille.domain.port.out.DepotPortefeuille;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Adaptateur secondaire : décore le service d'application POJO
 * {@link CreerPortefeuilleService} avec la gestion transactionnelle Spring.
 *
 * @author BANGA Romaric
 */
@Component
class CreerPortefeuilleServiceTransactionnel implements CreerPortefeuilleUseCase {

    private final CreerPortefeuilleUseCase delegate;

    CreerPortefeuilleServiceTransactionnel(DepotPortefeuille depotPortefeuille) {
        this.delegate = new CreerPortefeuilleService(depotPortefeuille);
    }

    @Override
    @Transactional
    public Portefeuille executer(AbonneIdReference abonneId) {
        return delegate.executer(abonneId);
    }
}
