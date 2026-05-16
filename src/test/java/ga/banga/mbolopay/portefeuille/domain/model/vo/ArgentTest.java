package ga.banga.mbolopay.portefeuille.domain.model.vo;

import ga.banga.mbolopay.portefeuille.domain.exception.MontantInvalideException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ArgentTest {

    @Test
    @DisplayName("Doit arrondir automatiquement les décimales (FCFA sans centimes)")
    void doitArrondirMontant() {
        // 100.5 -> 101 (HALF_UP)
        Argent argent = new Argent(new BigDecimal("100.50"));
        assertThat(argent.montant()).isEqualTo(new BigDecimal("101"));

        // 100.1 -> 100
        Argent argentBas = new Argent(new BigDecimal("100.10"));
        assertThat(argentBas.montant()).isEqualTo(new BigDecimal("100"));
    }

    @Test
    void doitGererAddition() {
        Argent a = Argent.de(1000);
        Argent b = Argent.de(500);

        Argent total = a.ajouter(b);

        assertThat(total).isEqualTo(Argent.de(1500));
        // Vérifie l'immutabilité
        assertThat(a).isEqualTo(Argent.de(1000));
    }

    @Test
    void doitGererSoustraction() {
        Argent a = Argent.de(1000);
        Argent b = Argent.de(300);

        Argent reste = a.soustraire(b);

        assertThat(reste).isEqualTo(Argent.de(700));
    }

    @Test
    void doitDetecterNegatif() {
        Argent positif = Argent.de(10);
        Argent negatif = Argent.de(-10);

        assertThat(positif.estNegatif()).isFalse();
        assertThat(negatif.estNegatif()).isTrue();
    }

    @Test
    void neDoitPasAccepterNull() {
        assertThatThrownBy(() -> new Argent(null))
                .isInstanceOf(MontantInvalideException.class);
    }
}