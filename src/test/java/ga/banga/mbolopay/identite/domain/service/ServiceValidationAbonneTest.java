package ga.banga.mbolopay.identite.domain.service;

import static org.junit.jupiter.api.Assertions.*;

import ga.banga.mbolopay.identite.domain.model.vo.NumeroTelephoneGabonais;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ServiceValidationAbonneTest {

    private ServiceValidationAbonne service;

    @Mock
    private NumeroTelephoneGabonais numeroMock;

    @BeforeEach
    void setUp() {
        service = new ServiceValidationAbonne();
    }

    @Test
    @DisplayName("Doit accepter un numéro standard (+24166...)")
    void doitAccepterNumeroStandard() {
        // Given
        when(numeroMock.versFormatInternational()).thenReturn("+24166000001");

        // When
        boolean resultat = service.estNumeroAutorise(numeroMock);

        // Then
        assertThat(resultat).isTrue();
    }

    @Test
    @DisplayName("Doit rejeter un numéro commençant par +24177")
    void doitRejeterNumeroInterdit() {
        // Given
        when(numeroMock.versFormatInternational()).thenReturn("+24177123456");

        // When
        boolean resultat = service.estNumeroAutorise(numeroMock);

        // Then
        assertThat(resultat).isFalse();
    }
}