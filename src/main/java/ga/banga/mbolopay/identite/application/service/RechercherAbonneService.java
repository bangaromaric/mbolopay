package ga.banga.mbolopay.identite.application.service;

import ga.banga.mbolopay.identite.domain.model.Abonne;
import ga.banga.mbolopay.identite.domain.model.AbonneId;
import ga.banga.mbolopay.identite.domain.port.in.RechercherAbonneUseCase;
import ga.banga.mbolopay.identite.domain.port.out.DepotAbonne;

import java.util.Optional;

/**
 * Implémentation du cas d'usage de recherche d'un abonné.
 * POJO pur sans dépendance framework — délègue au port de sortie {@link DepotAbonne}.
 *
 * @author BANGA Romaric
 */
public class RechercherAbonneService implements RechercherAbonneUseCase {

    private final DepotAbonne depotAbonne;

    /**
     * Construit le service avec le dépôt d'abonnés.
     *
     * @param depotAbonne port de persistance des abonnés
     */
    public RechercherAbonneService(DepotAbonne depotAbonne) {
        this.depotAbonne = depotAbonne;
    }

    @Override
    public Optional<Abonne> executer(AbonneId id) {
        return depotAbonne.trouverParId(id);
    }
}
