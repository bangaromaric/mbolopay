package ga.banga.mbolopay.portefeuille.infrastructure.primary.web;

import ga.banga.mbolopay.portefeuille.domain.command.CommandeDeposerArgent;
import ga.banga.mbolopay.portefeuille.domain.command.CommandeHistoriqueOperations;
import ga.banga.mbolopay.portefeuille.domain.command.CommandeRetirerArgent;
import ga.banga.mbolopay.portefeuille.domain.model.AbonneIdReference;
import ga.banga.mbolopay.portefeuille.domain.model.PageOperations;
import ga.banga.mbolopay.portefeuille.domain.model.Portefeuille;
import ga.banga.mbolopay.portefeuille.domain.model.RequetePagination;
import ga.banga.mbolopay.portefeuille.domain.model.vo.Argent;
import ga.banga.mbolopay.portefeuille.domain.port.in.DeposerArgentUseCase;
import ga.banga.mbolopay.portefeuille.domain.port.in.HistoriqueOperationsUseCase;
import ga.banga.mbolopay.portefeuille.domain.port.in.RecupererPortefeuilleParAbonneUseCase;
import ga.banga.mbolopay.portefeuille.domain.port.in.RetirerArgentUseCase;
import ga.banga.mbolopay.portefeuille.infrastructure.primary.web.dto.DepotRequest;
import ga.banga.mbolopay.portefeuille.infrastructure.primary.web.dto.PageOperationsResponse;
import ga.banga.mbolopay.portefeuille.infrastructure.primary.web.dto.PortefeuilleResponse;
import ga.banga.mbolopay.portefeuille.infrastructure.primary.web.dto.RetraitRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Adaptateur primaire : API REST pour la gestion des portefeuilles.
 *
 * @author BANGA Romaric
 */
@RestController
@RequestMapping("/api/portefeuilles")
public class PortefeuilleController {

    private final DeposerArgentUseCase deposerArgentUseCase;
    private final RetirerArgentUseCase retirerArgentUseCase;
    private final RecupererPortefeuilleParAbonneUseCase recupererUseCase;
    private final HistoriqueOperationsUseCase historiqueUseCase;

    public PortefeuilleController(
            DeposerArgentUseCase deposerArgentUseCase,
            RetirerArgentUseCase retirerArgentUseCase,
            RecupererPortefeuilleParAbonneUseCase recupererUseCase,
            HistoriqueOperationsUseCase historiqueUseCase
    ) {
        this.deposerArgentUseCase = deposerArgentUseCase;
        this.retirerArgentUseCase = retirerArgentUseCase;
        this.recupererUseCase = recupererUseCase;
        this.historiqueUseCase = historiqueUseCase;
    }

    /**
     * POST /api/portefeuilles/{id}/depot - Déposer de l'argent
     *
     * Exemple de requête:
     * {
     *   "montant": 50000
     * }
     */
    @PostMapping("/{portefeuilleId}/depot")
    public ResponseEntity<PortefeuilleResponse> deposerArgent(
            @PathVariable String portefeuilleId,
            @RequestBody DepotRequest request
    ) {

            // Validation et création du Value Object
            Argent montant = Argent.de(request.montant());

            // Exécution du cas d'usage
            CommandeDeposerArgent commande = new CommandeDeposerArgent(
                    portefeuilleId,
                    montant
            );
            Portefeuille portefeuille = deposerArgentUseCase.executer(commande);

            // Mapping vers DTO de réponse
            PortefeuilleResponse response = PortefeuilleResponse.depuis(portefeuille);

            return ResponseEntity.ok(response);

    }

    /**
     * POST /api/portefeuilles/{id}/retrait - Retirer de l'argent
     *
     * <p>Renvoie 400 BAD_REQUEST si le solde est insuffisant ou si le montant est négatif ;
     * 404 NOT_FOUND si le portefeuille n'existe pas.
     */
    @PostMapping("/{portefeuilleId}/retrait")
    public ResponseEntity<PortefeuilleResponse> retirerArgent(
            @PathVariable String portefeuilleId,
            @RequestBody RetraitRequest request
    ) {
        Argent montant = Argent.de(request.montant());

        CommandeRetirerArgent commande = new CommandeRetirerArgent(
                portefeuilleId,
                montant
        );
        Portefeuille portefeuille = retirerArgentUseCase.executer(commande);

        return ResponseEntity.ok(PortefeuilleResponse.depuis(portefeuille));
    }

    /**
     * GET /api/portefeuilles/abonne/{abonneId} - Récupérer le portefeuille d'un abonné
     */
    @GetMapping("/abonne/{abonneId}")
    public ResponseEntity<PortefeuilleResponse> recupererParAbonne(
            @PathVariable String abonneId
    ) {
        Portefeuille portefeuille =
                recupererUseCase.executer(new AbonneIdReference(abonneId));

        return ResponseEntity.ok(PortefeuilleResponse.depuis(portefeuille));
    }

    /**
     * GET /api/portefeuilles/{id}/operations - Historique paginé des opérations
     *
     * <p>Query params optionnels :
     * <ul>
     *   <li>{@code page} : numéro de page 0-indexé (défaut 0)</li>
     *   <li>{@code taille} : nombre d'éléments par page, 1..100 (défaut 20)</li>
     * </ul>
     *
     * <p>Tri DESC par {@code dateOperation} (plus récente en premier), tri secondaire
     * par {@code id} pour stabilité.
     */
    @GetMapping("/{portefeuilleId}/operations")
    public ResponseEntity<PageOperationsResponse> historique(
            @PathVariable String portefeuilleId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int taille
    ) {
        CommandeHistoriqueOperations commande = new CommandeHistoriqueOperations(
                portefeuilleId,
                new RequetePagination(page, taille)
        );
        PageOperations resultat = historiqueUseCase.executer(commande);

        return ResponseEntity.ok(PageOperationsResponse.depuis(resultat));
    }

    /**
     * GET /api/portefeuilles/sante - Health check
     */
    @GetMapping("/sante")
    public ResponseEntity<String> verifierSante() {
        return ResponseEntity.ok("✅ Module Portefeuille opérationnel");
    }


}
