/**
 * URLs source des fichiers Java du projet, exposées au mode pédagogique.
 *
 * <p>Les badges (port, événement, bounded context) et la page
 * {@code /architecture} ouvrent ces URLs dans un nouvel onglet pour que
 * l'étudiant puisse consulter le code Java correspondant.
 *
 * <p><b>Configuration requise</b> : modifiez la constante {@link REPO}
 * ci-dessous pour pointer vers le bon repo GitHub. Le projet local n'a pas
 * de {@code git remote} configuré au moment de l'écriture de ce module.
 *
 * <p>Si {@link REPO} est laissé à sa valeur fallback {@code '#'}, les liens
 * GitHub ne mèneront nulle part (et un {@code console.warn} sera émis au
 * premier usage) — l'UI reste fonctionnelle mais les liens deviennent
 * informatifs.
 *
 * @author BANGA Romaric
 */

/**
 * Base du repo GitHub. À adapter selon votre compte / fork.
 *
 * Format attendu : {@code https://github.com/<owner>/<repo>/blob/<branche>}.
 */
const REPO = 'https://github.com/bangaromaric/MboloPay/blob/master';

const SRC = `${REPO}/src/main/java/ga/banga/mbolopay`;

/**
 * Carte exhaustive des fichiers source référencés depuis l'UI pédagogique.
 *
 * <p>Toutes les valeurs sont des URLs absolues. Une clé peut pointer vers
 * un fichier de domaine, de service applicatif, d'infrastructure ou de
 * test selon le concept exposé.
 */
