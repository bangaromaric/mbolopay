import type { Cycle } from './cycles.js';
import { estActif as modePedagogiqueActif } from './mode-pedagogique.js';
import { estActif as slowMoActif } from './mode-slow-mo.js';
import type { MboloSlowMoOverlay } from '../components/organisms/mbolo-slow-mo-overlay.js';

/**
 * Orchestrateur du mode slow-mo : compose l'overlay animé et l'appel HTTP
 * réel en parallèle pour que l'étudiant ait le temps de voir la traversée
 * des couches pendant que l'opération s'exécute côté serveur.
 *
 * <p>Stratégie :
 * <ol>
 *   <li>Si <em>mode pédagogique OFF</em> ou <em>slow-mo OFF</em> →
 *       court-circuit, exécution directe de {@code apiCall} (overhead nul).</li>
 *   <li>Sinon :
 *     <ol>
 *       <li>Monte un {@code <mbolo-slow-mo-overlay>} sur {@code document.body}.</li>
 *       <li>Lance {@code apiCall()} <b>en parallèle</b> de l'animation.</li>
 *       <li>Attend que soit l'animation soit terminée naturellement, soit
 *           l'utilisateur ait demandé à « passer » (Esc / bouton Passer).</li>
 *       <li>Attend ensuite la réponse réelle de l'API.</li>
 *       <li>Joue le check de réussite (300ms) + fade-out (200ms).</li>
 *       <li>Démonte l'overlay et propage la réponse au caller.</li>
 *     </ol>
 *   </li>
 * </ol>
 *
 * <p>En cas d'erreur API, l'overlay se ferme immédiatement (fade-out
 * 200ms) et l'erreur est rejetée au caller, qui prend le relais via sa
 * gestion d'erreur existante (banner inline, mbolo-error-annotation,
 * toast).
 *
 * <p>Le FAB Inspector est temporairement masqué pendant l'animation pour
 * éviter le clutter visuel.
 *
 * @author BANGA Romaric
 */

const SELECTEUR_FAB_INSPECTOR = 'mbolo-fab-inspector';

/**
 * Exécute {@code apiCall} en l'enveloppant — si les conditions sont
 * réunies — d'une animation slow-mo des étapes décrites par {@code cycle}.
 *
 * @param cycle séquence pédagogique à mettre en scène (voir {@code lib/cycles.ts}).
 * @param apiCall fonction sans argument retournant la promesse de l'appel HTTP.
 * @return la valeur résolue par {@code apiCall}, propagée telle quelle.
 */
export async function executerAvecSlowMo<T>(
  cycle: Cycle,
  apiCall: () => Promise<T>,
): Promise<T> {
  if (!modePedagogiqueActif() || !slowMoActif()) {
    return apiCall();
  }

  const overlay = monterOverlay(cycle);
  masquerFabInspector();

  // Lancement en parallèle : l'animation se joue pendant que le serveur
  // traite la requête. Promise.race entre fin naturelle et "Passer".
  const apiPromise = apiCall();

  try {
    await Promise.race([overlay.animationTerminee, overlay.passerDemande]);
    const reponse = await apiPromise;
    await overlay.fermerAvecSuccess();
    return reponse;
  } catch (cause) {
    await overlay.fermerAvecErreur();
    throw cause;
  } finally {
    overlay.demonter();
    reafficherFabInspector();
  }
}

function monterOverlay(cycle: Cycle): MboloSlowMoOverlay {
  const existant = document.querySelector('mbolo-slow-mo-overlay');
  if (existant) existant.remove();
  const overlay = document.createElement('mbolo-slow-mo-overlay') as MboloSlowMoOverlay;
  overlay.cycle = cycle;
  document.body.appendChild(overlay);
  return overlay;
}

function masquerFabInspector(): void {
  const fab = document.querySelector(SELECTEUR_FAB_INSPECTOR) as HTMLElement | null;
  if (fab) fab.style.display = 'none';
}

function reafficherFabInspector(): void {
  const fab = document.querySelector(SELECTEUR_FAB_INSPECTOR) as HTMLElement | null;
  if (fab) fab.style.display = '';
}
