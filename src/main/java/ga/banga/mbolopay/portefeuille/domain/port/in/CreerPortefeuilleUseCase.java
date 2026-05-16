package ga.banga.mbolopay.portefeuille.domain.port.in;

import ga.banga.mbolopay.portefeuille.domain.model.AbonneIdReference;
import ga.banga.mbolopay.portefeuille.domain.model.Portefeuille;
import org.jspecify.annotations.NonNull;

/**
 * Port primaire : créer un portefeuille pour un abonné.
 *
 * <p>Typiquement déclenché en réaction à l'événement {@code EvenementAbonneCree} du module
 * Identité, via l'écouteur primaire {@code EcouteurEvenementAbonne}.
 *
 * @author BANGA Romaric
 */
public interface CreerPortefeuilleUseCase {

    /**
     * Crée un nouveau portefeuille vide pour l'abonné référencé.
     *
     * @param abonneId référence valuée de l'abonné propriétaire
     * @return le portefeuille créé, persisté et prêt à recevoir des opérations
     */
    @NonNull Portefeuille executer(@NonNull AbonneIdReference abonneId);
}