export const SOURCES = {
  // ===== Module identité =====
  identitePackage: `${REPO}/src/main/java/ga/banga/mbolopay/identite/package-info.java`,
  abonne: `${SRC}/identite/domain/model/Abonne.java`,
  abonneId: `${SRC}/identite/domain/model/AbonneId.java`,
  nomGabonais: `${SRC}/identite/domain/model/vo/NomGabonais.java`,
  numeroTelephoneGabonais: `${SRC}/identite/domain/model/vo/NumeroTelephoneGabonais.java`,

  creerAbonneUseCase: `${SRC}/identite/domain/port/in/CreerAbonneUseCase.java`,
  rechercherAbonneUseCase: `${SRC}/identite/domain/port/in/RechercherAbonneUseCase.java`,
  creerAbonneService: `${SRC}/identite/application/service/CreerAbonneService.java`,
  creerAbonneServiceTransactionnel: `${SRC}/identite/infrastructure/secondary/transaction/CreerAbonneServiceTransactionnel.java`,

  commandeCreerAbonne: `${SRC}/identite/domain/command/CommandeCreerAbonne.java`,
  abonneController: `${SRC}/identite/infrastructure/primary/web/AbonneController.java`,
  abonneResponse: `${SRC}/identite/infrastructure/primary/web/dto/AbonneResponse.java`,
  depotAbonne: `${SRC}/identite/domain/port/out/DepotAbonne.java`,
  depotAbonnePostgres: `${SRC}/identite/infrastructure/secondary/persistence/DepotAbonnePostgres.java`,
  evenementAbonneCree: `${SRC}/identite/domain/event/EvenementAbonneCree.java`,
  gestionnaireExceptionsIdentite: `${SRC}/identite/infrastructure/primary/web/advice/GestionnaireExceptionsIdentite.java`,
  abonneIntrouvable: `${SRC}/identite/domain/exception/AbonneIntrouvableException.java`,
  numeroDejaUtilise: `${SRC}/identite/domain/exception/NumeroDejaUtiliseException.java`,
  numeroNonAutorise: `${SRC}/identite/domain/exception/NumeroNonAutoriseException.java`,

  // ===== Module portefeuille =====
  portefeuillePackage: `${REPO}/src/main/java/ga/banga/mbolopay/portefeuille/package-info.java`,
  portefeuille: `${SRC}/portefeuille/domain/model/Portefeuille.java`,
  portefeuilleId: `${SRC}/portefeuille/domain/model/PortefeuilleId.java`,
  abonneIdReference: `${SRC}/portefeuille/domain/model/AbonneIdReference.java`,
  argent: `${SRC}/portefeuille/domain/model/vo/Argent.java`,
  operationPortefeuille: `${SRC}/portefeuille/domain/model/OperationPortefeuille.java`,
  operationId: `${SRC}/portefeuille/domain/model/OperationId.java`,
  typeOperation: `${SRC}/portefeuille/domain/model/TypeOperation.java`,
  pageOperations: `${SRC}/portefeuille/domain/model/PageOperations.java`,

  deposerArgentUseCase: `${SRC}/portefeuille/domain/port/in/DeposerArgentUseCase.java`,
  retirerArgentUseCase: `${SRC}/portefeuille/domain/port/in/RetirerArgentUseCase.java`,
  recupererPortefeuilleParAbonneUseCase: `${SRC}/portefeuille/domain/port/in/RecupererPortefeuilleParAbonneUseCase.java`,
  historiqueOperationsUseCase: `${SRC}/portefeuille/domain/port/in/HistoriqueOperationsUseCase.java`,
  creerPortefeuilleUseCase: `${SRC}/portefeuille/domain/port/in/CreerPortefeuilleUseCase.java`,

  deposerArgentService: `${SRC}/portefeuille/application/service/DeposerArgentService.java`,
  retirerArgentService: `${SRC}/portefeuille/application/service/RetirerArgentService.java`,
  historiqueOperationsService: `${SRC}/portefeuille/application/service/HistoriqueOperationsService.java`,

  portefeuilleController: `${SRC}/portefeuille/infrastructure/primary/web/PortefeuilleController.java`,
  depotPortefeuille: `${SRC}/portefeuille/domain/port/out/DepotPortefeuille.java`,
  depotOperations: `${SRC}/portefeuille/domain/port/out/DepotOperations.java`,
  depotPortefeuillePostgres: `${SRC}/portefeuille/infrastructure/secondary/persistence/DepotPortefeuillePostgres.java`,
  ecouteurEvenementAbonne: `${SRC}/portefeuille/infrastructure/primary/event/EcouteurEvenementAbonne.java`,
  soldeInsuffisant: `${SRC}/portefeuille/domain/exception/SoldeInsuffisantException.java`,
  montantInvalide: `${SRC}/portefeuille/domain/exception/MontantInvalideException.java`,
  portefeuilleIntrouvable: `${SRC}/portefeuille/domain/exception/PortefeuilleIntrouvableException.java`,
  gestionnaireExceptionsGlobal: `${SRC}/portefeuille/infrastructure/primary/web/advice/GestionnaireExceptionsGlobal.java`,

  // ===== Module shared =====
  sharedPackage: `${REPO}/src/main/java/ga/banga/mbolopay/shared/package-info.java`,
  exceptionDomaine: `${SRC}/shared/exception/ExceptionDomaine.java`,

  // ===== Tests d'architecture =====
  hexagonalArchitectureTest: `${REPO}/src/test/java/ga/banga/mbolopay/HexagonalArchitectureTest.java`,
  modularityTests: `${REPO}/src/test/java/ga/banga/mbolopay/ModularityTests.java`,
} as const;

/**
 * Indique si la base du repo est configurée.
 *
 * @return {@code true} si {@link REPO} pointe vers une URL exploitable.
 */
export function reposConfigure(): boolean {
  return REPO.startsWith('http');
}

let warnEmis = false;

/**
 * Renvoie une URL source si {@link REPO} est configuré, ou {@code null}
 * sinon (avec un avertissement console au premier usage).
 *
 * Les composants doivent traiter {@code null} en désactivant le lien
 * (rendre du texte simple à la place).
 *
 * @param cle clé du fichier source
 * @return URL absolue ou {@code null}
 */
export function lienSource(cle: keyof typeof SOURCES): string | null {
  if (!reposConfigure()) {
    if (!warnEmis) {
      warnEmis = true;
      console.warn(
        '[mbolopay/sources] REPO non configuré dans lib/sources.ts — les liens GitHub seront désactivés.',
      );
    }
    return null;
  }
  return SOURCES[cle];
}
