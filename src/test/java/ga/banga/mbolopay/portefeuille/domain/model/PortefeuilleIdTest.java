package ga.banga.mbolopay.portefeuille.domain.model;

import ga.banga.mbolopay.portefeuille.domain.exception.IdentifiantPortefeuilleInvalideException;
import org.junit.jupiter.api.Test;
import java.util.UUID;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PortefeuilleIdTest {

    @Test
    void doitGenererIdUnique() {
        assertThat(PortefeuilleId.generer()).isNotEqualTo(PortefeuilleId.generer());
    }

    @Test
    void doitReconstituerDepuisString() {
        String uuidStr = "123e4567-e89b-12d3-a456-426614174000";
        PortefeuilleId id = PortefeuilleId.depuis(uuidStr);

        assertThat(id.valeur()).isEqualTo(UUID.fromString(uuidStr));
    }

    @Test
    void doitRefuserUuidInvalide() {
        assertThatThrownBy(() -> PortefeuilleId.depuis("invalid-uuid"))
                .isInstanceOf(IdentifiantPortefeuilleInvalideException.class);

        assertThatThrownBy(() -> PortefeuilleId.depuis(null))
                .isInstanceOf(IdentifiantPortefeuilleInvalideException.class);
    }
}