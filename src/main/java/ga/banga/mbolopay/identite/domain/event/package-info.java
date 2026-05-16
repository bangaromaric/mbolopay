/**
 * Événements de domaine du bounded context Identité.
 *
 * <p>Exposé en tant que <em>named interface</em> Spring Modulith {@code "events"} pour permettre
 * aux modules autorisés (ex. {@code portefeuille}) de référencer ces événements sans dépendre du
 * reste du domaine interne.
 *
 * @author BANGA Romaric
 */
@org.jspecify.annotations.NullMarked
@org.springframework.modulith.NamedInterface("events")
package ga.banga.mbolopay.identite.domain.event;
