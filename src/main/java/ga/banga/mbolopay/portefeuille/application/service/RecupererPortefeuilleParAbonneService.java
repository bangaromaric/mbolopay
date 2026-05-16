package ga.banga.mbolopay.portefeuille.application.service;

import ga.banga.mbolopay.portefeuille.domain.exception.PortefeuilleIntrouvableException;
import ga.banga.mbolopay.portefeuille.domain.model.AbonneIdReference;
import ga.banga.mbolopay.portefeuille.domain.model.Portefeuille;
import ga.banga.mbolopay.portefeuille.domain.port.in.RecupererPortefeuilleParAbonneUseCase;
import ga.banga.mbolopay.portefeuille.domain.port.out.DepotPortefeuille;

/**
 * Implémentation du cas d'usage : récupérer le portefeuille d'un abonné.
 *
 * <p>POJO pur sans dépendance framework. Délègue au port de sortie {@link DepotPortefeuille}.
 *
 * @author BANGA Romaric
 */
public class RecupererPortefeuilleParAbonneService implements RecupererPortefeuilleParAbonneUseCase {

    private final DepotPortefeuille depotPortefeuille;

    /**
     * Construit le service avec le dépôt de portefeuilles.
     *
     * @param depotPortefeuille port de persistance des portefeuilles
     */
    public RecupererPortefeuilleParAbonneService(DepotPortefeuille depotPortefeuille) {
        this.depotPortefeuille = depotPortefeuille;
    }

    @Override
    public Portefeuille executer(AbonneIdReference abonneId) {
        return depotPortefeuille.trouverParAbonneId(abonneId)
                .orElseThrow(() -> new PortefeuilleIntrouvableException(abonneId.valeur()));
    }
}
