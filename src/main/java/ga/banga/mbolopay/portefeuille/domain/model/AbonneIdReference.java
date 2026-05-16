package ga.banga.mbolopay.portefeuille.domain.model;

import ga.banga.mbolopay.portefeuille.domain.exception.IdentifiantAbonneInvalideException;
import org.jmolecules.ddd.annotation.ValueObject;
import org.jspecify.annotations.NonNull;

/**
 * Référence valuée d'un abonné, locale au bounded context Portefeuille.
 *
 * <p>Spring Modulith interdit au portefeuille de dépendre directement de
 * {@code identite.domain.model.AbonneId}. Cette classe matérialise le principe DDD selon
 * lequel <em>les modules ne partagent pas leurs identifiants typés, ils s'échangent leurs
 * valeurs</em>. La conversion {@code String ↔ AbonneIdReference} se fait à la frontière du
 * module (écouteur d'événement, controller REST).
 *
 * <p>Conforme au Types Driven Development : impossible de passer un {@code String} arbitraire
 * à un port ou un agrégat — la compilation l'interdit.
 *
 * @param valeur représentation textuelle de l'identifiant abonné (UUID typiquement)
 * @author BANGA Romaric
 */
@ValueObject
public record AbonneIdReference(@NonNull String valeur) {

    public AbonneIdReference {
        if (valeur == null || valeur.isBlank()) {
            throw new IdentifiantAbonneInvalideException(
                    "La référence d'abonné ne peut pas être vide");
        }
    }

    @Override
    public String toString() {
        return valeur;
    }
}
