package ga.banga.mbolopay.identite.domain.model;

import ga.banga.mbolopay.identite.domain.exception.IdentifiantAbonneInvalideException;
import org.junit.jupiter.api.Test;
import java.util.UUID;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AbonneIdTest {

    @Test
    void doitGenererUnIdUnique() {
        AbonneId id1 = AbonneId.generer();
        AbonneId id2 = AbonneId.generer();

        assertThat(id1).isNotNull();
        assertThat(id1).isNotEqualTo(id2);
    }

    @Test
    void doitCreerDepuisStringValide() {
        UUID uuid = UUID.randomUUID();
        AbonneId id = AbonneId.depuis(uuid.toString());

        assertThat(id.valeur()).isEqualTo(uuid);
        assertThat(id.toString()).isEqualTo(uuid.toString());
    }

    @Test
    void neDoitPasAccepterValeurNulle() {
        assertThatThrownBy(() -> new AbonneId(null))
                .isInstanceOf(IdentifiantAbonneInvalideException.class)
                .hasMessage("L'identifiant ne peut pas être null");
    }

    @Test
    void deuxIdsAvecMemeValeurSontEgaux() {
        UUID uuid = UUID.randomUUID();
        AbonneId id1 = new AbonneId(uuid);
        AbonneId id2 = new AbonneId(uuid);

        // Vérifie l'égalité structurelle (grâce au Record java)
        assertThat(id1).isEqualTo(id2);
        assertThat(id1.hashCode()).isEqualTo(id2.hashCode());
    }
}