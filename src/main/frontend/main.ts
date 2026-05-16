/**
 * Bootstrap du frontend MboloPay.
 *
 * <ul>
 *   <li>Enregistre les composants Material Web utilisés par l'app.</li>
 *   <li>Importe les atoms, molécules et organisms MboloPay
 *       (auto-enregistrement via {@code @customElement}).</li>
 *   <li>Importe les pages cibles du routeur.</li>
 *   <li>Initialise le thème (anti-FOUC déjà appliqué par script inline
 *       en {@code <head>}, ici on (re)synchronise depuis localStorage).</li>
 *   <li>Insère le toast singleton dans le DOM.</li>
 *   <li>Démarre le routeur URLPattern sur l'outlet du shell.</li>
 * </ul>
 *
 * @author BANGA Romaric
 */

// Material Web — composants utilisés
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/progress/circular-progress.js';
import '@material/web/iconbutton/icon-button.js';

// Atoms MboloPay
import './components/atoms/mbolo-icon.js';
import './components/atoms/mbolo-montant-fcfa.js';
import './components/atoms/mbolo-numero-gabonais.js';
import './components/atoms/mbolo-spinner.js';
import './components/atoms/mbolo-badge.js';
import './components/atoms/mbolo-button.js';
import './components/atoms/mbolo-skeleton.js';
import './components/atoms/mbolo-domain-event-badge.js';
import './components/atoms/mbolo-port-indicator.js';
import './components/atoms/mbolo-fab-inspector.js';

// Molécules
import './components/molecules/mbolo-toast.js';
import './components/molecules/mbolo-empty-state.js';
import './components/molecules/mbolo-sheet-operation.js';
import './components/molecules/mbolo-onboarding.js';
import './components/molecules/mbolo-concept-card.js';
import './components/molecules/mbolo-flow-step.js';
import './components/molecules/mbolo-vo-hint.js';
import './components/molecules/mbolo-error-annotation.js';

// Organisms
import './components/organisms/mbolo-top-app-bar.js';
import './components/organisms/mbolo-bottom-tab-bar.js';
import './components/organisms/mbolo-app-shell.js';
import './components/organisms/mbolo-balance-card.js';
import './components/organisms/mbolo-operation-item.js';
import './components/organisms/mbolo-inspector-drawer.js';
import './components/organisms/mbolo-slow-mo-overlay.js';

// Pages
import './pages/page-accueil.js';
import './pages/page-creer-abonne.js';
import './pages/page-historique.js';
import './pages/page-profil.js';
import './pages/page-evenements-domaine.js';
import './pages/page-architecture.js';
import './pages/page-erreur-404.js';

import type { LitElement } from 'lit';
import { configurerRouteur } from './router.js';
import { initialiser as initialiserTheme } from './lib/theme.js';
import { rafraichirDepuisBackend as rafraichirSession } from './lib/session-abonne.js';
import { aDejaVu as onboardingDejaVu } from './lib/onboarding.js';

/**
 * Initialise le thème, rafraîchit la session contre le backend, injecte le toast
 * singleton et démarre le routeur.
 *
 * Important : {@code mbolo-app-shell} (Lit, light DOM) rend son template —
 * dont {@code <main id="outlet">} — de manière asynchrone via une microtask.
 * Lancer le routeur trop tôt produirait
 * "Élément #outlet introuvable". On attend donc explicitement la définition
 * du custom element puis son premier {@code updateComplete}.
 *
 * Le rafraîchissement de session contre le backend est volontairement bloquant
 * (timeout dur de 3 s côté lib) : on veut un état session cohérent avant le
 * premier rendu de page. Si l'abonné stocké n'existe plus côté serveur (404),
 * la session est nettoyée silencieusement, évitant un état zombie en UI.
 */
async function bootstrap(): Promise<void> {
  initialiserTheme();
  await rafraichirSession();

  if (!document.querySelector('mbolo-toast')) {
    document.body.appendChild(document.createElement('mbolo-toast'));
  }

  await customElements.whenDefined('mbolo-app-shell');
  const shell = document.querySelector('mbolo-app-shell') as LitElement | null;
  if (shell && 'updateComplete' in shell) {
    await shell.updateComplete;
  }

  configurerRouteur();

  // Onboarding au premier lancement uniquement (après route active pour
  // éviter qu'un crash du shell masque la modale).
  if (!onboardingDejaVu()) {
    document.body.appendChild(document.createElement('mbolo-onboarding'));
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => void bootstrap(), { once: true });
} else {
  void bootstrap();
}
