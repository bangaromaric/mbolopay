package ga.banga.mbolopay.identite.domain.port.in;

import ga.banga.mbolopay.identite.domain.command.CommandeCreerAbonne;
import ga.banga.mbolopay.identite.domain.model.Abonne;
import org.jspecify.annotations.NonNull;

/**
 * Port primaire : cas d'usage de création d'un abonné.
 *
 * @author BANGA Romaric
 */
public interface CreerAbonneUseCase {

    /**
     * Crée un nouvel abonné dans le système
     *
     * @param commande Données de création
     * @return L'abonné créé
     * @throws ga.banga.mbolopay.identite.domain.exception.NumeroDejaUtiliseException si le numéro existe déjà
     * @throws ga.banga.mbolopay.identite.domain.exception.NumeroNonAutoriseException si le numéro est sur liste noire
     */
    @NonNull Abonne executer(@NonNull CommandeCreerAbonne commande);
}
