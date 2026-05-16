package ga.banga.mbolopay.portefeuille.infrastructure.primary.web;

import static org.junit.jupiter.api.Assertions.*;

import ga.banga.mbolopay.portefeuille.domain.exception.PortefeuilleIntrouvableException;
import ga.banga.mbolopay.portefeuille.domain.model.AbonneIdReference;
import ga.banga.mbolopay.portefeuille.domain.model.Portefeuille;
import ga.banga.mbolopay.portefeuille.domain.model.vo.Argent;
import ga.banga.mbolopay.portefeuille.domain.port.in.DeposerArgentUseCase;
import ga.banga.mbolopay.portefeuille.domain.port.in.HistoriqueOperationsUseCase;
import ga.banga.mbolopay.portefeuille.domain.port.in.RecupererPortefeuilleParAbonneUseCase;
import ga.banga.mbolopay.portefeuille.domain.port.in.RetirerArgentUseCase;
import ga.banga.mbolopay.portefeuille.domain.port.out.DepotPortefeuille;
import ga.banga.mbolopay.portefeuille.infrastructure.primary.web.dto.DepotRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;


import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PortefeuilleController.class)
class PortefeuilleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private DeposerArgentUseCase deposerArgentUseCase;

    @MockitoBean
    private RetirerArgentUseCase retirerArgentUseCase;

    @MockitoBean
    private RecupererPortefeuilleParAbonneUseCase recupererPortefeuilleParAbonneUseCase;

    @MockitoBean
    private HistoriqueOperationsUseCase historiqueOperationsUseCase;

    @MockitoBean
    private DepotPortefeuille depotPortefeuille;

    @Test
    @DisplayName("POST /depot doit retourner 200 quand le dépôt réussit")
    void doitDeposerArgentAvecSucces() throws Exception {
        // Given
        String portefeuilleId = "port-123";
        DepotRequest request = new DepotRequest(5000L);
        Portefeuille portefeuilleResultat = Portefeuille.creerVide(new AbonneIdReference("abonne-456"));
        portefeuilleResultat.deposer(Argent.de(5000));

        when(deposerArgentUseCase.executer(any())).thenReturn(portefeuilleResultat);

        // When & Then
        mockMvc.perform(post("/api/portefeuilles/{id}/depot", portefeuilleId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.solde").value(5000))
                .andExpect(jsonPath("$.abonneId").value("abonne-456"));
    }

    @Test
    @DisplayName("POST /depot doit retourner 404 si l'endpoint  n'existe pas")
    void doitRetourner404SiInexistant() throws Exception {
        // Given
        when(deposerArgentUseCase.executer(any()))
                .thenThrow(new PortefeuilleIntrouvableException("Introuvable"));

        DepotRequest request = new DepotRequest(1000L);

        // When & Then
        mockMvc.perform(post("/api/portefeuilles/inconnu/depot")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /abonne/{id} doit retourner le portefeuille")
    void doitRecupererParAbonne() throws Exception {
        // Given
        String abonneId = "user-789";
        AbonneIdReference ref = new AbonneIdReference(abonneId);
        Portefeuille p = Portefeuille.creerVide(ref);
        when(recupererPortefeuilleParAbonneUseCase.executer(ref))
                .thenReturn(p);
        // When & Then
        mockMvc.perform(get("/api/portefeuilles/abonne/{abonneId}", abonneId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.abonneId").value(abonneId));
    }

    @Test
    @DisplayName("GET /sante doit répondre OK")
    void verifierSante() throws Exception {
        mockMvc.perform(get("/api/portefeuilles/sante"))
                .andExpect(status().isOk())
                .andExpect(content().string("✅ Module Portefeuille opérationnel"));
    }
}