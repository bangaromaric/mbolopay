package ga.banga.mbolopay.identite.domain.model;

import static org.assertj.core.api.Assertions.within;
import static org.junit.jupiter.api.Assertions.*;

import ga.banga.mbolopay.identite.domain.model.vo.NomGabonais;
import ga.banga.mbolopay.identite.domain.model.vo.NumeroTelephoneGabonais;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class AbonneTest {

    @Mock
    private NomGabonais nomMock;

    @Mock
    private NumeroTelephoneGabonais telephoneMock;

    @Test
    void doitCreerUnAbonneValide() {
        // Given & When
        Abonne abonne = Abonne.creer(nomMock, telephoneMock);

        // Then
        assertThat(abonne.id()).isNotNull();
        assertThat(abonne.nom()).isEqualTo(nomMock);
        assertThat(abonne.numeroTelephone()).isEqualTo(telephoneMock);
        assertThat(abonne.estActif()).isTrue();

        // Vérifie que la date est proche de "maintenant" (marge de 1 seconde)
//        assertThat(abonne.dateInscription()).isCloseTo(Instant.now(), 1000);
        assertThat(abonne.dateInscription())
                .isCloseTo(Instant.now(), within(1, ChronoUnit.SECONDS));
    }

    @Test
    void doitDesactiverAbonne() {
        // Given
        Abonne abonne = Abonne.creer(nomMock, telephoneMock);

        // When
        abonne.desactiver();

        // Then
        assertThat(abonne.estActif()).isFalse();
    }

    @Test
    void doitReactiverAbonne() {
        // Given
        Abonne abonne = Abonne.creer(nomMock, telephoneMock);
        abonne.desactiver(); // Etat initial inactif

        // When
        abonne.reactiver();

        // Then
        assertThat(abonne.estActif()).isTrue();
    }
}