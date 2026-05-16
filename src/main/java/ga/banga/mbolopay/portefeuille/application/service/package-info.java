/**
 * Services d'application du bounded context Portefeuille.
 *
 * <p>Orchestration pure : récupérer via port → appeler le domaine → sauvegarder via port.
 * Aucune règle métier ne doit vivre ici — elle appartient au domaine.
 *
 * @author BANGA Romaric
 */
@org.jspecify.annotations.NullMarked
package ga.banga.mbolopay.portefeuille.application.service;
