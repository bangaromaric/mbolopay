package ga.banga.mbolopay.portefeuille.application.service;

import ga.banga.mbolopay.portefeuille.domain.exception.PortefeuilleIntrouvableException;
import ga.banga.mbolopay.portefeuille.domain.model.AbonneIdReference;
import ga.banga.mbolopay.portefeuille.domain.model.Portefeuille;
import ga.banga.mbolopay.portefeuille.domain.port.out.DepotPortefeuille;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RecupererPortefeuilleParAbonneServiceTest {

    @Mock
    DepotPortefeuille depotPortefeuille;

    @InjectMocks
    RecupererPortefeuilleParAbonneService service;

    @Test
    void doit_retourner_le_portefeuille() {
        AbonneIdReference ref = new AbonneIdReference("abonne-1");
        Portefeuille p = Portefeuille.creerVide(ref);

        when(depotPortefeuille.trouverParAbonneId(ref))
                .thenReturn(Optional.of(p));

        Portefeuille resultat = service.executer(ref);

        assertEquals(ref, resultat.abonneId());
    }

    @Test
    void doit_lever_exception_si_inexistant() {
        AbonneIdReference ref = new AbonneIdReference("x");
        when(depotPortefeuille.trouverParAbonneId(ref))
                .thenReturn(Optional.empty());

        assertThrows(
                PortefeuilleIntrouvableException.class,
                () -> service.executer(ref)
        );
    }
}
