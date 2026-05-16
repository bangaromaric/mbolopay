package ga.banga.mbolopay.identite.domain.port.out;

import ga.banga.mbolopay.identite.domain.model.Abonne;
import ga.banga.mbolopay.identite.domain.model.AbonneId;
import ga.banga.mbolopay.identite.domain.model.vo.NumeroTelephoneGabonais;

import java.util.Optional;

/**
 * Port de sortie : contrat de persistance des abonnés.
 *
 * <p>Implémenté par les adaptateurs secondaires (JPA, in-memory pour les tests, etc.).
 *
 * @author BANGA Romaric
 */
public interface DepotAbonne {

    /**
     * Persiste un abonné (création ou mise à jour).
     *
     * @param abonne agrégat à sauvegarder
     * @return l'agrégat tel qu'il existe après persistance
     */
    Abonne sauvegarder(Abonne abonne);

    /**
     * Recherche un abonné par son identifiant.
     *
     * @param id identifiant de l'abonné
     * @return l'abonné si trouvé, sinon {@link Optional#empty()}
     */
    Optional<Abonne> trouverParId(AbonneId id);

    /**
     * Recherche un abonné par son numéro de téléphone.
     *
     * @param numero numéro de téléphone gabonais
     * @return l'abonné si trouvé, sinon {@link Optional#empty()}
     */
    Optional<Abonne> trouverParNumero(NumeroTelephoneGabonais numero);

    /**
     * Indique si un abonné possède déjà ce numéro de téléphone.
     *
     * @param numero numéro à tester
     * @return {@code true} si un abonné l'utilise déjà
     */
    boolean existeParNumero(NumeroTelephoneGabonais numero);
}
