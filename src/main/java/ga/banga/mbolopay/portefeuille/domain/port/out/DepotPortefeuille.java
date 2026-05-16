package ga.banga.mbolopay.portefeuille.domain.port.out;

import ga.banga.mbolopay.portefeuille.domain.model.AbonneIdReference;
import ga.banga.mbolopay.portefeuille.domain.model.Portefeuille;
import ga.banga.mbolopay.portefeuille.domain.model.PortefeuilleId;

import java.util.Optional;

/**
 * Port de sortie : contrat de persistance des portefeuilles.
 *
 * <p>Implémenté par les adaptateurs secondaires (JPA, in-memory pour les tests, etc.).
 *
 * @author BANGA Romaric
 */
public interface DepotPortefeuille {

    /**
     * Persiste un portefeuille (création ou mise à jour).
     *
     * @param portefeuille agrégat à sauvegarder
     * @return l'agrégat tel qu'il existe après persistance
     */
    Portefeuille sauvegarder(Portefeuille portefeuille);

    /**
     * Recherche un portefeuille par son identifiant.
     *
     * @param id identifiant du portefeuille
     * @return le portefeuille si trouvé, sinon {@link Optional#empty()}
     */
    Optional<Portefeuille> trouverParId(PortefeuilleId id);

    /**
     * Recherche le portefeuille associé à un abonné donné.
     *
     * @param abonneId référence valuée de l'abonné propriétaire
     * @return le portefeuille si l'abonné en possède un, sinon {@link Optional#empty()}
     */
    Optional<Portefeuille> trouverParAbonneId(AbonneIdReference abonneId);

    /**
     * Indique si un abonné possède déjà un portefeuille.
     *
     * @param abonneId référence valuée de l'abonné à tester
     * @return {@code true} si un portefeuille existe pour cet abonné
     */
    boolean existePourAbonne(AbonneIdReference abonneId);
}
