import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { Cycle, CoucheHexa, EtapeCycle } from '../../lib/cycles.js';
import * as modeSlowMo from '../../lib/mode-slow-mo.js';
import type { Vitesse } from '../../lib/mode-slow-mo.js';
import { lienSource } from '../../lib/sources.js';

/**
 * Indique l'état global de l'animation slow-mo.
 */
type EtatOverlay = 'jeu' | 'succes' | 'erreur';

/**
 * Description visuelle d'une couche hexagonale dans la coupe.
 */
interface DescripteurCouche {
  readonly id: CoucheHexa;
  readonly nom: string;
  readonly sous: string;
  readonly icone: string;
  readonly libelleFr: string;
}

const COUCHES: readonly DescripteurCouche[] = [
  {
    id: 'primary',
    nom: 'Primary',
    sous: 'adaptateurs entrants — REST, listeners',
    icone: 'globe',
    libelleFr: 'Primary',
  },
  {
    id: 'application',
    nom: 'Application',
    sous: 'services applicatifs POJO — orchestration',
    icone: 'cpu',
    libelleFr: 'Application',
  },
  {
    id: 'domain',
    nom: 'Domain',
    sous: 'agrégats, value objects, événements',
    icone: 'star',
    libelleFr: 'Domain',
  },
  {
    id: 'secondary',
    nom: 'Secondary',
    sous: 'adaptateurs sortants — JPA, transactions',
    icone: 'database',
    libelleFr: 'Secondary',
  },
];

/**
 * Position du rail vertical lumineux (en pourcentage de la hauteur de la
 * coupe) en fonction de la couche active.
 */
const POSITION_RAIL: Readonly<Record<CoucheHexa, number>> = {
  primary: 12.5,
  application: 37.5,
  domain: 62.5,
  secondary: 87.5,
};

/**
 * Overlay plein écran qui met en scène, étape par étape, la traversée
 * des couches hexagonales par une opération métier.
 *
 * <p>Métaphore visuelle : <b>Coupe Hexa horizontale</b>. Quatre bandes
 * empilées (Primary entrée / Application / Domain / Secondary) avec :
 * <ul>
 *   <li>fonds colorés permanents par couche (bleu / orange / or / gris-bleu) ;</li>
 *   <li>icône représentative et titre typographiquement fort ;</li>
 *   <li>composant marqué dans la bande d'origine — un seul à la fois ;</li>
 *   <li>flèche directionnelle « ↓ vers X » quand l'étape transite vers
 *       une autre couche ;</li>
 *   <li>rail vertical lumineux à gauche indiquant la couche active.</li>
 * </ul>
 *
 * <p>À droite, une <b>carte détail spotlight</b> affiche le numéro
 * d'étape grand format, le titre, la description et le lien GitHub.
 *
 * <p>L'overlay est piloté par {@link executerAvecSlowMo} : il joue
 * l'animation à la vitesse persistée pendant que l'appel HTTP réel
 * s'exécute en parallèle.
 *
 * <p>Contrôles clavier :
 * <ul>
 *   <li>{@code Espace} — pause / reprise ;</li>
 *   <li>{@code →} — étape suivante (met en pause) ;</li>
 *   <li>{@code ←} — étape précédente (replay) ;</li>
 *   <li>{@code Esc} — passer entièrement (l'API continue).</li>
 * </ul>
 *
 * <p>Effets spéciaux :
 * <ul>
 *   <li>{@code event-publie} — icône {@code zap} dorée pulsante sur le
 *       composant marqué ;</li>
 *   <li>{@code cross-module} — bandeau « Cross-module → portefeuille »
 *       qui glisse depuis le haut + teinte de fond globale virant au
 *       vert subtil ;</li>
 *   <li>{@code http-final} — check vert plein écran à la résolution
 *       succès.</li>
 * </ul>
 *
 * <p>Empilement z-index : 1900 — sous l'onboarding (2000), au-dessus
 * du drawer Inspector (1500) et des toasts (1000).
 *
 * @author BANGA Romaric
 */
@customElement('mbolo-slow-mo-overlay')
export class MboloSlowMoOverlay extends LitElement {
  @property({ attribute: false }) accessor cycle: Cycle | null = null;

  @state() private accessor indexCourant = 0;
  @state() private accessor enPause = false;
  @state() private accessor vitesseLocale: Vitesse = modeSlowMo.vitesse();
  @state() private accessor etat: EtatOverlay = 'jeu';
  @state() private accessor afficherCheckFinal = false;
  @state() private accessor bannerCrossModuleVisible = false;

  /**
   * Promesse résolue quand l'animation a parcouru toutes les étapes
   * naturellement (sans intervention "Passer").
   */
  public readonly animationTerminee: Promise<void>;
  private resoudreAnimation!: () => void;

