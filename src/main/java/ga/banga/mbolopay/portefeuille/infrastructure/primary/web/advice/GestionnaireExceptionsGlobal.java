package ga.banga.mbolopay.portefeuille.infrastructure.primary.web.advice;


import ga.banga.mbolopay.portefeuille.domain.exception.PortefeuilleIntrouvableException;
import ga.banga.mbolopay.shared.exception.ExceptionDomaine;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Gestionnaire global des exceptions pour le module portefeuille.
 *
 * @author BANGA Romaric
 */
@RestControllerAdvice(basePackages = "ga.banga.mbolopay.portefeuille")
public class GestionnaireExceptionsGlobal {

    /**
     * Mappe {@link PortefeuilleIntrouvableException} sur HTTP 404 NOT_FOUND.
     * Prioritaire sur le fallback {@link ExceptionDomaine}.
     */
    @ExceptionHandler(PortefeuilleIntrouvableException.class)
    public ResponseEntity<ReponseErreur> handleNotFound(
            PortefeuilleIntrouvableException ex
    ) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ReponseErreur.notFound(ex.getMessage()));
    }

    /**
     * Fallback générique : toute autre violation domaine non spécialisée devient un
     * HTTP 400 BAD_REQUEST (montant invalide, solde insuffisant, identifiant invalide…).
     * Le handler {@link #handleNotFound(PortefeuilleIntrouvableException)} reste prioritaire.
     */
    @ExceptionHandler(ExceptionDomaine.class)
    public ResponseEntity<ReponseErreur> handleDomaine(ExceptionDomaine ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ReponseErreur.badRequest(ex.getMessage()));
    }

    /**
     * Dernier filet : toute exception non métier (technique, infrastructure) devient un
     * HTTP 500 INTERNAL_ERROR. Le détail n'est pas exposé au client.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ReponseErreur> gererErreurGenerique(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ReponseErreur.internalError());
    }

}
