package ga.banga.mbolopay.identite.domain.port.in;

import ga.banga.mbolopay.identite.domain.model.Abonne;
import ga.banga.mbolopay.identite.domain.model.AbonneId;

import java.util.Optional;

/**
 * Port primaire : cas d'usage de recherche d'un abonné par son identifiant.
 *
 * @author BANGA Romaric
 */
public interface RechercherAbonneUseCase {

    /**
     * Recherche un abonné par son identifiant unique.
     *
     * @param id identifiant de l'abonné
     * @return l'abonné trouvé, ou {@link Optional#empty()} s'il n'existe pas
     */
    Optional<Abonne> executer(AbonneId id);
}
