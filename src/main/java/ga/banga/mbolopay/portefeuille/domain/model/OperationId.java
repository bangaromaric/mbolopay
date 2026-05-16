package ga.banga.mbolopay.portefeuille.domain.model;

import ga.banga.mbolopay.portefeuille.domain.exception.IdentifiantPortefeuilleInvalideException;
import org.jmolecules.ddd.types.Identifier;
import org.jspecify.annotations.NonNull;

import java.util.UUID;

/**
 * Identifiant unique d'une opération enregistrée dans l'historique d'un portefeuille.
 *
 * @author BANGA Romaric
 */
public record OperationId(@NonNull UUID valeur) implements Identifier {

    public OperationId {
        if (valeur == null) {
            throw new IdentifiantPortefeuilleInvalideException(
                    "L'identifiant de l'opération ne peut pas être null");
        }
    }

    /** Génère un nouvel identifiant unique. */
    public static OperationId generer() {
        return new OperationId(UUID.randomUUID());
    }

    /**
     * Reconstitue un identifiant depuis une chaîne UUID.
     *
     * @param uuid UUID au format texte
     * @return l'identifiant correspondant
     * @throws IdentifiantPortefeuilleInvalideException si la chaîne est vide ou mal formée
     */
    public static OperationId depuis(@NonNull String uuid) {
        if (uuid == null || uuid.isBlank()) {
            throw new IdentifiantPortefeuilleInvalideException("L'UUID ne peut pas être vide");
        }
        try {
            return new OperationId(UUID.fromString(uuid));
        } catch (IllegalArgumentException e) {
            throw new IdentifiantPortefeuilleInvalideException("UUID invalide : " + uuid);
        }
    }

    @Override
    public String toString() {
        return valeur.toString();
    }
}
