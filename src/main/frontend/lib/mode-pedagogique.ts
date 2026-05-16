/**
 * Gestion de la préférence « mode pédagogique » (charte §7.3, §9.3).
 *
 * Le mode pédagogique expose discrètement les éléments DDD/Hexa/Modulith de
 * MboloPay : badges de bounded context dans la barre supérieure, page des
 * événements de domaine accessible depuis le profil, indicateur de port
 * appelé au survol des actions. Le mode est <b>désactivé par défaut</b> :
 * la charte §9.3 stipule que le jargon technique ne doit jamais être imposé
 * à un utilisateur final.
 *
 * Persistance dans {@code localStorage} sous la clé {@code mbolo.pedagogique}
 * (string {@code "true"} | {@code "false"}). Toute mutation émet
 * {@code window.dispatchEvent('mbolo-mode-pedagogique-change')} pour que les
 * composants abonnés se re-rendent.
 *
 * @author BANGA Romaric
 */

const CLE_STOCKAGE = 'mbolo.pedagogique';

/**
 * @return {@code true} si le mode pédagogique est actif pour la session
 *         courante.
 */
export function estActif(): boolean {
  try {
    return localStorage.getItem(CLE_STOCKAGE) === 'true';
  } catch {
    return false;
  }
}

/**
 * Active ou désactive le mode pédagogique. Émet
 * {@code mbolo-mode-pedagogique-change} sur {@code window}.
 *
 * @param actif nouvel état souhaité.
 */
export function definir(actif: boolean): void {
  try {
    localStorage.setItem(CLE_STOCKAGE, String(actif));
  } catch {
    /* localStorage indisponible (mode privé strict) : no-op silencieux. */
  }
  window.dispatchEvent(new CustomEvent('mbolo-mode-pedagogique-change', { detail: { actif } }));
}

/**
 * Inverse l'état courant du mode pédagogique.
 *
 * @return le nouvel état après bascule.
 */
export function basculer(): boolean {
  const nouveau = !estActif();
  definir(nouveau);
  return nouveau;
}
