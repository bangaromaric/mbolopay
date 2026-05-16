package ga.banga.mbolopay.identite.domain.model.vo;

import ga.banga.mbolopay.identite.domain.exception.NomInvalideException;
import org.jmolecules.ddd.annotation.ValueObject;
import org.jspecify.annotations.NonNull;

/**
 * Représente un nom complet gabonais (prénom + nom) avec normalisation.
 *
 * @author BANGA Romaric
 */
@ValueObject
public record NomGabonais(
        @NonNull String prenom,
        @NonNull String nom
) {

    public NomGabonais {
        if (prenom == null || prenom.isBlank()) {
            throw new NomInvalideException("Le prénom ne peut pas être vide");
        }
        if (nom.isBlank()) {
            throw new NomInvalideException("Le nom ne peut pas être vide");
        }

        // Normalisation: première lettre en majuscule
        prenom = capitaliser(prenom.trim());
        nom = capitaliser(nom.trim());
    }

    private static String capitaliser(String texte) {
        if (texte.isEmpty()) return texte;
        return texte.substring(0, 1).toUpperCase() + texte.substring(1).toLowerCase();
    }

    public String nomComplet() {
        return prenom + " " + nom;
    }
}
