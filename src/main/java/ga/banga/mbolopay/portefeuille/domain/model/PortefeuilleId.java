package ga.banga.mbolopay.portefeuille.domain.model;

import ga.banga.mbolopay.portefeuille.domain.exception.IdentifiantPortefeuilleInvalideException;
import org.jmolecules.ddd.types.Identifier;
import org.jspecify.annotations.NonNull;

import java.util.UUID;

/**
 * Identifiant unique d'un portefeuille.
 *
 * @author BANGA Romaric
 */
public record PortefeuilleId(@NonNull UUID valeur) implements Identifier {

    public PortefeuilleId {
        if (valeur == null) {
            throw new IdentifiantPortefeuilleInvalideException(
                    "L'identifiant du portefeuille ne peut pas être null");
        }
    }

    /**
     * Génère un nouvel identifiant unique.
     */
    public static PortefeuilleId generer() {
        return new PortefeuilleId(UUID.randomUUID());
    }

    /**
     * Reconstitue un identifiant depuis une chaîne UUID.
     *
     * @param uuid UUID au format texte
     * @return l'identifiant correspondant
     * @throws IdentifiantPortefeuilleInvalideException si la chaîne est vide ou mal formée
     */
    public static PortefeuilleId depuis(@NonNull String uuid) {
        if (uuid == null || uuid.isBlank()) {
            throw new IdentifiantPortefeuilleInvalideException("L'UUID ne peut pas être vide");
        }
        try {
            return new PortefeuilleId(UUID.fromString(uuid));
        } catch (IllegalArgumentException e) {
            throw new IdentifiantPortefeuilleInvalideException("UUID invalide : " + uuid);
        }
    }

    @Override
    public String toString() {
        return valeur.toString();
    }
}