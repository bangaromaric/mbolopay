package ga.banga.mbolopay.portefeuille.domain.port.in;

import ga.banga.mbolopay.portefeuille.domain.model.AbonneIdReference;
import ga.banga.mbolopay.portefeuille.domain.model.Portefeuille;

/**
 * Port primaire : récupérer le portefeuille d'un abonné.
 *
 * @author BANGA Romaric
 */
public interface RecupererPortefeuilleParAbonneUseCase {

    /**
     * Récupère le portefeuille appartenant à l'abonné référencé.
     *
     * @param abonneId référence valuée de l'abonné
     * @return le portefeuille de l'abonné
     * @throws ga.banga.mbolopay.portefeuille.domain.exception.PortefeuilleIntrouvableException
     *         si aucun portefeuille n'existe pour cet abonné
     */
    Portefeuille executer(AbonneIdReference abonneId);
}
