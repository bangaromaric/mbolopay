package ga.banga.mbolopay.identite.infrastructure.primary.web;

import ga.banga.mbolopay.identite.domain.command.CommandeCreerAbonne;
import ga.banga.mbolopay.identite.domain.exception.AbonneIntrouvableException;
import ga.banga.mbolopay.identite.domain.model.Abonne;
import ga.banga.mbolopay.identite.domain.model.AbonneId;
import ga.banga.mbolopay.identite.domain.model.vo.NomGabonais;
import ga.banga.mbolopay.identite.domain.model.vo.NumeroTelephoneGabonais;
import ga.banga.mbolopay.identite.domain.port.in.CreerAbonneUseCase;
import ga.banga.mbolopay.identite.domain.port.in.RechercherAbonneUseCase;
import ga.banga.mbolopay.identite.infrastructure.primary.web.dto.AbonneResponse;
import ga.banga.mbolopay.identite.infrastructure.primary.web.dto.CreerAbonneRequest;
import org.jspecify.annotations.NonNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Adaptateur primaire : API REST pour la gestion des abonnés.
 *
 * @author BANGA Romaric
 */
@RestController
@RequestMapping("/api/abonnes")
public class AbonneController {

    private final CreerAbonneUseCase creerAbonneUseCase;
    private final RechercherAbonneUseCase rechercherAbonneUseCase;

    public AbonneController(
            CreerAbonneUseCase creerAbonneUseCase,
            RechercherAbonneUseCase rechercherAbonneUseCase
    ) {
        this.creerAbonneUseCase = creerAbonneUseCase;
        this.rechercherAbonneUseCase = rechercherAbonneUseCase;
    }

    /**
     * POST /api/abonnes — Créer un nouvel abonné.
     */
    @PostMapping
    public ResponseEntity<AbonneResponse> creerAbonne(
            @RequestBody @NonNull CreerAbonneRequest request
    ) {
        NomGabonais nom = new NomGabonais(request.prenom(), request.nom());
        NumeroTelephoneGabonais numero = new NumeroTelephoneGabonais(request.numeroTelephone());

        CommandeCreerAbonne commande = new CommandeCreerAbonne(nom, numero);
        Abonne abonne = creerAbonneUseCase.executer(commande);

        AbonneResponse response = AbonneResponse.depuis(abonne);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/abonnes/{id} — Récupérer un abonné par son identifiant.
     *
     * @param id identifiant de l'abonné au format UUID
     * @return l'abonné correspondant
     * @throws ga.banga.mbolopay.identite.domain.exception.IdentifiantAbonneInvalideException
     *         si l'UUID est mal formé (mappé en 400 BAD_REQUEST)
     * @throws AbonneIntrouvableException si aucun abonné ne correspond à cet identifiant
     *         (mappé en 404 NOT_FOUND)
     */
    @GetMapping("/{id}")
    public ResponseEntity<AbonneResponse> recupererAbonne(@PathVariable @NonNull String id) {
        AbonneId abonneId = AbonneId.depuis(id);
        Abonne abonne = rechercherAbonneUseCase.executer(abonneId)
                .orElseThrow(() -> new AbonneIntrouvableException(id));
        return ResponseEntity.ok(AbonneResponse.depuis(abonne));
    }

    /**
     * GET /api/abonnes/sante — Health check.
     */
    @GetMapping("/sante")
    public ResponseEntity<String> verifierSante() {
        return ResponseEntity.ok("Module Identité opérationnel");
    }
}
