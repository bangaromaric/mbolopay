package ga.banga.mbolopay.portefeuille.application.service;

import ga.banga.mbolopay.portefeuille.domain.model.AbonneIdReference;
import ga.banga.mbolopay.portefeuille.domain.model.Portefeuille;
import ga.banga.mbolopay.portefeuille.domain.port.in.CreerPortefeuilleUseCase;
import ga.banga.mbolopay.portefeuille.domain.port.out.DepotPortefeuille;

/**
 * Implémentation du cas d'usage : créer un portefeuille pour un abonné donné.
 *
 * <p>POJO pur sans dépendance framework. Séquence canonique : construction de l'agrégat via
 * la fabrique du domaine ({@link Portefeuille#creerVide(String)}) puis persistance via le port
 * {@link DepotPortefeuille}. Toute règle métier reste du côté de l'agrégat.
 *
 * @author BANGA Romaric
 */
public class CreerPortefeuilleService implements CreerPortefeuilleUseCase {

    private final DepotPortefeuille depotPortefeuille;

    /**
     * Construit le service avec le dépôt de portefeuilles.
     *
     * @param depotPortefeuille port de persistance des portefeuilles
     */
    public CreerPortefeuilleService(DepotPortefeuille depotPortefeuille) {
        this.depotPortefeuille = depotPortefeuille;
    }

    @Override
    public Portefeuille executer(AbonneIdReference abonneId) {
        Portefeuille nouveau = Portefeuille.creerVide(abonneId);
        return depotPortefeuille.sauvegarder(nouveau);
    }
}
