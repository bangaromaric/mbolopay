package ga.banga.mbolopay.identite.infrastructure.secondary.event;

import ga.banga.mbolopay.identite.domain.port.out.PublieurEvenements;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

/**
 * Adaptateur secondaire : implémente le port {@link PublieurEvenements} du domaine
 * en déléguant à {@link ApplicationEventPublisher} de Spring.
 *
 * <p>Isole le domaine et l'application de toute dépendance Spring.
 *
 * @author BANGA Romaric
 */
@Component
class PublieurEvenementsSpring implements PublieurEvenements {

    private final ApplicationEventPublisher publisher;

    PublieurEvenementsSpring(ApplicationEventPublisher publisher) {
        this.publisher = publisher;
    }

    @Override
    public void publier(Object evenement) {
        publisher.publishEvent(evenement);
    }
}
