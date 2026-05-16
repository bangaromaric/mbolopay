package ga.banga.mbolopay.portefeuille.domain.model.vo;

import ga.banga.mbolopay.portefeuille.domain.exception.MontantInvalideException;
import org.jmolecules.ddd.annotation.ValueObject;
import org.jspecify.annotations.NonNull;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Représente une somme en Francs CFA (XAF).
 *
 * @author BANGA Romaric
 */
@ValueObject
public record Argent(@NonNull BigDecimal montant) {

    public Argent {
        if (montant == null) {
            throw new MontantInvalideException("Le montant ne peut pas être null");
        }
        // Arrondi à 0 décimales (pas de centimes en FCFA)
        montant = montant.setScale(0, RoundingMode.HALF_UP);
    }

    public static Argent zero() {
        return new Argent(BigDecimal.ZERO);
    }

    public static Argent de(long montant) {
        return new Argent(BigDecimal.valueOf(montant));
    }

    public boolean estNegatif() {
        return montant.compareTo(BigDecimal.ZERO) < 0;
    }

    public boolean estPositif() {
        return montant.compareTo(BigDecimal.ZERO) > 0;
    }

    public Argent ajouter(@NonNull Argent autre) {
        return new Argent(this.montant.add(autre.montant));
    }

    public Argent soustraire(@NonNull Argent autre) {
        return new Argent(this.montant.subtract(autre.montant));
    }

    @Override
    public String toString() {
        return montant + " FCFA";
    }
}