/**
 * Gestion du flag « onboarding déjà vu » au premier lancement de l'app.
 *
 * <p>Persisté dans {@code localStorage} sous {@code mbolo.onboarding-vu}.
 * Une fois marqué vu, la modale d'accueil n'est plus affichée pour
 * l'utilisateur tant qu'il ne vide pas son stockage local.
 *
 * @author BANGA Romaric
 */

const CLE = 'mbolo.onboarding-vu';

/**
 * @return {@code true} si l'utilisateur a déjà vu la modale d'onboarding.
 */
export function aDejaVu(): boolean {
  try {
    return localStorage.getItem(CLE) === 'true';
  } catch {
    return false;
  }
}

/**
 * Marque l'onboarding comme vu. Idempotent.
 */
export function marquerVu(): void {
  try {
    localStorage.setItem(CLE, 'true');
  } catch {
    /* localStorage indisponible : no-op silencieux. */
  }
}
