package ga.banga.mbolopay.identite.domain.port.out;

/**
 * Port de sortie pour la publication d'événements de domaine.
 * L'application conduit ce port vers l'extérieur (bus d'événements, Spring context…).
 *
 * @author BANGA Romaric
 */
public interface PublieurEvenements {

    /**
     * Publie un événement de domaine vers les consommateurs intéressés.
     *
     * @param evenement l'événement à publier
     */
    void publier(Object evenement);
}
