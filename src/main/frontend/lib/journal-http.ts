/**
 * Journal réactif des appels HTTP effectués depuis le front MboloPay.
 *
 * <p>Alimenté automatiquement par {@code api/client.ts} en mode pédagogique.
 * Consommé par {@code mbolo-inspector-drawer} pour matérialiser, en temps
 * réel, le pont entre une action UI et la requête réseau qu'elle déclenche.
 *
 * <p>Persistance dans {@code sessionStorage} (limite 50 entrées FIFO) avec
 * sérialiseur custom pour préserver les instances {@link Date}.
 *
 * @author BANGA Romaric
 */
import type { MetaPort } from './mapping-http.js';
import type { MetaException } from './exceptions-metier.js';

const CLE_STOCKAGE = 'mbolo.journal-http';
const LIMITE = 50;
const TAILLE_PAYLOAD_MAX = 4096;

export type StatutAppel = 'en-cours' | 'succes' | 'erreur';

export interface EntreeHttp {
  readonly id: string;
  readonly debut: Date;
  readonly method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  readonly url: string;
  readonly port: MetaPort | null;
  readonly requestBody: unknown;
  fin?: Date;
  dureeMs?: number;
  statutHttp?: number;
  responseBody?: unknown;
  statut: StatutAppel;
  exceptionMetier?: MetaException | null;
  erreurReseau?: string;
}

interface EntreeSerialisee extends Omit<EntreeHttp, 'debut' | 'fin'> {
  debut: string;
  fin?: string;
}

function tronquer(valeur: unknown): unknown {
  if (valeur == null) return valeur;
  try {
    const s = JSON.stringify(valeur);
    if (s.length <= TAILLE_PAYLOAD_MAX) return valeur;
    return { _tronque: true, apercu: s.slice(0, TAILLE_PAYLOAD_MAX) + '…' };
  } catch {
    return { _tronque: true, raison: 'non-serialisable' };
  }
}

function lireBrut(): EntreeSerialisee[] {
  try {
    const brut = sessionStorage.getItem(CLE_STOCKAGE);
    if (!brut) return [];
    const parse: unknown = JSON.parse(brut);
    return Array.isArray(parse) ? (parse as EntreeSerialisee[]) : [];
  } catch {
    return [];
  }
}

function hydrater(e: EntreeSerialisee): EntreeHttp {
  return {
    ...e,
    debut: new Date(e.debut),
    fin: e.fin ? new Date(e.fin) : undefined,
  };
}

function ecrire(entrees: readonly EntreeHttp[]): void {
  try {
    const tronquees = entrees.slice(0, LIMITE).map((e) => ({
      ...e,
      debut: e.debut.toISOString(),
      fin: e.fin?.toISOString(),
      requestBody: tronquer(e.requestBody),
      responseBody: tronquer(e.responseBody),
    }));
    sessionStorage.setItem(CLE_STOCKAGE, JSON.stringify(tronquees));
  } catch {
    /* quota dépassé : on perd silencieusement. */
  }
}

function emettre(): void {
  window.dispatchEvent(new CustomEvent('mbolo-http-publie'));
}

function genererId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Démarre une nouvelle entrée HTTP. À appeler AVANT le {@code fetch}.
 *
 * @return identifiant local de l'entrée (à passer à {@link terminer}).
 */
export function demarrer(init: {
  method: EntreeHttp['method'];
  url: string;
  port: MetaPort | null;
  requestBody: unknown;
}): string {
  const id = genererId();
  const entree: EntreeHttp = {
    id,
    debut: new Date(),
    method: init.method,
    url: init.url,
    port: init.port,
    requestBody: init.requestBody,
    statut: 'en-cours',
  };
  const liste = [entree, ...lireBrut().map(hydrater)];
  ecrire(liste);
  emettre();
  return id;
}

/**
 * Conclut une entrée HTTP avec un statut et un body de réponse.
 */
export function terminer(
  id: string,
  details: {
    statutHttp: number;
    body?: unknown;
    exceptionMetier?: MetaException | null;
  },
): void {
  const liste = lireBrut().map(hydrater);
  const idx = liste.findIndex((e) => e.id === id);
  if (idx < 0) return;
  const e = liste[idx];
  const fin = new Date();
  liste[idx] = {
    ...e,
    fin,
    dureeMs: fin.getTime() - e.debut.getTime(),
    statutHttp: details.statutHttp,
    responseBody: details.body,
    statut: details.statutHttp >= 400 ? 'erreur' : 'succes',
    exceptionMetier: details.exceptionMetier ?? null,
  };
  ecrire(liste);
  emettre();
}

/**
 * Conclut une entrée HTTP en erreur réseau (fetch a échoué avant réponse).
 */
export function terminerErreurReseau(id: string, cause: unknown): void {
  const liste = lireBrut().map(hydrater);
  const idx = liste.findIndex((e) => e.id === id);
  if (idx < 0) return;
  const e = liste[idx];
  const fin = new Date();
  liste[idx] = {
    ...e,
    fin,
    dureeMs: fin.getTime() - e.debut.getTime(),
    statut: 'erreur',
    erreurReseau: cause instanceof Error ? cause.message : String(cause),
  };
  ecrire(liste);
  emettre();
}

/**
 * @return la liste des entrées, récente en premier.
 */
export function liste(): readonly EntreeHttp[] {
  return lireBrut().map(hydrater);
}

/**
 * @return le nombre d'appels en session (utile pour le badge du FAB).
 */
export function compteurSession(): number {
  return lireBrut().length;
}

/**
 * Vide le journal entier. Émet {@code mbolo-http-publie} pour rafraîchir
 * les vues abonnées.
 */
export function vider(): void {
  try {
    sessionStorage.removeItem(CLE_STOCKAGE);
  } catch {
    /* no-op */
  }
  emettre();
}
