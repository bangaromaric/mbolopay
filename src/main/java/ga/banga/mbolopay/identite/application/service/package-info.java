/**
 * Services d'application du bounded context Identité.
 *
 * <p>Orchestration pure (récupérer via port → appeler le domaine → sauvegarder → publier
 * événements). Aucune règle métier ne doit vivre ici — elle appartient au domaine.
 *
 * @author BANGA Romaric
 */
@org.jspecify.annotations.NullMarked
package ga.banga.mbolopay.identite.application.service;
