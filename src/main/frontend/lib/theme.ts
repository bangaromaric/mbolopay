/**
 * Bascule de thème (charte §14). Trois modes :
 * <ul>
 *   <li>{@code 'auto'} — suit {@code prefers-color-scheme} (défaut).</li>
 *   <li>{@code 'light'} — force le mode clair quelle que soit la préférence OS.</li>
 *   <li>{@code 'dark'} — force le mode sombre.</li>
 * </ul>
 *
 * Le mode est appliqué via l'attribut {@code data-theme} sur {@code <html>} ;
 * le bloc {@code @media (prefers-color-scheme: dark)} de
 * {@code tokens.css} ne s'active que lorsque cet attribut est absent ou égal
 * à {@code "auto"}.
 *
 * Pour éviter le flash de contenu non stylé (FOUC), un script inline en
 * {@code <head>} de {@code index.html} pose {@code data-theme} <i>avant</i>
 * le chargement de la feuille de styles. Ce module se charge ensuite de la
 * bascule manuelle depuis le profil.
 *
 * @author BANGA Romaric
 */

const CLE_STOCKAGE = 'mbolo.theme';

export type ModeTheme = 'auto' | 'light' | 'dark';

function estModeValide(valeur: unknown): valeur is ModeTheme {
  return valeur === 'auto' || valeur === 'light' || valeur === 'dark';
}

/**
 * @return le mode actif persisté dans {@code localStorage}, ou
 *         {@code 'auto'} par défaut.
 */
export function modeCourant(): ModeTheme {
  try {
    const stocke = localStorage.getItem(CLE_STOCKAGE);
    return estModeValide(stocke) ? stocke : 'auto';
  } catch {
    return 'auto';
  }
}

/**
 * Applique un mode de thème : pose l'attribut {@code data-theme} sur
 * {@code <html>} (sauf {@code 'auto'} qui le supprime pour laisser
 * {@code @media} agir) et persiste la préférence dans {@code localStorage}.
 *
 * Émet {@code mbolo-theme-change} sur {@code window} pour permettre aux
 * composants abonnés (ex. page profil) de se mettre à jour.
 *
 * @param mode mode souhaité.
 */
export function appliquer(mode: ModeTheme): void {
  const html = document.documentElement;
  if (mode === 'auto') {
    html.removeAttribute('data-theme');
  } else {
    html.setAttribute('data-theme', mode);
  }
  try {
    localStorage.setItem(CLE_STOCKAGE, mode);
  } catch {
    /* no-op */
  }
  window.dispatchEvent(new CustomEvent('mbolo-theme-change', { detail: { mode } }));
}

/**
 * Initialise le thème au démarrage. À appeler avant le premier rendu pour
 * cohérence avec le script anti-FOUC injecté en {@code <head>}.
 */
export function initialiser(): void {
  appliquer(modeCourant());
}
