package ga.banga.mbolopay.identite.infrastructure.primary.web.advice;

import ga.banga.mbolopay.identite.domain.exception.AbonneIntrouvableException;
import ga.banga.mbolopay.identite.domain.exception.NumeroDejaUtiliseException;
import ga.banga.mbolopay.identite.domain.exception.NumeroNonAutoriseException;
import ga.banga.mbolopay.shared.exception.ExceptionDomaine;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Gestionnaire global des exceptions pour le module identité.
 *
 * @author BANGA Romaric
 */
@RestControllerAdvice(basePackages = "ga.banga.mbolopay.identite")
public class GestionnaireExceptionsIdentite {

    /**
     * Mappe {@link NumeroDejaUtiliseException} sur HTTP 409 CONFLICT.
     * Prioritaire sur le fallback {@link ExceptionDomaine}.
     */
    @ExceptionHandler(NumeroDejaUtiliseException.class)
    public ResponseEntity<ReponseErreur> handleConflict(NumeroDejaUtiliseException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ReponseErreur.conflict(ex.getMessage()));
    }

    /**
     * Mappe {@link AbonneIntrouvableException} sur HTTP 404 NOT_FOUND.
     * Prioritaire sur le fallback {@link ExceptionDomaine}.
     */
    @ExceptionHandler(AbonneIntrouvableException.class)
    public ResponseEntity<ReponseErreur> handleNotFound(AbonneIntrouvableException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ReponseErreur.notFound(ex.getMessage()));
    }

    /**
     * Mappe {@link NumeroNonAutoriseException} sur HTTP 400 BAD_REQUEST.
     * Pourrait être 403 FORBIDDEN selon la sémantique métier retenue ; ici on considère
     * que le numéro est invalide d'un point de vue applicatif.
     */
    @ExceptionHandler(NumeroNonAutoriseException.class)
    public ResponseEntity<ReponseErreur> handleForbidden(NumeroNonAutoriseException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ReponseErreur.badRequest(ex.getMessage()));
    }

    /**
     * Fallback générique : toute autre violation domaine non spécialisée devient un
     * HTTP 400 BAD_REQUEST. Les handlers ci-dessus restent prioritaires car ils ciblent
     * des sous-classes plus spécifiques de {@link ExceptionDomaine}.
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
    public ResponseEntity<ReponseErreur> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ReponseErreur.internalError());
    }
}
