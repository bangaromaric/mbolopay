package ga.banga.mbolopay.identite.infrastructure.primary.web;

import ga.banga.mbolopay.identite.domain.command.CommandeCreerAbonne;
import ga.banga.mbolopay.identite.domain.exception.NumeroDejaUtiliseException;
import ga.banga.mbolopay.identite.domain.exception.NumeroNonAutoriseException;
import ga.banga.mbolopay.identite.domain.model.Abonne;
import ga.banga.mbolopay.identite.domain.model.AbonneId;
import ga.banga.mbolopay.identite.domain.model.vo.NomGabonais;
import ga.banga.mbolopay.identite.domain.model.vo.NumeroTelephoneGabonais;
import ga.banga.mbolopay.identite.domain.port.in.CreerAbonneUseCase;
import ga.banga.mbolopay.identite.domain.port.in.RechercherAbonneUseCase;
import ga.banga.mbolopay.identite.infrastructure.primary.web.advice.GestionnaireExceptionsIdentite;
import ga.banga.mbolopay.identite.infrastructure.primary.web.dto.CreerAbonneRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.time.Instant;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AbonneController.class)
@Import(GestionnaireExceptionsIdentite.class)
class AbonneControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockitoBean
    CreerAbonneUseCase creerAbonneUseCase;

    @MockitoBean
    RechercherAbonneUseCase rechercherAbonneUseCase;

    @Test
    void doitCreerAbonneAvecSucces() throws Exception {
        // Given
        CreerAbonneRequest request = new CreerAbonneRequest("Jean", "Moussavou", "066123456");

        Abonne abonneCree = new Abonne(
                new AbonneId(UUID.fromString("550e8400-e29b-41d4-a716-446655440000")),
                new NomGabonais("Jean", "Moussavou"),
                new NumeroTelephoneGabonais("066123456"),
                Instant.parse("2024-01-15T10:30:00Z"),
                true
        );

        when(creerAbonneUseCase.executer(any(CommandeCreerAbonne.class))).thenReturn(abonneCree);

        // When & Then
        mockMvc.perform(post("/api/abonnes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("550e8400-e29b-41d4-a716-446655440000"))
                .andExpect(jsonPath("$.prenom").value("Jean"))
                .andExpect(jsonPath("$.nom").value("Moussavou"))
                .andExpect(jsonPath("$.numeroTelephone").value("066123456"))
                .andExpect(jsonPath("$.actif").value(true));
    }

    @Test
    void doitRetourner409SiNumeroDejaUtilise() throws Exception {
        // Given
        CreerAbonneRequest request = new CreerAbonneRequest("Jean", "Moussavou", "066123456");

        when(creerAbonneUseCase.executer(any(CommandeCreerAbonne.class)))
                .thenThrow(new NumeroDejaUtiliseException("Le numéro 066123456 est déjà utilisé"));

        // When & Then
        mockMvc.perform(post("/api/abonnes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("CONFLICT"))
                .andExpect(jsonPath("$.details").value("Le numéro 066123456 est déjà utilisé"));
    }

    @Test
    void doitRetourner400SiNumeroNonAutorise() throws Exception {
        // Given
        CreerAbonneRequest request = new CreerAbonneRequest("Jean", "Moussavou", "066123456");

        when(creerAbonneUseCase.executer(any(CommandeCreerAbonne.class)))
                .thenThrow(new NumeroNonAutoriseException("Le numéro n'est pas autorisé"));

        // When & Then
        mockMvc.perform(post("/api/abonnes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.details").value("Le numéro n'est pas autorisé"));
    }

    @Test
    void doitRetourner400SiDonneesInvalides() throws Exception {
        // Given
        CreerAbonneRequest request = new CreerAbonneRequest("", "Moussavou", "066123456");

        // When & Then
        mockMvc.perform(post("/api/abonnes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.details").value("Le prénom ne peut pas être vide"));
    }

    @Test
    void doitRetournerSanteOk() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/abonnes/sante"))
                .andExpect(status().isOk())
                .andExpect(content().string("Module Identité opérationnel"));
    }
}
