package ga.banga.mbolopay.identite.domain.model;

import ga.banga.mbolopay.identite.domain.exception.IdentifiantAbonneInvalideException;
import org.jmolecules.ddd.types.Identifier;
import org.jspecify.annotations.NonNull;

import java.util.UUID;

/**
 * Identifiant fortement typé d'un {@link Abonne}.
 *
 * @author BANGA Romaric
 */
public record AbonneId(@NonNull UUID valeur) implements Identifier {

    public AbonneId {
        if (valeur == null) {
            throw new IdentifiantAbonneInvalideException("L'identifiant ne peut pas être null");
        }
    }

    /** Génère un nouvel identifiant aléatoire. */
    public static AbonneId generer() {
        return new AbonneId(UUID.randomUUID());
    }

    /**
     * Reconstitue un identifiant depuis sa représentation chaîne.
     *
     * @param uuid UUID au format texte
     * @return un {@code AbonneId} équivalent
     * @throws IdentifiantAbonneInvalideException si la chaîne n'est pas un UUID valide
     */
    public static AbonneId depuis(String uuid) {
        try {
            return new AbonneId(UUID.fromString(uuid));
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new IdentifiantAbonneInvalideException("UUID invalide : " + uuid);
        }
    }

    @Override
    public String toString() {
        return valeur.toString();
    }
}
