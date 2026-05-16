# MboloPay

> Mini mobile money éducatif. Vitrine **DDD + Architecture Hexagonale + Spring Modulith** sur un cas métier réel (Gabon).

![Java](https://img.shields.io/badge/Java-25-007396?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.2-6DB33F?logo=springboot&logoColor=white)
![Spring Modulith](https://img.shields.io/badge/Spring%20Modulith-2.0.2-6DB33F)
![Lit](https://img.shields.io/badge/Lit-3.3.2-324FFF?logo=lit&logoColor=white)
![Material Web](https://img.shields.io/badge/Material%20Web-3-757575?logo=materialdesign&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

MboloPay est un mini service de **mobile money** (créer un compte, déposer, retirer, consulter son historique) écrit comme **support pédagogique**. Le code est en français, l'architecture est strictement séparée en bounded contexts, et l'interface graphique expose en direct ce qui se passe sous le capot : ports invoqués, événements de domaine émis, traversée des couches hexagonales.

---

## Sommaire

- [Pourquoi MboloPay](#pourquoi-mbolopay)
- [Aperçu](#aperçu)
- [Pré-requis](#pré-requis)
- [Démarrer l'application (premier clone)](#démarrer-lapplication-premier-clone)
- [Architecture en bref](#architecture-en-bref)
- [Cycle d'une opération (13 étapes)](#cycle-dune-opération-13-étapes)
- [Endpoints REST](#endpoints-rest)
- [Pile technique](#pile-technique)
- [Pédagogie en première classe](#pédagogie-en-première-classe)
- [Tests d'architecture](#tests-darchitecture)
- [Commandes utiles](#commandes-utiles)
- [Structure du dépôt](#structure-du-dépôt)
- [Conventions de code](#conventions-de-code)
- [Roadmap](#roadmap)
- [Auteur & licence](#auteur--licence)

---

## Pourquoi MboloPay

Le projet poursuit deux objectifs simultanés.

**Côté produit** : modéliser un mobile money simplifié au contexte gabonais. Un abonné se crée avec un nom et un numéro de téléphone (Airtel ou Moov), reçoit automatiquement un portefeuille à `0 FCFA`, peut y déposer et retirer de l'argent, et consulter son historique paginé d'opérations.

**Côté pédagogique** — c'est la vraie raison d'être — le code et l'interface enseignent **trois disciplines** en les rendant *visibles* :

- **Domain-Driven Design** (agrégats, value objects, événements, types métier dédiés) ;
- **Architecture Hexagonale** (séparation stricte domaine / application / infrastructure, ports & adapters) ;
- **Spring Modulith** (modules métier isolés, dépendances déclarées, événements cross-module, tests d'architecture qui cassent le build).

> **Pour qui ?**
> - Étudiants en architecture logicielle qui veulent voir DDD/Hexa/Modulith fonctionner en direct.
> - Formateurs cherchant un cas d'étude exécutable et observable.
> - Développeurs curieux des patterns de modularisation Spring.

Une fois l'application lancée, la page **`/architecture`** dans l'app expose le cycle complet d'une opération en 13 étapes, les 3 bounded contexts, et un glossaire DDD/Hexa/Modulith de 11 cartes interactives.

---

## Aperçu

> *Captures à venir.* En attendant, clonez le repo et activez le mode pédagogique pour voir l'UI en action.

| Page | Description |
|---|---|
| ![Accueil](docs/assets/accueil.png) | **Accueil** — solde du portefeuille, dépôt/retrait rapides, badges Q/C et bounded contexts en mode pédagogique. |
| ![Slow-mo](docs/assets/slow-mo.png) | **Slow-mo overlay** — animation pas-à-pas de la traversée des 4 couches hexagonales pendant qu'une opération s'exécute. |
| ![Architecture](docs/assets/architecture-page.png) | **Page /architecture** — académie statique : 3 bounded contexts, 13 étapes du cycle, glossaire 11 cartes. |
| ![Inspector](docs/assets/inspector.png) | **Inspector HTTP** — drawer droit montrant les 50 derniers appels (URL, statut, payload, port appelé, exception déduite). |

---

## Pré-requis

- **Java 25+** (recommandé : [Liberica NIK 25](https://bell-sw.com/pages/downloads/native-image-kit/) si tu veux compiler en natif, sinon [Eclipse Temurin 25](https://adoptium.net/)). Vérifier avec `java -version`.
- **Git** pour cloner le dépôt.

**Aucune autre installation** :

- Maven : le wrapper (`./mvnw` ou `mvnw.cmd`) est livré dans le repo.
- Node.js : non requis — esbuild est téléchargé automatiquement par Maven, les dépendances frontend viennent de WebJars.
- Base de données : **H2 embarqué**, démarré par Spring Boot — zéro installation.
- Docker : non requis.

---

## Démarrer l'application (premier clone)

Parcours complet, de `git clone` à l'application qui tourne :

```bash
# 1. Cloner le dépôt
git clone https://github.com/bangaromaric/MboloPay.git
cd MboloPay

# 2. Vérifier la version Java (doit afficher 25 ou plus)
java -version

# 3. Lancer l'application
#    Linux / macOS / WSL :
./mvnw spring-boot:run

#    Windows (cmd / PowerShell) :
mvnw.cmd spring-boot:run

# 4. Patienter au premier lancement :
#    - téléchargement des dépendances Maven
#    - extraction des WebJars vers node_modules/
#    - téléchargement du binaire esbuild (~10 Mo)
#    - bundle du frontend TypeScript
#    - démarrage de Spring Boot
#
#    Compter 3-5 min sous Linux/macOS, 5-10 min sous Windows/WSL
#    (I/O Maven sur /mnt/c plus lent). Démarrages suivants : ~10 s.

# 5. Quand la log affiche
#    « Started MboloPayApplication in X seconds »,
#    ouvrir dans le navigateur :
#    http://localhost:8080
```

### Premier contact pédagogique

À l'ouverture, l'onboarding propose d'activer le **mode pédagogique** en un clic. Acceptez : tout l'aspect didactique du projet (badges Q/C, indicateurs de port, événements de domaine, Inspector HTTP, slow-mo) devient visible.

Sinon, depuis n'importe quel moment : `/profil` → toggle **Mode pédagogique**, puis toggle **Mode slow-mo** pour activer l'animation des couches hexagonales sur chaque création / dépôt / retrait.

### Base de données

L'application embarque **H2 en mémoire** :

- URL JDBC : `jdbc:h2:mem:mbolopay`
- Console web : <http://localhost:8080/h2-console>
- User : `sa`
- Mot de passe : vide

Les données sont réinitialisées à chaque redémarrage. Le schéma JPA est généré automatiquement (`ddl-auto: update`), aucun script SQL à exécuter.

### Image native (optionnel)

Pour produire une image native GraalVM (démarrage en **~200 ms**, **~80 Mo de RAM**, soit **~18× plus rapide** qu'en JVM) :

```bash
./mvnw native:compile -Pnative
```

> **Pré-requis Windows** :
>
> - **Liberica NIK 25** (contient OpenJDK 25 + Native Image) — Spring Boot 4 exige Java 25 baseline ; les versions NIK antérieures (Java 21) échouent avec `Native Image must support at least Java 25`.
> - **Visual Studio Build Tools** avec la charge **"Développement Desktop en C++"** (compilateur MSVC requis).
> - La compilation doit être lancée depuis un **x64 Native Tools Command Prompt for VS** (ou un `cmd` avec `vcvars64.bat` chargé), **jamais depuis WSL/Git Bash**.
>
> Détails complets, troubleshooting et benchmark JVM vs natif : voir [`docs/native-image-build.md`](docs/native-image-build.md).

Sur Linux/macOS, `sdk install java 25.0.x-graal` (via [SDKMAN!](https://sdkman.io/)) suffit en général.

L'image native est purement optionnelle — `./mvnw spring-boot:run` suffit pour faire tourner le projet en JVM classique.

---

## Architecture en bref

### Trois bounded contexts (Spring Modulith)

| Module | Rôle | Agrégat | Publie / Écoute |
|---|---|---|---|
| `identite` | Cycle de vie des abonnés (création, recherche) | `Abonne` | **Publie** `EvenementAbonneCree` |
| `portefeuille` | Soldes, dépôts, retraits, historique | `Portefeuille` | **Écoute** `EvenementAbonneCree` → crée un portefeuille à `0 FCFA` |
| `shared` | Exception racine (`ExceptionDomaine`) | — | Module type `OPEN` — visible par tous |

Dépendances déclarées dans les `package-info.java` :

```
shared (OPEN)
   ↑
   │
identite ────► (publie events)
                    ↓
              portefeuille → identite :: events
                    ↑
                    │
                  shared
```

Aucune dépendance directe `portefeuille → identite` — seule la NamedInterface `events` est consommée. Vérifié par [`ModularityTests`](src/test/java/ga/banga/mbolopay/ModularityTests.java). Les diagrammes PlantUML détaillés sont générés automatiquement dans `target/spring-modulith-docs/` lorsque les tests s'exécutent.

### Architecture hexagonale stricte

Chaque module suit la même structure :

```
{module}/
├── domain/                 # cœur métier, ZÉRO framework
│   ├── model/              # agrégats, value objects, enums
│   ├── event/              # événements de domaine (records)
│   ├── exception/          # sous-classes d'ExceptionDomaine
│   ├── command/            # DTOs de commande entrante
│   ├── port/
│   │   ├── in/             # interfaces de cas d'usage UNIQUEMENT
│   │   └── out/            # interfaces de services externes UNIQUEMENT
│   └── service/            # services de domaine (logique pure)
├── application/
│   └── service/            # services applicatifs POJO (orchestration)
└── infrastructure/
    ├── primary/            # adaptateurs entrants : REST, listeners
    └── secondary/          # adaptateurs sortants : JPA, transactions, publishers
```

Représentation visuelle (rappel de l'overlay slow-mo dans l'app) :

```
┌──────────────────────────────────────────────────┐
│ PRIMARY (entrée)        adaptateurs entrants     │
│   ↳ REST controllers, event listeners            │
├──────────────────────────────────────────────────┤
│ APPLICATION             orchestration POJO        │
│   ↳ services applicatifs (aucune règle métier)    │
├──────────────────────────────────────────────────┤
│ DOMAIN                  cœur métier, sans framework│
│   ↳ agrégats, value objects, événements           │
├──────────────────────────────────────────────────┤
│ SECONDARY (sortie)      adaptateurs sortants      │
│   ↳ JPA, @Transactional, event publishers         │
└──────────────────────────────────────────────────┘
```

**Règle absolue** : `domain/port/in/` et `domain/port/out/` ne contiennent **que** des interfaces. Vérifié par 18 règles ArchUnit dans [`HexagonalArchitectureTest`](src/test/java/ga/banga/mbolopay/HexagonalArchitectureTest.java).

### Types Driven Development

Plutôt que des `String` ou `long` partout, chaque concept métier a son propre type :

- `AbonneId` au lieu de `String` → impossible de passer un identifiant au mauvais endroit.
- `Argent` au lieu de `long` → un montant ne peut pas être confondu avec un identifiant.
- `NumeroTelephoneGabonais` au lieu de `String` → validation E.164 dès la construction.
- `NomGabonais` au lieu de `String` → invariants (non-blank, capitalisation) appliqués.

Conséquence : **les erreurs métier deviennent des erreurs de compilation**. Voir le glossaire interactif sur `/architecture` après lancement.

---

## Cycle d'une opération (13 étapes)

Voici ce qui se passe quand un client envoie `POST /api/abonnes`. Cette table est tenue à jour en miroir de [`src/main/frontend/lib/cycles.ts`](src/main/frontend/lib/cycles.ts), source consommée par la page `/architecture` et l'overlay slow-mo.

| # | Étape | Couche | Composant |
|---|---|---|---|
| 1 | Requête HTTP entrante | Primary | `AbonneController` |
| 2 | Construction des Value Objects | Domain | `NumeroTelephoneGabonais`, `NomGabonais` |
| 3 | Création de la commande | Primary | `CommandeCreerAbonne` |
| 4 | Appel du port in (cas d'usage) | Primary → Application | `CreerAbonneUseCase` |
| 5 | Décorateur transactionnel | Secondary | `CreerAbonneServiceTransactionnel` |
| 6 | Service applicatif (POJO) | Application | `CreerAbonneService` |
| 7 | Factory de l'agrégat | Domain | `Abonne.creer(...)` |
| 8 | Sauvegarde via port out | Application → Secondary | `DepotAbonne` (interface) |
| 9 | Adaptateur secondaire JPA | Secondary | `DepotAbonnePostgres` |
| 10 | Publication de l'événement de domaine | Domain → Secondary | `EvenementAbonneCree` |
| 11 | Listener cross-module | Primary (portefeuille) | `EcouteurEvenementAbonne` |
| 12 | Création du portefeuille | Domain (portefeuille) | `Portefeuille.creerVide(...)` |
| 13 | Réponse `HTTP 201` | Primary | `AbonneResponse` |

> Cette séquence peut être **rejouée pas-à-pas dans l'application** en activant le mode slow-mo (cf. [Pédagogie](#pédagogie-en-première-classe)). L'overlay anime la traversée des 4 couches avec un pointeur lumineux et 3 vitesses au choix (Lente / Normale / Rapide).

---

## Endpoints REST

| Verb | Route | Description | Code succès |
|---|---|---|---|
| `POST` | `/api/abonnes` | Créer un abonné | `201` |
| `GET` | `/api/abonnes/{id}` | Récupérer un abonné par UUID | `200` |
| `GET` | `/api/abonnes/sante` | Health check module `identite` | `200` |
| `GET` | `/api/portefeuilles/abonne/{abonneId}` | Récupérer le portefeuille d'un abonné | `200` |
| `POST` | `/api/portefeuilles/{portefeuilleId}/depot` | Déposer un montant | `200` |
| `POST` | `/api/portefeuilles/{portefeuilleId}/retrait` | Retirer un montant | `200` |
| `GET` | `/api/portefeuilles/{portefeuilleId}/operations` | Historique paginé (`?page=&taille=`) | `200` |
| `GET` | `/api/portefeuilles/sante` | Health check module `portefeuille` | `200` |

### Gestion d'erreur

| Code | Cas | Exception métier |
|---|---|---|
| `400 BAD_REQUEST` | Validation (montant négatif, numéro mal formé) | `MontantInvalideException`, `NumeroNonAutoriseException` |
| `400 BAD_REQUEST` | Règle métier violée (solde insuffisant) | `SoldeInsuffisantException` |
| `404 NOT_FOUND` | Entité introuvable | `AbonneIntrouvableException`, `PortefeuilleIntrouvableException` |
| `409 CONFLICT` | Numéro de téléphone déjà utilisé | `NumeroDejaUtiliseeException` |

Toutes les exceptions métier héritent de [`ExceptionDomaine`](src/main/java/ga/banga/mbolopay/shared/exception/ExceptionDomaine.java) et sont mappées vers des codes HTTP via les `@RestControllerAdvice` du dossier `infrastructure/primary/web/advice/`.

---

## Pile technique

### Backend

| Composant | Version | Rôle |
|---|---|---|
| Java | 25 | Toolchain (baseline Spring Boot 4) |
| Spring Boot | 4.0.2 | Framework |
| Spring Modulith | 2.0.2 | Modules + événements |
| jMolecules | 0.33.0 | Annotations DDD (`@AggregateRoot`, `@ValueObject`, `@Identity`) |
| jspecify | 1.0.0 | Null-safety (`@NonNull`, `@NullMarked`) |
| ArchUnit | 1.4.1 | Tests d'architecture |
| H2 | runtime | Base embarquée — `jdbc:h2:mem:mbolopay` |
| Hibernate | (BOM Spring Boot 4) | ORM + enhancement bytecode |

### Frontend

| Composant | Version | Rôle |
|---|---|---|
| TypeScript | 5.x | Toolchain |
| Lit | 3.3.2 | Web Components réactifs |
| Material Web | 2.4.1 | Composants UI Material Design 3 |
| esbuild | 0.28.0 | Bundler ESM |
| URLPattern | natif (Baseline 2025) | Mini-routeur SPA |
| WebJars Locator Lite | 1.1.3 | Résolution WebJars sans scan classpath |

### Chaîne de build sans npm

Le frontend ne requiert ni Node.js ni `npm install`. La chaîne est entièrement portée par Maven :

1. **Téléchargement esbuild** — `download-maven-plugin` récupère le binaire OS-dépendant (Linux x64/arm64, macOS x64/arm64, Windows x64).
2. **Extraction des WebJars** — `maven-dependency-plugin` décompresse Lit, Material Web, tslib vers `target/webjars-extracted/`.
3. **Réorganisation node_modules/** — `maven-antrun-plugin` copie les WebJars vers `node_modules/` à la racine en respectant la convention npm (`@scope/name`).
4. **Bundle** — `exec-maven-plugin` invoque esbuild sur `src/main/frontend/main.ts`, produit `src/main/resources/static/js/main.js` (ESM + sourcemap).

Le tout est branché sur les phases Maven standards : `./mvnw spring-boot:run` enchaîne automatiquement les 4 étapes.

---

## Pédagogie en première classe

C'est ce qui distingue MboloPay des démos classiques. Tout est désactivé par défaut — le mode pédagogique se manifeste uniquement quand l'étudiant l'active depuis le profil ou l'onboarding.

### Mode pédagogique (toggle profil)

Une fois activé, l'interface révèle ce que le code fait :

- **Badges Query / Command** au survol de chaque port appelé, cliquables vers le fichier Java sur GitHub.
- **Hints Value Object** au survol des champs métier (ex. au survol du champ téléphone, popover expliquant `NumeroTelephoneGabonais` avec ses invariants).
- **Badges d'événements de domaine** émis pendant une opération (ex. flash `EvenementAbonneCree` après création).
- **FAB Inspector** flottant en bas à droite qui ouvre le drawer HTTP live.

### Inspector HTTP live (drawer droit)

Le drawer capture les 50 derniers appels HTTP. Chaque entrée détaille :

- Verb + URL + statut + durée.
- Payload JSON envoyé et reçu (formaté, repliable).
- Port appelé (avec lien GitHub).
- Bounded context d'origine.
- Exception métier déduite en cas d'erreur (avec lien vers la classe Java + le `@RestControllerAdvice` correspondant).

### Mode slow-mo (overlay 4 bandes hexagonales)

Activable depuis le profil après le mode pédagogique. Quand l'utilisateur soumet une création / dépôt / retrait :

- L'animation s'ouvre AVANT l'appel HTTP réel (qui tourne en parallèle).
- Coupe horizontale empilée : Primary / Application / Domain / Secondary, chaque bande avec sa couleur, son icône et la liste des composants Java qui y vivent.
- Le composant courant est mis en évidence avec un drapeau et un halo lumineux.
- Un rail vertical lumineux à gauche montre la couche active — il glisse pendant les transitions.
- À droite, une carte détail spotlight affiche le numéro d'étape (grand format), le titre, la description, et le lien GitHub.
- Effets spéciaux : éclair doré sur la publication d'événement, bandeau « Cross-module → portefeuille » lors du passage d'identité à portefeuille, check vert plein écran à la fin.
- Contrôles clavier : `Espace` (pause/reprise), `← →` (étape par étape), `Esc` (passer).
- 3 vitesses : Lente (1,8 s/étape, démos en classe), Normale (0,9 s, défaut), Rapide (0,4 s).

### Page `/architecture` (académie statique)

Trois sections didactiques accessibles à tout moment :

1. **Bounded Contexts** — 3 cartes (`identite`, `portefeuille`, `shared`) avec dépendances Spring Modulith et liens vers `package-info.java`.
2. **Cycle d'une opération** — les 13 étapes en flow vertical, chacune avec son port / composant et lien GitHub.
3. **Glossaire** — 11 cartes définissant DDD / Architecture Hexagonale / Spring Modulith / Types Driven Development / CQRS.

---

## Tests d'architecture

**Toute violation casse le build.** Deux suites verrouillent les règles :

### [`HexagonalArchitectureTest`](src/test/java/ga/banga/mbolopay/HexagonalArchitectureTest.java) (ArchUnit)

18 règles vérifient :

- `domain/` ne dépend pas de l'infrastructure, ne contient ni Spring, ni JPA, ni Jackson, ni Jakarta Validation.
- `domain/port/in/` et `domain/port/out/` contiennent UNIQUEMENT des interfaces.
- Toutes les exceptions métier héritent de `ExceptionDomaine`.
- Les `@RestController` vivent UNIQUEMENT dans `infrastructure/primary/web/`.
- `application/` n'importe pas Spring MVC.
- `infrastructure/` contient UNIQUEMENT `primary/` et `secondary/` (pas d'autre sous-dossier).
- `primary/` et `secondary/` ne se dépendent pas mutuellement.

### [`ModularityTests`](src/test/java/ga/banga/mbolopay/ModularityTests.java) (Spring Modulith)

4 tests vérifient :

- La structure modulaire est valide (`ApplicationModules.verify()`).
- Les `allowedDependencies` déclarées en `package-info.java` sont respectées.
- Les `@NamedInterface` sont correctement exposées.
- Aucune dépendance cyclique entre modules.
- Génère automatiquement la documentation PlantUML + Asciidoc dans `target/spring-modulith-docs/`.

À lancer après tout changement structurel :

```bash
./mvnw test -Dtest=HexagonalArchitectureTest,ModularityTests
```

---

## Commandes utiles

| Commande | Effet |
|---|---|
| `./mvnw spring-boot:run` | Lancer l'application (avec bundle frontend) |
| `./mvnw clean install` | Build complet + tests |
| `./mvnw test` | Lancer tous les tests |
| `./mvnw test -Dtest=ClassName` | Lancer une classe de test précise |
| `./mvnw test -Dtest=HexagonalArchitectureTest,ModularityTests` | Vérifier l'architecture après changement structurel |
| `./mvnw native:compile -Pnative` | Image native GraalVM (nécessite Liberica NIK 25, cf. section *Image native*) |
| `./mvnw clean` | Nettoyer les artefacts de build |

---

## Structure du dépôt

```
.
├── src/
│   ├── main/
│   │   ├── java/ga/banga/mbolopay/
│   │   │   ├── identite/          # BC identité (agrégat Abonne)
│   │   │   ├── portefeuille/      # BC portefeuille (agrégat Portefeuille)
│   │   │   └── shared/            # Module OPEN (ExceptionDomaine)
│   │   ├── frontend/              # TypeScript / Lit / Material Web
│   │   │   ├── api/               # client HTTP typé
│   │   │   ├── components/        # atoms / molecules / organisms
│   │   │   ├── lib/               # thème, session, slow-mo, cycles, …
│   │   │   └── pages/             # 7 pages routées
│   │   └── resources/
│   │       ├── application.yml    # config H2 + JPA + logging modulith
│   │       └── static/            # HTML, CSS, bundle JS, icônes
│   └── test/                      # ArchUnit + Modulith + tests métier
├── docs/                          # charte graphique, stack frontend
├── pom.xml                        # build Maven + chaîne esbuild
├── mvnw, mvnw.cmd                 # Maven Wrapper
└── README.md
```

Documentation complémentaire :

- [`docs/charte-graphique.md`](docs/charte-graphique.md) — la charte UI/UX (tokens, typographie, couleurs, voix).
- [`docs/stack-frontend.md`](docs/stack-frontend.md) — détails de la chaîne frontend (WebJars, esbuild, choix techniques).

---

## Conventions de code

- **Français partout** — noms de classes, méthodes, variables, commentaires, libellés UI.
- **`@author BANGA Romaric`** sur toutes les classes nouvellement créées.
- **Javadoc complète** sur tout ce qui est public.
- **`ExceptionDomaine`** racine de toutes les exceptions métier (jamais `IllegalArgumentException` brut).
- **Types Driven Development** — un type Java dédié par concept métier (cf. `AbonneId`, `Argent`, `NumeroTelephoneGabonais`).
- **Setters protégés** sur les entités JPA (jamais publics).
- **Records immuables** pour les Value Objects, événements de domaine et commandes.
- **Lancer `./mvnw test -Dtest=HexagonalArchitectureTest,ModularityTests`** après tout changement structurel.

---

## Roadmap

✅ **Livré**

- Backend complet : 2 agrégats, 8 endpoints REST, 1 événement cross-module, 18 règles ArchUnit + 4 tests Modulith.
- Frontend SPA : 7 pages, ~50 composants Lit, design system MD3, dark mode + thème automatique.
- Pédagogie : académie `/architecture`, hints Value Objects, indicateurs Query/Command, Inspector HTTP live, annotations d'erreurs métier, overlay slow-mo 4 bandes Hexa.

🚧 **En vue (futurs lots)**

- SSE backend pour brancher l'Inspector sur les *vraies* étapes serveur.
- Replay d'une opération passée depuis l'Inspector.
- Vue avant/après solde lors d'un dépôt/retrait.
- Modes de difficulté (Découverte / Expert) filtrant les concepts exposés.
- Page `/atlas` indexant tous les concepts du projet.
- Pagination `/api/abonnes` (liste).

---

## Auteur & licence

**BANGA Romaric** — auteur et mainteneur. Voir les commits Git pour le contact.

Licence **MIT** (à confirmer).

Projet à but **éducatif**, libre d'utilisation pour cours, formations, démos, talks. Les feedbacks et issues GitHub sont les bienvenus.

> Mbolo et bienvenue dans MboloPay. Bonne exploration de l'architecture hexagonale en direct.