  /**
   * Promesse résolue quand l'utilisateur a explicitement demandé à
   * passer l'animation (touche Esc ou bouton Passer).
   */
  public readonly passerDemande: Promise<void>;
  private resoudrePasser!: () => void;

  private timerEtape: ReturnType<typeof setTimeout> | null = null;
  private timerBanner: ReturnType<typeof setTimeout> | null = null;
  private dejaResolu = false;
  private dernierIndexCrossModule = -1;

  constructor() {
    super();
    this.animationTerminee = new Promise<void>((resolve) => {
      this.resoudreAnimation = resolve;
    });
    this.passerDemande = new Promise<void>((resolve) => {
      this.resoudrePasser = resolve;
    });
  }

  static styles = css`
    :host {
      position: fixed;
      inset: 0;
      z-index: 1900;
      display: block;
      pointer-events: auto;
      animation: fade-in var(--duration-quick) var(--easing-standard);
      --rail-top: 12.5%;
    }
    .voile {
      position: absolute;
      inset: 0;
      background: rgb(11 20 27 / 0.65);
      backdrop-filter: blur(2px);
    }
    .conteneur {
      position: absolute;
      inset: 0;
      display: grid;
      grid-template-rows: auto 1fr auto;
      max-width: 1320px;
      margin: 0 auto;
      padding: var(--space-5);
      gap: var(--space-4);
      transition: background-color var(--duration-moderate) var(--easing-emphasized);
    }
    :host([bc-actif="portefeuille"]) .conteneur {
      background: linear-gradient(180deg, transparent 0%, rgb(34 197 94 / 0.06) 100%);
    }

    /* ──────────────────────────── HEADER ──────────────────────────── */
    header.barre {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-4) var(--space-5);
      background: var(--color-bg-surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
    }
    .barre-titre {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }
    .barre-titre h2 {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
      margin: 0;
      letter-spacing: -0.015em;
    }
    .barre-titre .sous-titre {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      font-family: var(--font-family-mono);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .barre-titre .fleche-couches {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 2px 8px;
      background: var(--brand-primary-50);
      color: var(--brand-primary-700);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      font-family: var(--font-family-mono);
      margin-left: var(--space-2);
    }
    .btn-fermer {
      all: unset;
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--color-text-secondary);
      transition: background-color var(--duration-quick) var(--easing-standard);
    }
    .btn-fermer:hover {
      background: var(--color-bg-subtle);
      color: var(--color-text-primary);
    }
    .btn-fermer:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
    }

    /* ───────────────────────── BANNER CROSS-MODULE ───────────────────────── */
    .banner-cross {
      position: absolute;
      top: var(--space-3);
      left: 50%;
      transform: translateX(-50%);
      padding: var(--space-2) var(--space-4);
      background: linear-gradient(90deg, #3b82f6, #22c55e);
      color: white;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      border-radius: var(--radius-full);
      box-shadow: var(--shadow-lg);
      animation: slide-from-top 0.5s var(--easing-emphasized);
      z-index: 1;
      pointer-events: none;
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
    }
    @keyframes slide-from-top {
      from { opacity: 0; transform: translate(-50%, -120%); }
      to   { opacity: 1; transform: translate(-50%, 0); }
    }

    /* ────────────────────────────── SCENE ────────────────────────────── */
    .scene {
      display: grid;
      grid-template-columns: 32px minmax(0, 1.4fr) minmax(300px, 1fr);
      gap: var(--space-3);
      min-height: 0;
    }

    /* ─────────────────────── RAIL VERTICAL LUMINEUX ─────────────────────── */
    .rail {
      position: relative;
      width: 32px;
    }
    .rail::before {
      content: '';
      position: absolute;
      left: 50%;
      top: 0;
      bottom: 0;
      width: 2px;
      background: var(--color-border-subtle);
      transform: translateX(-50%);
      border-radius: 1px;
    }
    .rail .point {
      position: absolute;
      left: 50%;
      top: var(--rail-top);
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--brand-primary-500);
      box-shadow: 0 0 0 4px var(--brand-primary-100), 0 0 24px var(--brand-primary-500);
      transform: translate(-50%, -50%);
      transition:
        top 600ms var(--easing-emphasized),
        background-color 600ms var(--easing-emphasized);
      animation: pulse-point 1.8s ease-in-out infinite;
    }
    @keyframes pulse-point {
      0%, 100% { box-shadow: 0 0 0 4px var(--brand-primary-100), 0 0 24px var(--brand-primary-500); }
      50% { box-shadow: 0 0 0 6px var(--brand-primary-100), 0 0 36px var(--brand-primary-400); }
    }

    /* ─────────────────────────────── COUPE ─────────────────────────────── */
    .coupe {
      display: grid;
      grid-template-rows: repeat(4, 1fr);
      gap: var(--space-2);
      min-height: 0;
      overflow-y: auto;
    }

    /* ────────────────────────────── BANDE ────────────────────────────── */
    .bande {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-lg);
      border-left: 6px solid transparent;
      box-shadow: var(--shadow-xs);
      opacity: 0.55;
      filter: saturate(0.55);
      transition:
        opacity var(--duration-moderate) var(--easing-emphasized),
        transform var(--duration-moderate) var(--easing-emphasized),
        box-shadow var(--duration-moderate) var(--easing-emphasized),
        filter var(--duration-moderate) var(--easing-emphasized);
      will-change: transform;
    }
    .bande.prechauffee {
      opacity: 0.85;
      filter: saturate(0.85);
    }
    .bande.active {
      opacity: 1;
      filter: saturate(1);
      transform: scale(1.005);
      box-shadow: var(--shadow-xl);
    }

    .bande[data-couche="primary"] {
      background: #eff6ff;
      border-left-color: #3b82f6;
    }
    .bande[data-couche="application"] {
      background: #fff7ed;
      border-left-color: #f97316;
    }
    .bande[data-couche="domain"] {
      background: #fefce8;
      border-left-color: #eab308;
    }
    .bande[data-couche="secondary"] {
      background: #f1f5f9;
      border-left-color: #64748b;
    }
    @media (prefers-color-scheme: dark) {
      .bande[data-couche="primary"]     { background: rgb(59 130 246 / 0.14); }
      .bande[data-couche="application"] { background: rgb(249 115 22 / 0.12); }
      .bande[data-couche="domain"]      { background: rgb(234 179 8 / 0.12); }
      .bande[data-couche="secondary"]   { background: rgb(100 116 139 / 0.16); }
    }

    .bande-titre {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      justify-content: space-between;
    }
    .bande-titre .titre-gauche {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
    }
    .bande-titre h3 {
      margin: 0;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-bold);
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--color-text-primary);
    }
    .bande[data-couche="primary"] .bande-icone     { color: #3b82f6; }
    .bande[data-couche="application"] .bande-icone { color: #f97316; }
    .bande[data-couche="domain"] .bande-icone      { color: #ca8a04; }
    .bande[data-couche="secondary"] .bande-icone   { color: #64748b; }
    .bande-titre .sous {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      font-style: italic;
      text-align: right;
    }

    /* ────────────────────────── COMPOSANTS ────────────────────────── */
    .composants {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      align-items: center;
    }
    .composant {
      position: relative;
      padding: var(--space-2) var(--space-3);
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-md);
      font-family: var(--font-family-mono);
      font-size: var(--font-size-xs);
      color: var(--color-text-primary);
      transition:
        background-color var(--duration-quick) var(--easing-standard),
        transform var(--duration-quick) var(--easing-standard),
        box-shadow var(--duration-quick) var(--easing-standard);
    }
    .composant.marque {
      background: var(--brand-primary-500);
      color: white;
      border-color: var(--brand-primary-700);
      box-shadow: 0 0 0 3px var(--brand-primary-200), 0 0 40px rgb(59 130 246 / 0.5);
      transform: scale(1.06);
      font-weight: var(--font-weight-semibold);
      animation: pulse-marque 1.8s ease-in-out infinite;
    }
    .composant.marque .drapeau-coin {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 22px;
      height: 22px;
      background: #facc15;
      color: #422006;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-sm);
    }
    .composant.marque.event-publie {
      background: linear-gradient(135deg, #facc15, #eab308);
      color: #422006;
      animation: pulse-event 0.8s ease-out infinite;
    }
    .composant.marque .zap-coin {
      position: absolute;
      top: -10px;
      right: -10px;
      width: 26px;
      height: 26px;
      background: #fde047;
      color: #422006;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 0 3px #fef3c7, 0 0 24px #fde047;
      animation: pulse-zap 0.8s ease-in-out infinite;
    }
    @keyframes pulse-marque {
      0%, 100% { box-shadow: 0 0 0 3px var(--brand-primary-200), 0 0 40px rgb(59 130 246 / 0.5); }
      50% { box-shadow: 0 0 0 5px var(--brand-primary-100), 0 0 56px rgb(59 130 246 / 0.7); }
    }
    @keyframes pulse-event {
      0%, 100% { box-shadow: 0 0 0 3px #fef3c7, 0 0 40px #facc15; transform: scale(1.06); }
      50% { box-shadow: 0 0 0 6px #fde68a, 0 0 64px #eab308; transform: scale(1.10); }
    }
    @keyframes pulse-zap {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.15); }
    }

    /* ──────────────────────── FLÈCHE TRANSITION ──────────────────────── */
    .fleche-transit {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      background: var(--brand-primary-100);
      color: var(--brand-primary-700);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      font-family: var(--font-family-mono);
      animation: bounce-down 1.2s ease-in-out infinite;
    }
    @keyframes bounce-down {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(4px); }
    }

    /* ────────────────────── CARTE DÉTAIL SPOTLIGHT ────────────────────── */
    .detail {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      padding: var(--space-5);
      background: var(--color-bg-surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      min-width: 0;
      overflow-y: auto;
    }
    .detail-numero {
      display: inline-flex;
      align-items: baseline;
      gap: var(--space-1);
      align-self: flex-start;
      padding: var(--space-2) var(--space-3);
      background: var(--brand-primary-50);
      color: var(--brand-primary-700);
      border-radius: var(--radius-lg);
      font-family: var(--font-family-mono);
      font-weight: var(--font-weight-bold);
      font-variant-numeric: tabular-nums;
      line-height: 1;
    }
    .detail-numero .grand {
      font-size: 40px;
      letter-spacing: -0.02em;
    }
    .detail-numero .petit {
      font-size: var(--font-size-md);
      opacity: 0.6;
    }
    .detail h3 {
      margin: 0;
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
      letter-spacing: -0.015em;
      line-height: 1.2;
    }
    .detail .etiquette {
      font-family: var(--font-family-mono);
      font-size: var(--font-size-sm);
      color: var(--brand-primary-700);
      background: var(--brand-primary-50);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-md);
      align-self: flex-start;
    }
    .detail p {
      margin: 0;
      font-size: var(--font-size-base);
      color: var(--color-text-secondary);
      line-height: 1.6;
    }
    .detail .badges {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      margin-top: var(--space-2);
    }
    .badge-bc {
      padding: 4px var(--space-2);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
    }
    .badge-bc[data-bc="identite"]     { background: #dbeafe; color: #1d4ed8; }
    .badge-bc[data-bc="portefeuille"] { background: #dcfce7; color: #15803d; }
    .badge-effet {
      padding: 4px var(--space-2);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      background: #fef3c7;
      color: #854d0e;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .detail a.lien-github {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      margin-top: auto;
      padding: var(--space-3);
      background: var(--color-bg-subtle);
      border-radius: var(--radius-md);
      color: var(--color-text-primary);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      text-decoration: none;
      transition: background-color var(--duration-quick) var(--easing-standard);
    }
    .detail a.lien-github:hover {
      background: var(--brand-primary-50);
      color: var(--brand-primary-700);
    }

    /* ───────────────────────────── PIED ───────────────────────────── */
    .pied {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      padding: var(--space-4) var(--space-5);
      background: var(--color-bg-surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
    }
    .waypoints {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      flex-wrap: wrap;
    }
    .waypoint {
      all: unset;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: var(--color-bg-canvas);
      border: 2px solid var(--color-border-strong);
      color: var(--color-text-secondary);
      font-size: 11px;
      font-weight: var(--font-weight-bold);
      font-variant-numeric: tabular-nums;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition:
        background-color var(--duration-quick) var(--easing-standard),
        border-color var(--duration-quick) var(--easing-standard),
        color var(--duration-quick) var(--easing-standard),
        transform var(--duration-quick) var(--easing-standard);
      position: relative;
      z-index: 1;
    }
    .waypoint:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
    }
    .waypoint.passee {
      background: var(--brand-primary-500);
      border-color: var(--brand-primary-500);
      color: white;
    }
    .waypoint.active {
      background: var(--brand-primary-500);
      border-color: var(--brand-primary-700);
      color: white;
      transform: scale(1.3);
      box-shadow: 0 0 0 4px var(--brand-primary-100), 0 0 24px var(--brand-primary-400);
      animation: pulse-waypoint 1.8s ease-in-out infinite;
    }
    @keyframes pulse-waypoint {
      0%, 100% { box-shadow: 0 0 0 4px var(--brand-primary-100), 0 0 24px var(--brand-primary-400); }
      50% { box-shadow: 0 0 0 6px var(--brand-primary-100), 0 0 36px var(--brand-primary-500); }
    }
    .lien-waypoints {
      flex: 1;
      max-width: 32px;
      height: 2px;
      background: var(--color-border-strong);
      margin: 0 -2px;
      z-index: 0;
    }
    .lien-waypoints.passee {
      background: var(--brand-primary-500);
    }
    .lien-waypoints.pointille {
      background: repeating-linear-gradient(
        to right,
        var(--color-border-strong) 0 4px,
        transparent 4px 8px
      );
    }

    /* ────────────────────────── CONTRÔLES ────────────────────────── */
    .controles {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-3);
      justify-content: space-between;
    }
    .controles-gauche, .controles-droite {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-wrap: wrap;
    }
    .btn {
      all: unset;
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-md);
      background: var(--color-bg-subtle);
      color: var(--color-text-primary);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      transition: background-color var(--duration-quick) var(--easing-standard);
      min-height: 36px;
    }
    .btn:hover {
      background: var(--brand-primary-50);
      color: var(--brand-primary-700);
    }
    .btn:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
    }
    .btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .btn.tertiaire {
      background: transparent;
      border: 1px solid var(--color-border-strong);
      color: var(--color-text-secondary);
    }
    .btn.tertiaire:hover {
      background: var(--color-bg-subtle);
      color: var(--color-text-primary);
    }
    .vitesses {
      display: flex;
      gap: 2px;
      align-items: center;
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      background: var(--color-bg-subtle);
      padding: 3px;
      border-radius: var(--radius-md);
    }
    .vitesses .chip {
      all: unset;
      padding: 4px var(--space-3);
      border-radius: var(--radius-md);
      cursor: pointer;
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      font-weight: var(--font-weight-medium);
      transition: background-color var(--duration-quick) var(--easing-standard);
    }
    .vitesses .chip.active {
      background: var(--color-bg-surface);
      color: var(--brand-primary-700);
      font-weight: var(--font-weight-semibold);
      box-shadow: var(--shadow-xs);
    }
    .vitesses .chip:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
    }

    /* ─────────────────────────── CHECK FINAL ─────────────────────────── */
    .check-final {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      animation: check-in 400ms var(--easing-emphasized);
      z-index: 2;
    }
    .check-final .cercle {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      background: #22c55e;
      color: white;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 120px rgb(34 197 94 / 0.55);
    }
    @keyframes check-in {
      from { opacity: 0; transform: scale(0.6); }
      to   { opacity: 1; transform: scale(1); }
    }

    /* ─────────────────────────── A11Y ─────────────────────────── */
    .live-region {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
      border: 0;
    }
    .chip-mobile-couche {
      display: none;
    }

    /* ─────────────────────────── ANIMATIONS GLOBALES ─────────────────────────── */
    @keyframes fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    :host(.fermeture) {
      animation: fade-out var(--duration-quick) var(--easing-standard) forwards;
    }
    @keyframes fade-out {
      to { opacity: 0; }
    }

    /* ─────────────────────────── RESPONSIVE ─────────────────────────── */
    @media (max-width: 900px) {
      .scene {
        grid-template-columns: 1fr;
      }
      .rail {
        display: none;
      }
      .detail {
        max-height: 280px;
      }
      .chip-mobile-couche {
        display: inline-flex;
        align-items: center;
        gap: var(--space-1);
        padding: 4px var(--space-2);
        background: var(--brand-primary-100);
        color: var(--brand-primary-700);
        border-radius: var(--radius-full);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-semibold);
      }
    }
    @media (max-width: 480px) {
      .conteneur {
        padding: var(--space-3);
      }
      .detail-numero .grand {
        font-size: 32px;
      }
      .detail h3 {
        font-size: var(--font-size-lg);
      }
      .waypoint {
        width: 22px;
        height: 22px;
        font-size: 10px;
      }
    }

    /* ─────────────────────────── REDUCED MOTION ─────────────────────────── */
    @media (prefers-reduced-motion: reduce) {
      :host { animation: none; }
      .bande, .composant.marque, .waypoint.active, .check-final,
      .rail .point, .fleche-transit, .banner-cross {
        animation: none !important;
        transition: none !important;
      }
      .bande.active { transform: none; }
      .composant.marque { transform: none; }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.vitesseLocale = modeSlowMo.vitesse();
    document.addEventListener('keydown', this.surTouche);
    this.appliquerCoucheActive();
    this.planifierProchaine();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this.surTouche);
    this.annulerTimer();
    if (this.timerBanner !== null) {
      clearTimeout(this.timerBanner);
      this.timerBanner = null;
    }
  }

  updated(changes: Map<string, unknown>) {
    if (changes.has('indexCourant')) {
      this.appliquerCoucheActive();
      this.declencherEffetsTransition();
    }
  }

  /**
   * Met à jour la variable CSS pilotant la position du rail vertical et
   * l'attribut bc-actif (qui pilote la teinte de fond globale).
   */
  private appliquerCoucheActive() {
    const etape = this.etapeActive;
    if (!etape) return;
    const cible = etape.coucheArrivee ?? etape.couche;
    this.style.setProperty('--rail-top', `${POSITION_RAIL[cible]}%`);
    if (etape.boundedContext) {
      this.setAttribute('bc-actif', etape.boundedContext);
    } else {
      this.removeAttribute('bc-actif');
    }
  }

  /**
   * Déclenche le bandeau cross-module si l'étape courante a l'effet
   * dédié (et qu'on ne l'a pas déjà déclenché sur cet index).
   */
  private declencherEffetsTransition() {
    const etape = this.etapeActive;
    if (!etape) return;
    if (etape.effetSpecial === 'cross-module' && this.dernierIndexCrossModule !== this.indexCourant) {
      this.dernierIndexCrossModule = this.indexCourant;
      this.bannerCrossModuleVisible = true;
      if (this.timerBanner !== null) clearTimeout(this.timerBanner);
      this.timerBanner = setTimeout(() => {
        this.bannerCrossModuleVisible = false;
        this.timerBanner = null;
      }, 2000);
    }
  }

  /**
   * Joue l'animation de réussite : check vert plein écran + fade out.
   */
  public async fermerAvecSuccess(): Promise<void> {
    if (this.etat !== 'jeu') return;
    this.etat = 'succes';
    this.afficherCheckFinal = true;
    await new Promise<void>((resolve) => setTimeout(resolve, 700));
    this.classList.add('fermeture');
    await new Promise<void>((resolve) => setTimeout(resolve, 200));
  }

  /**
   * Ferme l'overlay immédiatement en cas d'erreur API.
   */
  public async fermerAvecErreur(): Promise<void> {
    if (this.etat !== 'jeu') return;
    this.etat = 'erreur';
    this.classList.add('fermeture');
    await new Promise<void>((resolve) => setTimeout(resolve, 200));
  }

  /**
   * Retire l'overlay du DOM.
   */
  public demonter(): void {
    this.annulerTimer();
    this.remove();
  }

  private get etapeActive(): EtapeCycle | null {
    if (!this.cycle) return null;
    return this.cycle.etapes[this.indexCourant] ?? null;
  }

  private get nbEtapes(): number {
    return this.cycle?.etapes.length ?? 0;
  }

  private surTouche = (evt: KeyboardEvent) => {
    if (this.etat !== 'jeu') return;
    switch (evt.key) {
      case 'Escape':
        evt.preventDefault();
        this.demanderPasser();
        return;
      case ' ':
        evt.preventDefault();
        this.basculerPause();
        return;
      case 'ArrowRight':
        evt.preventDefault();
        this.enPause = true;
        this.avancer(1);
        return;
      case 'ArrowLeft':
        evt.preventDefault();
        this.enPause = true;
        this.avancer(-1);
        return;
    }
  };

  private planifierProchaine() {
    this.annulerTimer();
    if (this.enPause || this.etat !== 'jeu') return;
    if (this.indexCourant >= this.nbEtapes - 1) {
      this.terminerNaturellement();
      return;
    }
    const delai = modeSlowMo.delaiMs();
    this.timerEtape = setTimeout(() => {
      if (this.enPause || this.etat !== 'jeu') return;
      this.indexCourant += 1;
      if (this.indexCourant >= this.nbEtapes - 1) {
        this.terminerNaturellement();
      } else {
        this.planifierProchaine();
      }
    }, delai);
  }

  private annulerTimer() {
    if (this.timerEtape !== null) {
      clearTimeout(this.timerEtape);
      this.timerEtape = null;
    }
  }

  private terminerNaturellement() {
    if (this.dejaResolu) return;
    this.dejaResolu = true;
    this.indexCourant = this.nbEtapes - 1;
    this.resoudreAnimation();
  }

  private basculerPause() {
    this.enPause = !this.enPause;
    if (!this.enPause) this.planifierProchaine();
    else this.annulerTimer();
  }

  private avancer(delta: number) {
    const nouveau = Math.max(0, Math.min(this.nbEtapes - 1, this.indexCourant + delta));
    this.indexCourant = nouveau;
    if (nouveau >= this.nbEtapes - 1 && delta > 0) {
      this.terminerNaturellement();
    } else if (!this.enPause) {
      this.planifierProchaine();
    }
  }

  private allerVers(index: number) {
    this.enPause = true;
    this.indexCourant = Math.max(0, Math.min(this.nbEtapes - 1, index));
  }

  private demanderPasser() {
    if (this.dejaResolu) return;
    this.dejaResolu = true;
    this.annulerTimer();
    this.resoudreAnimation();
    this.resoudrePasser();
  }

  private changerVitesse(v: Vitesse) {
    this.vitesseLocale = v;
    modeSlowMo.definirVitesse(v);
    this.planifierProchaine();
  }

  /**
   * Énumère les composants à afficher dans une bande donnée. Seuls les
   * composants dont la couche d'origine est `couche` sont listés — les
   * transitions (coucheArrivee) sont matérialisées par une flèche
   * directionnelle, pas par un dédoublement.
   */
  private composantsParCouche(couche: CoucheHexa): readonly string[] {
    if (!this.cycle) return [];
    const vus = new Set<string>();
    const resultat: string[] = [];
    for (const etape of this.cycle.etapes) {
      if (etape.couche === couche && !vus.has(etape.composantMarque)) {
        vus.add(etape.composantMarque);
        resultat.push(etape.composantMarque);
      }
    }
    return resultat;
  }

  render() {
    if (!this.cycle) return nothing;
    const etape = this.etapeActive;
    return html`
      <div class="voile" aria-hidden="true"></div>
      <div
        class="conteneur"
        role="dialog"
        aria-modal="true"
        aria-labelledby="slow-mo-titre"
      >
        ${this.bannerCrossModuleVisible
          ? html`
              <div class="banner-cross" role="status">
                <mbolo-icon name="arrow-right-left" .size=${16}></mbolo-icon>
                Cross-module → portefeuille
              </div>
            `
          : nothing}
        ${this.renduBarre()}
        <div class="scene">
          <div class="rail" aria-hidden="true">
            <div class="point"></div>
          </div>
          <div class="coupe">${this.renduBandes()}</div>
          ${this.renduDetail()}
        </div>
        ${this.renduPied()}
      </div>
      <div class="live-region" aria-live="polite">
        ${etape ? `Étape ${etape.numero} sur ${this.nbEtapes}. ${etape.titre}.` : ''}
      </div>
      ${this.afficherCheckFinal
        ? html`
            <div class="check-final" aria-hidden="true">
              <span class="cercle">
                <mbolo-icon name="check" .size=${80}></mbolo-icon>
              </span>
            </div>
          `
        : nothing}
    `;
  }

  private renduBarre() {
    const etape = this.etapeActive;
    const transition = etape?.coucheArrivee && etape.couche !== etape.coucheArrivee;
    return html`
      <header class="barre">
        <div class="barre-titre">
          <h2 id="slow-mo-titre">${this.cycle?.nomOperation ?? ''} — slow-mo</h2>
          <span class="sous-titre">
            Étape ${etape?.numero ?? 0} sur ${this.nbEtapes}
            ${transition
              ? html`<span class="fleche-couches">
                  ${etape!.couche} → ${etape!.coucheArrivee}
                </span>`
              : html`<span class="fleche-couches">${etape?.couche ?? ''}</span>`}
          </span>
        </div>
        <button
          class="btn-fermer"
          type="button"
          aria-label="Passer l'animation et fermer"
          @click=${() => this.demanderPasser()}
        >
          <mbolo-icon name="x" .size=${22}></mbolo-icon>
        </button>
      </header>
    `;
  }

  private renduBandes() {
    return html`${COUCHES.map((c) => this.renduBande(c))}`;
  }

  private renduBande(descripteur: DescripteurCouche) {
    if (!this.cycle) return nothing;
    const etape = this.etapeActive;
    const couche = descripteur.id;
    const active = etape?.couche === couche;
    const prechauffee = etape?.coucheArrivee === couche;
    const composants = this.composantsParCouche(couche);
    const marque = active ? etape?.composantMarque ?? null : null;
    const effet = active ? etape?.effetSpecial ?? null : null;
    const versCouche = active && etape?.coucheArrivee && etape.couche !== etape.coucheArrivee
      ? etape.coucheArrivee
      : null;
    const versDescripteur = versCouche ? COUCHES.find((c) => c.id === versCouche) : null;
    return html`
      <div
        class="bande ${active ? 'active' : ''} ${prechauffee ? 'prechauffee' : ''}"
        data-couche=${couche}
      >
        <div class="bande-titre">
          <div class="titre-gauche">
            <span class="bande-icone">
              <mbolo-icon name=${descripteur.icone} .size=${18}></mbolo-icon>
            </span>
            <h3>${descripteur.nom}</h3>
            ${active
              ? html`<span class="chip-mobile-couche">
                  <mbolo-icon name=${descripteur.icone} .size=${12}></mbolo-icon>
                  Couche active
                </span>`
              : nothing}
          </div>
          <span class="sous">${descripteur.sous}</span>
        </div>
        <div class="composants">
          ${composants.map((nomComposant) => {
            const estMarque = nomComposant === marque;
            const estEvent = estMarque && effet === 'event-publie';
            return html`
              <span class="composant ${estMarque ? 'marque' : ''} ${estEvent ? 'event-publie' : ''}">
                ${nomComposant}
                ${estEvent
                  ? html`<span class="zap-coin" aria-hidden="true">
                      <mbolo-icon name="zap" .size=${14}></mbolo-icon>
                    </span>`
                  : estMarque
                    ? html`<span class="drapeau-coin" aria-hidden="true">
                        <mbolo-icon name="flag" .size=${12}></mbolo-icon>
                      </span>`
                    : nothing}
              </span>
            `;
          })}
          ${versDescripteur
            ? html`<span class="fleche-transit" aria-hidden="true">
                <mbolo-icon name="arrow-down" .size=${14}></mbolo-icon>
                vers ${versDescripteur.libelleFr}
              </span>`
            : nothing}
        </div>
      </div>
    `;
  }

  private renduDetail() {
    const etape = this.etapeActive;
    if (!etape) return nothing;
    const lien = etape.sourceKey ? lienSource(etape.sourceKey) : null;
    return html`
      <aside class="detail" aria-label="Détail de l'étape">
        <div class="detail-numero">
          <span class="grand">${this.formatterNumero(etape.numero)}</span>
          <span class="petit">/ ${this.formatterNumero(this.nbEtapes)}</span>
        </div>
        <h3>${etape.titre}</h3>
        <span class="etiquette">${etape.etiquette}</span>
        <p>${etape.description}</p>
        <div class="badges">
          ${etape.boundedContext
            ? html`<span class="badge-bc" data-bc=${etape.boundedContext}>
                ${etape.boundedContext}
              </span>`
            : nothing}
          ${etape.effetSpecial === 'cross-module'
            ? html`<span class="badge-effet">
                <mbolo-icon name="arrow-right-left" .size=${10}></mbolo-icon>
                cross-module
              </span>`
            : nothing}
          ${etape.effetSpecial === 'event-publie'
            ? html`<span class="badge-effet">
                <mbolo-icon name="zap" .size=${10}></mbolo-icon>
                événement
              </span>`
            : nothing}
        </div>
        ${lien
          ? html`
              <a
                class="lien-github"
                href=${lien}
                target="_blank"
                rel="noopener noreferrer"
              >
                <mbolo-icon name="github" .size=${16}></mbolo-icon>
                Voir ${etape.composantMarque}.java
                <mbolo-icon name="external-link" .size=${14}></mbolo-icon>
              </a>
            `
          : nothing}
      </aside>
    `;
  }

  private renduPied() {
    return html`
      <footer class="pied">
        <div class="waypoints" role="tablist" aria-label="Aller à une étape">
          ${this.cycle?.etapes.map((e, idx) => {
            const passee = idx < this.indexCourant;
            const active = idx === this.indexCourant;
            const estDernier = idx === this.nbEtapes - 1;
            return html`
              <button
                class="waypoint ${active ? 'active' : ''} ${passee ? 'passee' : ''}"
                role="tab"
                aria-selected=${active ? 'true' : 'false'}
                aria-label=${`Étape ${e.numero} : ${e.titre}`}
                @click=${() => this.allerVers(idx)}
              >
                ${e.numero}
              </button>
              ${!estDernier
                ? html`<span
                    class="lien-waypoints
                      ${passee ? 'passee' : ''}
                      ${!passee && !active ? 'pointille' : ''}"
                    aria-hidden="true"
                  ></span>`
                : nothing}
            `;
          })}
        </div>
        <div class="controles">
          <div class="controles-gauche">
            <button
              class="btn"
              type="button"
              ?disabled=${this.indexCourant === 0}
              @click=${() => this.avancer(-1)}
              aria-label="Étape précédente"
            >
              <mbolo-icon name="chevron-left" .size=${16}></mbolo-icon>
              Précédent
            </button>
            <button
              class="btn"
              type="button"
              @click=${() => this.basculerPause()}
              aria-label=${this.enPause ? 'Reprendre la lecture' : 'Mettre en pause'}
            >
              ${this.enPause
                ? html`<mbolo-icon name="play" .size=${16}></mbolo-icon> Reprendre`
                : html`<mbolo-icon name="pause" .size=${16}></mbolo-icon> Pause`}
            </button>
            <button
              class="btn"
              type="button"
              ?disabled=${this.indexCourant >= this.nbEtapes - 1}
              @click=${() => this.avancer(1)}
              aria-label="Étape suivante"
            >
              Suivant
              <mbolo-icon name="chevron-right" .size=${16}></mbolo-icon>
            </button>
          </div>
          <div class="controles-droite">
            <div class="vitesses" role="group" aria-label="Vitesse">
              ${(['apprentissage', 'normale', 'rapide'] as const).map(
                (v) => html`
                  <button
                    class="chip ${this.vitesseLocale === v ? 'active' : ''}"
                    type="button"
                    @click=${() => this.changerVitesse(v)}
                    aria-pressed=${this.vitesseLocale === v ? 'true' : 'false'}
                  >
                    ${this.libelleVitesse(v)}
                  </button>
                `,
              )}
            </div>
            <button
              class="btn tertiaire"
              type="button"
              @click=${() => this.demanderPasser()}
              aria-label="Passer l'animation"
            >
              Passer
            </button>
          </div>
        </div>
      </footer>
    `;
  }

  private libelleVitesse(v: Vitesse): string {
    switch (v) {
      case 'apprentissage':
        return 'Lente';
      case 'normale':
        return 'Normale';
      case 'rapide':
        return 'Rapide';
    }
  }

  private formatterNumero(n: number): string {
    return n < 10 ? `0${n}` : String(n);
  }
}
