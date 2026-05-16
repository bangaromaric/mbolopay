/**
 * Mini routeur SPA basé sur l'API native {@link URLPattern}
 * (Baseline 2025 — supportée par tous les navigateurs modernes).
 *
 * Remplace {@code @vaadin/router} (déprécié officiellement par Vaadin).
 *
 * Quatre points d'entrée publics :
 * <ul>
 *   <li>{@link configurerRouteur} — démarre le routeur, à appeler une seule fois.</li>
 *   <li>{@link navigate} — navigation programmatique, équivalent de l'ancien `Router.go`.</li>
 *   <li>{@link trouverComposant} — résolution URL → nom de custom element,
 *       exporté pour permettre des tests unitaires futurs.</li>
 *   <li>Émission de {@code mbolo-route-change} sur {@code window} après chaque
 *       rendu pour que les composants externes (shell, tab bar) réagissent
 *       à la route active.</li>
 * </ul>
 *
 * Le routeur intercepte aussi les clics sur les `<a href>` internes (même
 * origine, sans extension de fichier, sans modificateur ni `target="_blank"`)
 * pour les transformer en navigation SPA, ce qui évite de devoir réécrire
 * tous les liens dans le HTML.
 *
 * Pour les autres composants qui souhaitent demander une navigation sans
 * importer ce module directement, ils peuvent émettre
 * {@code window.dispatchEvent(new CustomEvent('mbolo-navigate', { detail: { path } }))}
 * et le routeur prendra le relais.
 *
 * @author BANGA Romaric
 */

interface RouteDef {
  readonly pattern: URLPattern;
  readonly component: string;
}

const ROUTES: readonly RouteDef[] = [
  { pattern: new URLPattern({ pathname: '/' }),                     component: 'page-accueil' },
  { pattern: new URLPattern({ pathname: '/creer-abonne' }),         component: 'page-creer-abonne' },
  { pattern: new URLPattern({ pathname: '/historique' }),           component: 'page-historique' },
  { pattern: new URLPattern({ pathname: '/profil' }),               component: 'page-profil' },
  { pattern: new URLPattern({ pathname: '/evenements-domaine' }),   component: 'page-evenements-domaine' },
  { pattern: new URLPattern({ pathname: '/architecture' }),         component: 'page-architecture' },
];

const FALLBACK = 'page-erreur-404';

let outlet: HTMLElement | null = null;

/**
 * Démarre le routeur en résolvant l'outlet depuis le shell d'application.
 * Le shell est rendu en <b>light DOM</b> ({@code mbolo-app-shell}), donc
 * {@code #outlet} est accessible directement via {@code document.querySelector}.
 *
 * Idempotent : un second appel est ignoré.
 *
 * @throws Error si {@code #outlet} est introuvable dans le DOM (le shell n'a
 *               pas encore été monté, ou {@code index.html} est mal formé).
 */
export function configurerRouteur(): void {
  if (outlet) return;
  const el = document.querySelector<HTMLElement>('#outlet');
  if (!el) {
    throw new Error('Élément #outlet introuvable — vérifier index.html / mbolo-app-shell');
  }
  outlet = el;
  window.addEventListener('popstate', rendre);
  document.addEventListener('click', intercepterClicLien);
  window.addEventListener('mbolo-navigate', (evt: Event) => {
    const path = (evt as CustomEvent<{ path: string }>).detail?.path;
    if (path) navigate(path);
  });
  rendre();
}

/**
 * Navigation programmatique. Met à jour l'URL via `history.pushState` puis
 * re-rend l'outlet. No-op si le path est déjà l'URL courante (évite les
 * entrées d'historique en double sur double-clic).
 *
 * @param path chemin absolu cible (ex. `/creer-abonne` ou `/?q=foo`).
 */
export function navigate(path: string): void {
  const courant = window.location.pathname + window.location.search;
  if (path === courant) return;
  window.history.pushState({}, '', path);
  rendre();
}

/**
 * Résolution pure URL → nom du custom element à monter. Exporté uniquement
 * pour la testabilité (déterministe, sans effet de bord).
 *
 * @param url URL absolue à matcher.
 * @return nom du custom element (entrée de {@link ROUTES} ou {@link FALLBACK}).
 */
export function trouverComposant(url: URL): string {
  for (const route of ROUTES) {
    if (route.pattern.test(url)) return route.component;
  }
  return FALLBACK;
}

function rendre(): void {
  if (!outlet) return;
  const nom = trouverComposant(new URL(window.location.href));
  const nouveau = document.createElement(nom);

  const motionReduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  outlet.replaceChildren(nouveau);
  if (!motionReduit && typeof outlet.animate === 'function') {
    outlet.animate(
      [
        { opacity: 0, transform: 'translateY(4px)' },
        { opacity: 1, transform: 'none' },
      ],
      { duration: 240, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
    );
  }

  window.dispatchEvent(
    new CustomEvent('mbolo-route-change', {
      detail: { path: window.location.pathname },
    }),
  );
}

function intercepterClicLien(evenement: MouseEvent): void {
  if (evenement.defaultPrevented) return;
  if (evenement.button !== 0) return;
  if (evenement.metaKey || evenement.ctrlKey || evenement.shiftKey || evenement.altKey) return;

  const cible = (evenement.target as Element | null)?.closest('a');
  if (!cible || !cible.href) return;
  if (cible.target && cible.target !== '_self') return;
  if (cible.hasAttribute('download')) return;
  if (cible.getAttribute('rel') === 'external') return;
  if (cible.getAttribute('aria-disabled') === 'true') return;

  const urlCible = new URL(cible.href, window.location.origin);
  if (urlCible.origin !== window.location.origin) return;
  // Path contenant un point = asset (.js, .css, .woff2, .svg…). On ne l'intercepte pas.
  if (urlCible.pathname.includes('.')) return;

  evenement.preventDefault();
  navigate(urlCible.pathname + urlCible.search);
}
