package ga.banga.mbolopay.identite.domain.event;

/**
 * Événement de domaine publié lorsqu'un abonné est créé avec succès.
 *
 * <p>Ce package constitue une <em>named interface</em> Spring Modulith ("events") du module
 * Identité, exposée aux modules autorisés (cf. {@code package-info.java}).
 *
 * @param abonneId identifiant de l'abonné créé
 * @author BANGA Romaric
 */
public record EvenementAbonneCree(String abonneId) {}
