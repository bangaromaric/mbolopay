package ga.banga.mbolopay.identite.application.service;

import ga.banga.mbolopay.identite.domain.event.EvenementAbonneCree;
import ga.banga.mbolopay.identite.domain.command.CommandeCreerAbonne;
import ga.banga.mbolopay.identite.domain.exception.NumeroDejaUtiliseException;
import ga.banga.mbolopay.identite.domain.exception.NumeroNonAutoriseException;
import ga.banga.mbolopay.identite.domain.model.Abonne;
import ga.banga.mbolopay.identite.domain.model.vo.NomGabonais;
import ga.banga.mbolopay.identite.domain.model.vo.NumeroTelephoneGabonais;
import ga.banga.mbolopay.identite.domain.port.out.PublieurEvenements;
import ga.banga.mbolopay.identite.domain.port.out.DepotAbonne;
import ga.banga.mbolopay.identite.domain.service.ServiceValidationAbonne;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CreerAbonneServiceTest {

    @Mock
    DepotAbonne depotAbonne;

    @Mock
    PublieurEvenements evenements;

    ServiceValidationAbonne serviceValidation;
    CreerAbonneService service;

    @BeforeEach
    void setUp() {
        serviceValidation = new ServiceValidationAbonne();
        service = new CreerAbonneService(depotAbonne, serviceValidation, evenements);
    }

    @Test
    void doitCreerAbonneAvecSucces() {
        // Given
        NomGabonais nom = new NomGabonais("Jean", "Moussavou");
        NumeroTelephoneGabonais numero = new NumeroTelephoneGabonais("066123456");
        CommandeCreerAbonne commande = new CommandeCreerAbonne(nom, numero);

        when(depotAbonne.existeParNumero(numero)).thenReturn(false);
        when(depotAbonne.sauvegarder(any(Abonne.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        Abonne resultat = service.executer(commande);

        // Then
        assertThat(resultat).isNotNull();
        assertThat(resultat.nom()).isEqualTo(nom);
        assertThat(resultat.numeroTelephone()).isEqualTo(numero);
        assertThat(resultat.estActif()).isTrue();

        verify(depotAbonne).sauvegarder(any(Abonne.class));
        verify(evenements).publier(any(EvenementAbonneCree.class));
    }

    @Test
    void doitLeverExceptionSiNumeroDejaUtilise() {
        // Given
        NomGabonais nom = new NomGabonais("Jean", "Moussavou");
        NumeroTelephoneGabonais numero = new NumeroTelephoneGabonais("066123456");
        CommandeCreerAbonne commande = new CommandeCreerAbonne(nom, numero);

        when(depotAbonne.existeParNumero(numero)).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> service.executer(commande))
                .isInstanceOf(NumeroDejaUtiliseException.class)
                .hasMessageContaining("066123456")
                .hasMessageContaining("déjà enregistré");

        verify(depotAbonne, never()).sauvegarder(any());
        verify(evenements, never()).publier(any());
    }

    @Test
    void doitLeverExceptionSiNumeroNonAutorise() {
        // Given - numéro commençant par 077 (liste noire)
        NomGabonais nom = new NomGabonais("Jean", "Moussavou");
        NumeroTelephoneGabonais numeroInterdit = new NumeroTelephoneGabonais("077123456");
        CommandeCreerAbonne commande = new CommandeCreerAbonne(nom, numeroInterdit);

        when(depotAbonne.existeParNumero(numeroInterdit)).thenReturn(false);

        // When & Then
        assertThatThrownBy(() -> service.executer(commande))
                .isInstanceOf(NumeroNonAutoriseException.class)
                .hasMessageContaining("077123456")
                .hasMessageContaining("n'est pas autorisé");

        verify(depotAbonne, never()).sauvegarder(any());
        verify(evenements, never()).publier(any());
    }

    @Test
    void doitPublierEvenementAvecIdAbonneCorrect() {
        // Given
        NomGabonais nom = new NomGabonais("Marie", "Nzoghe");
        NumeroTelephoneGabonais numero = new NumeroTelephoneGabonais("066987654");
        CommandeCreerAbonne commande = new CommandeCreerAbonne(nom, numero);

        when(depotAbonne.existeParNumero(numero)).thenReturn(false);
        when(depotAbonne.sauvegarder(any(Abonne.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ArgumentCaptor<EvenementAbonneCree> capteur = ArgumentCaptor.forClass(EvenementAbonneCree.class);

        // When
        Abonne resultat = service.executer(commande);

        // Then
        verify(evenements).publier(capteur.capture());
        EvenementAbonneCree evenementPublie = capteur.getValue();

        assertThat(evenementPublie.abonneId()).isEqualTo(resultat.id().toString());
    }

    @Test
    void doitSauvegarderAbonneAvantPublierEvenement() {
        // Given
        NomGabonais nom = new NomGabonais("Paul", "Obame");
        NumeroTelephoneGabonais numero = new NumeroTelephoneGabonais("066111222");
        CommandeCreerAbonne commande = new CommandeCreerAbonne(nom, numero);

        when(depotAbonne.existeParNumero(numero)).thenReturn(false);
        when(depotAbonne.sauvegarder(any(Abonne.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        service.executer(commande);

        // Then - vérifier l'ordre des appels
        var inOrder = inOrder(depotAbonne, evenements);
        inOrder.verify(depotAbonne).sauvegarder(any(Abonne.class));
        inOrder.verify(evenements).publier(any(EvenementAbonneCree.class));
    }
}
