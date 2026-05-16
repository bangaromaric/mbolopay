package ga.banga.mbolopay.identite.infrastructure.secondary.transaction;

import ga.banga.mbolopay.identite.application.service.CreerAbonneService;
import ga.banga.mbolopay.identite.domain.command.CommandeCreerAbonne;
import ga.banga.mbolopay.identite.domain.model.Abonne;
import ga.banga.mbolopay.identite.domain.port.in.CreerAbonneUseCase;
import ga.banga.mbolopay.identite.domain.port.out.DepotAbonne;
import ga.banga.mbolopay.identite.domain.port.out.PublieurEvenements;
import ga.banga.mbolopay.identite.domain.service.ServiceValidationAbonne;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Adaptateur secondaire : décore le service d'application POJO
 * {@link CreerAbonneService} avec la gestion transactionnelle Spring.
 *
 * <p>L'application reste 100 % framework-free : seul ce décorateur infrastructure
 * possède des annotations Spring. C'est le seul bean implémentant {@link CreerAbonneUseCase}.
 *
 * @author BANGA Romaric
 */
@Component
class CreerAbonneServiceTransactionnel implements CreerAbonneUseCase {

    private final CreerAbonneUseCase delegate;

    CreerAbonneServiceTransactionnel(
            DepotAbonne depotAbonne,
            ServiceValidationAbonne serviceValidation,
            PublieurEvenements evenements
    ) {
        this.delegate = new CreerAbonneService(depotAbonne, serviceValidation, evenements);
    }

    @Override
    @Transactional
    public Abonne executer(CommandeCreerAbonne commande) {
        return delegate.executer(commande);
    }
}
