package ga.banga.mbolopay.portefeuille.domain.model;

import ga.banga.mbolopay.portefeuille.domain.exception.MontantInvalideException;
import ga.banga.mbolopay.portefeuille.domain.exception.SoldeInsuffisantException;
import ga.banga.mbolopay.portefeuille.domain.model.vo.Argent;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.within;

class PortefeuilleTest {

    @Test
    void doitCreerPortefeuilleVide() {
        AbonneIdReference abonneId = new AbonneIdReference("user-123");
        Portefeuille p = Portefeuille.creerVide(abonneId);

        assertThat(p.id()).isNotNull();
        assertThat(p.abonneId()).isEqualTo(abonneId);
        assertThat(p.solde()).isEqualTo(Argent.zero());
        assertThat(p.dateCreation()).isCloseTo(Instant.now(), within(1, ChronoUnit.SECONDS));
    }

    @Nested
    @DisplayName("Opérations de Dépôt")
    class Depot {
        @Test
        void doitCrediterCompte() {
            // Given
            Portefeuille p = Portefeuille.creerVide(new AbonneIdReference("user-1"));

            // When
            p.deposer(Argent.de(5000));

            // Then
            assertThat(p.solde()).isEqualTo(Argent.de(5000));
        }

        @Test
        void doitCumulerDepots() {
            // Given
            Portefeuille p = Portefeuille.creerVide(new AbonneIdReference("user-1"));

            // When
            p.deposer(Argent.de(1000));
            p.deposer(Argent.de(2000));

            // Then
            assertThat(p.solde()).isEqualTo(Argent.de(3000));
        }

        @Test
        void doitRefuserDepotNegatif() {
            Portefeuille p = Portefeuille.creerVide(new AbonneIdReference("user-1"));
            Argent montantNegatif = Argent.de(-500);

            assertThatThrownBy(() -> p.deposer(montantNegatif))
                    .isInstanceOf(MontantInvalideException.class)
                    .hasMessageContaining("négatif");
        }
    }

    @Nested
    @DisplayName("Opérations de Retrait")
    class Retrait {
        @Test
        void doitDebiterCompteSiSoldeSuffisant() {
            // Given
            Portefeuille p = Portefeuille.creerVide(new AbonneIdReference("user-1"));
            p.deposer(Argent.de(10000));

            // When
            p.retirer(Argent.de(4000));

            // Then
            assertThat(p.solde()).isEqualTo(Argent.de(6000));
        }

        @Test
        void doitRefuserRetraitSiSoldeInsuffisant() {
            // Given (Solde 1000)
            Portefeuille p = Portefeuille.creerVide(new AbonneIdReference("user-1"));
            p.deposer(Argent.de(1000));

            // When & Then (Retrait 1500)
            assertThatThrownBy(() -> p.retirer(Argent.de(1500)))
                    .isInstanceOf(SoldeInsuffisantException.class)
                    .hasMessageContaining("Solde insuffisant");

            // Le solde ne doit pas avoir bougé
            assertThat(p.solde()).isEqualTo(Argent.de(1000));
        }

        @Test
        void doitRefuserRetraitNegatif() {
            Portefeuille p = Portefeuille.creerVide(new AbonneIdReference("user-1"));
            Argent montantNegatif = Argent.de(-100);

            assertThatThrownBy(() -> p.retirer(montantNegatif))
                    .isInstanceOf(MontantInvalideException.class);
        }
    }
}