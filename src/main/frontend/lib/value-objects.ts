/**
 * Descripteurs centralisés des Value Objects métier exposés à l'UI
 * pédagogique.
 *
 * <p>Source unique de vérité pour le contenu affiché par
 * {@code <mbolo-vo-hint>} : nom du record Java, description courte,
 * contraintes de validation, lien vers le fichier source GitHub.
 *
 * <p>Quand un nouveau Value Object est ajouté côté backend, déclarer son
 * descripteur ici puis le brancher dans la page qui consomme le champ
 * correspondant.
 *
 * @author BANGA Romaric
 */
import { SOURCES } from './sources.js';

/**
 * Méta-données affichables sur un Value Object métier.
 */
export interface DescripteurVO {
  readonly nom: string;
  readonly description: string;
  readonly contraintes: readonly string[];
  readonly sourceKey: keyof typeof SOURCES;
}

/**
 * Catalogue complet des Value Objects exposés à l'UI pédagogique.
 *
 * <p>La clé est un nom court utilisé dans les pages ; la valeur est le
 * descripteur complet.
 */
export const VO = {
  nomGabonais: {
    nom: 'NomGabonais',
    description:
      "Record immuable encapsulant le couple (prénom, nom) d'un abonné. Validation effectuée à la construction.",
    contraintes: [
      'Prénom non blank, longueur 1 à 60 caractères',
      'Nom non blank, longueur 1 à 60 caractères',
      'Trim automatique des espaces en bordure',
    ],
    sourceKey: 'nomGabonais',
  },
  numeroTelephoneGabonais: {
    nom: 'NumeroTelephoneGabonais',
    description:
      'Numéro de téléphone gabonais validé à la construction. Normalisé vers le format E.164 international.',
    contraintes: [
      'Format E.164 international : +241XXXXXXXX',
      'Format local accepté : 0[67]XXXXXXX (normalisé vers E.164)',
      'Indicatif pays : +241 (Gabon) uniquement',
      'Opérateurs supportés : Airtel, Moov',
    ],
    sourceKey: 'numeroTelephoneGabonais',
  },
  argent: {
    nom: 'Argent',
    description:
      "Représente une somme en Francs CFA (XAF). Le FCFA n'a pas de centimes — précision exacte via BigDecimal.",
    contraintes: [
      'Stocké en BigDecimal pour précision exacte',
      'Arrondi automatique à 0 décimale (HALF_UP)',
      'Opérations : ajouter, soustraire (résultat immuable)',
      'Prédicats : estNegatif(), estPositif()',
    ],
    sourceKey: 'argent',
  },
} as const satisfies Record<string, DescripteurVO>;

export type CleVO = keyof typeof VO;
