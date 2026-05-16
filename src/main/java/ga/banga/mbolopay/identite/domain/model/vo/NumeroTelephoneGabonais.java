package ga.banga.mbolopay.identite.domain.model.vo;

import ga.banga.mbolopay.identite.domain.exception.NumeroTelephoneInvalideException;
import org.jmolecules.ddd.annotation.ValueObject;
import org.jspecify.annotations.NonNull;

/**
 * Numéro de téléphone gabonais valide (Moov ou Airtel).
 * Format accepté : +241XXXXXXXX ou 06/07XXXXXXX.
 *
 * @author BANGA Romaric
 */
@ValueObject
public record NumeroTelephoneGabonais(@NonNull String valeur) {

    private static final String REGEX_GABON = "^(\\+241|0)(6[0-9]|7[0-9])[0-9]{6}$";

    public NumeroTelephoneGabonais {
        if (valeur == null || valeur.isBlank()) {
            throw new NumeroTelephoneInvalideException("Le numéro de téléphone ne peut pas être vide");
        }

        if (!valeur.matches(REGEX_GABON)) {
            throw new NumeroTelephoneInvalideException(
                    "Numéro invalide pour le Gabon. Format attendu: +241XXXXXXXX ou 06/07XXXXXXX"
            );
        }
    }

    /**
     * Normalise le numéro au format international
     */
    public String versFormatInternational() {
        if (valeur.startsWith("+241")) {
            return valeur;
        }
        // Convertit 06XXXXXXX en +2416XXXXXXX
        return "+241" + valeur.substring(1);
    }
}