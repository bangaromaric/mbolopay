package ga.banga.mbolopay.portefeuille.infrastructure.primary.event;

import ga.banga.mbolopay.identite.domain.event.EvenementAbonneCree;
import ga.banga.mbolopay.portefeuille.domain.model.AbonneIdReference;
import ga.banga.mbolopay.portefeuille.domain.port.in.CreerPortefeuilleUseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Component;

/**
 * Adaptateur primaire : écoute les événements de domaine du module Identité
 * et déclenche la création d'un portefeuille via le port d'entrée
 * {@link CreerPortefeuilleUseCase}.
 *
 * <p>L'agrégat {@code Portefeuille} n'est jamais construit directement ici — toute la création
 * passe par le use case, ce qui garantit que la séquence canonique (transaction, persistance,
 * orchestration) reste sous le contrôle de la couche application.
 *
 * @author BANGA Romaric
 */
@Component
public class EcouteurEvenementAbonne {
    private static final Logger log = LoggerFactory.getLogger(EcouteurEvenementAbonne.class);

    private final CreerPortefeuilleUseCase creerPortefeuille;

    public EcouteurEvenementAbonne(CreerPortefeuilleUseCase creerPortefeuille) {
        this.creerPortefeuille = creerPortefeuille;
    }

    /**
     * Réagit à la création d'un abonné. Spring Modulith garantit l'exécution même en cas de crash
     * (persistance de l'événement via le {@code event-publication-registry}).
     *
     * @param evenement événement reçu du module Identité
     */
    @ApplicationModuleListener
    public void quandAbonneCree(EvenementAbonneCree evenement) {
        log.info("evenement creation abonne recu : {}", evenement);
        creerPortefeuille.executer(new AbonneIdReference(evenement.abonneId()));
    }
}
