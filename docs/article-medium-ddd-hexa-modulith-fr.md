# MOUSSAVOU apprend DDD : le guide pratique du dev junior africain qui veut écrire du code qui tient

### Comment DDD, l'architecture hexagonale et Spring Modulith te permettent d'utiliser Claude, ChatGPT et Copilot sans laisser l'IA générer un monstre — étude de cas MboloPay, mini mobile money open source en français

---

Il est **23h17 à Libreville**. MOUSSAVOU relit pour la troisième fois la PR que son lead vient de rejeter. PayApp, la fintech où elle a été embauchée il y a dix-huit mois, doit livrer demain matin l'intégration avec Orange Money. **Pourtant elle a fait les choses bien — elle a demandé à Claude de l'aider, copié les meilleures réponses Stack Overflow, ajusté avec Copilot.** Et un simple changement — accepter aussi les nouveaux numéros à 9 chiffres en plus des 10 actuels — fait quand même exploser **47 tests dans 12 fichiers** qui n'ont rien à voir.

Validation Spring dans le `AbonneController` (générée par ChatGPT il y a six mois). Regex copiée-collée dans trois services (Copilot a complété, elle a dit oui). Méthode `setNumeroTelephone()` qui contrôle parfois (un Stack Overflow qu'elle a oublié de finir d'adapter). Le numéro circule en `String` partout dans le code. **L'IA a livré 1 000 lignes en trois mois. Personne — pas même Claude — ne sait plus *où* poser cette satanée nouvelle règle.**

Si cette scène te parle — si tu as déjà ouvert un `UserService.java` de 800 lignes dans une fintech à Dakar, Lomé ou Yaoundé — ne ferme pas cet onglet. Dans 15 minutes, tu vas connaître trois patterns qui auraient évité à MOUSSAVOU son insomnie : **DDD**, **Architecture Hexagonale**, **Spring Modulith**. Tu vas les voir en action sur un projet open source ancré dans notre écosystème : **MboloPay** (*mbolo* veut dire "bonjour" en Fang, langue gabonaise), un mini service de mobile money écrit en français, avec Airtel Money et Moov Money comme opérateurs, et une démo live qui te laisse explorer l'architecture **en mouvement**.

Spoiler : ton problème n'est pas que tu utilises l'IA. **Ton problème est que tu lui fais confiance pour des choses qu'elle ne peut pas faire.** L'IA exécute. C'est toi qui dois architecter.

Pas de théorie poussiéreuse. Du concret. On commence par comprendre pourquoi le code d'MOUSSAVOU s'est emmêlé — parce que tant qu'on ne nomme pas le problème, on tourne en rond.

---

## 1. Pourquoi un Spring Boot classique finit en spaghetti

Spring Boot t'apprend trois sigles dès la première semaine : `@RestController`, `@Service`, `@Repository`. Trois couches techniques empilées comme un sandwich. Sur un CRUD simple, ça marche. Sur l'intégration Orange Money d'MOUSSAVOU, ça craque.

Pourquoi ? Parce que ces couches **ne disent rien du métier**. Quand MOUSSAVOU veut savoir *où* mettre la règle « un numéro Airtel commence par `+24107` et un Moov par `+24106` », elle a quatre candidats légitimes :

1. Le controller, via `@Valid` sur le DTO.
2. Le service, via une vérification manuelle dans `creerAbonne()`.
3. L'entité JPA, via `@Pattern` Bean Validation.
4. Un `@PrePersist` listener Hibernate.

Réponse classique dans la vraie vie : **les quatre, en même temps, sans coordination**. C'est ce qu'on appelle l'**anemic domain model** (modèle de domaine anémique) : tes entités sont des sacs de getters/setters sans comportement. La logique métier se disperse comme du sucre versé sur une table. Et le jour où la règle change, tu passes 6 heures à chasser les copies.

> ⚠️ **Et l'IA dans tout ça ?**
>
> En 2026, ce que je viens de décrire n'arrive plus *malgré* l'IA — ça arrive **à cause** d'elle. ChatGPT, Claude, Copilot sont incroyables pour produire du code qui compile. Mais si tu ne sais pas **quelle architecture** tu vises, l'IA te livre 800 lignes de `UserService` aussi vite que tu peux les copier-coller. L'IA n'a aucune opinion sur l'architecture par défaut — elle reproduit le pattern le plus fréquent dans son corpus d'entraînement, qui est précisément le sandwich `@RestController` / `@Service` / `@Repository` que tu as vu sur 10 000 tutos.
>
> Plus vite, donc. Mais plus profondément en spaghetti 🍝

> 💡 L'astuce ? **Ne plus penser en couches techniques. Penser en *domaines métier*.** Et faire en sorte que la règle « un numéro Orange Money valide ressemble à ça » n'ait qu'**un seul endroit** où vivre. Spoiler : ce n'est pas dans le controller.

C'est exactement ce que DDD propose. Allons voir.

---

## 2. DDD — Modéliser le métier, pas la technique

DDD (*Domain-Driven Design*, conception pilotée par le domaine) part d'une idée simple : ton code doit refléter le métier, pas la mécanique technique. Quatre concepts à connaître. Quatre analogies pour les ancrer.

### 2.1 Bounded Context = département d'une entreprise

Imagine une grande boîte de distribution à Abidjan. Le service **commercial** parle de « client » : un prospect qu'il faut convaincre. Le service **comptabilité** parle de « client » aussi : un compte qu'il faut facturer. Le service **livraison** ? Encore « client » : une adresse où amener le colis. Trois départements, trois définitions différentes du même mot. Et c'est très bien comme ça.

Un **Bounded Context** (BC, contexte délimité) c'est exactement ça : un périmètre où un vocabulaire métier est cohérent. À l'intérieur du BC, « client » veut dire UNE chose. À la frontière, on traduit.

MboloPay a **trois bounded contexts** :

- `identite` — connaît les abonnés. Pour lui, un abonné a un nom, un numéro de téléphone gabonais, une date d'inscription.
- `portefeuille` — connaît les portefeuilles. Pour lui, un abonné est juste un identifiant qu'il transporte sans rien savoir d'autre.
- `shared` — un mini module ouvert qui contient `ExceptionDomaine`, racine de toutes les exceptions métier.

Chaque BC vit dans son propre paquet Java. Aucun n'importe les classes internes de l'autre. Comment ils communiquent alors ? On y vient, c'est la magie de Spring Modulith. Patience.

### 2.2 Aggregate = la racine et ses branches

Dans un BC, certaines classes sont plus importantes que d'autres. Elles sont des **Aggregate Roots** (racines d'agrégat) — les troncs d'arbres métier. Tu veux toucher une feuille ? Tu passes par la racine. Toujours.

Dans MboloPay, `Abonne` est un Aggregate Root du module `identite`. `Portefeuille` est un Aggregate Root du module `portefeuille`. Tu ne crées **jamais** un `Abonne` avec `new Abonne()` suivi de 12 setters. Tu utilises une factory :

```java
@AggregateRoot
public class Abonne {
    // ... champs privés finals

    public static Abonne creer(NomGabonais nom, NumeroTelephoneGabonais numero) {
        // les invariants s'appliquent ICI, à la naissance
        return new Abonne(AbonneId.nouveau(), nom, numero, Instant.now(), true);
    }

    // PAS de setNom(...), PAS de setNumero(...)
}
```

Pourquoi c'est révolutionnaire ? Parce qu'**un `Abonne`, dès qu'il existe, est valide**. Pas de phase « à moitié construit, j'attends d'appeler le setter suivant ». Pas de risque qu'un junior pressé oublie un `setActif(true)`. La règle métier vit dans la factory, pas éparpillée dans 10 endroits.

Tu te dis sûrement : « OK mais on perd la flexibilité des setters ». Réponse : oui. Et c'est précisément le but.

Un Aggregate Root sans ses invariants, c'est comme un kiosque mobile money qui prend l'argent sans noter qui a déposé combien. Techniquement opérationnel, statistiquement catastrophique.

Petit test IA : demande maintenant à Claude ou ChatGPT *« crée une classe Java Abonne avec nom et numéro de téléphone »*. Tu reçois 90 % du temps : `class Abonne { private String nom; public void setNom(...) }`. Modèle anémique. Setters publics. Aucun invariant.

Reformule : *« crée un Aggregate Root jMolecules pour Abonne, avec factory `creer()`, champs finals, et invariants appliqués à la construction »*. L'IA te génère exactement ce qu'on vient de voir, en 10 secondes.

**La différence n'est pas dans l'IA. Elle est dans ton vocabulaire.**

### 2.3 Value Object = identité par la valeur, pas par la référence

Maintenant le vrai changement de mentalité — celui qui va régler une bonne partie de l'insomnie d'MOUSSAVOU.

Un **Value Object** (VO) est une classe qui représente une *valeur*, pas une *chose*. Un billet de 5000 FCFA et un autre billet de 5000 FCFA sont **interchangeables** : tu te fiches de leur numéro de série, ce qui compte c'est leur valeur. Donc `Argent(5000)` est égal à `Argent(5000)`, peu importe quel objet Java se cache derrière.

MboloPay a une foule de VOs. Les plus parlants :

- `AbonneId` — encapsule un `UUID`. Pas un `String`. Un `AbonneId`.
- `PortefeuilleId` — pareil mais distinct. Tu ne peux pas confondre les deux.
- `Argent` — un montant en FCFA. Validation à la construction : pas de montant négatif.
- `NumeroTelephoneGabonais` — un numéro qui *garantit* le format E.164 gabonais et l'opérateur (Airtel ou Moov).
- `NomGabonais` — un nom non vide, capitalisé, sans caractères exotiques.

Voici l'idée de `NumeroTelephoneGabonais` (extrait simplifié, vérifie le vrai code [sur GitHub](https://github.com/bangaromaric/mbolopay/tree/main/src/main/java/ga/banga/mbolopay/identite/domain/model/vo/NumeroTelephoneGabonais.java)) :

```java
@ValueObject
public record NumeroTelephoneGabonais(String valeur, OperateurMobile operateur) {
    public NumeroTelephoneGabonais {
        Objects.requireNonNull(valeur);
        if (!valeur.matches("\\+241[067]\\d{7}")) {
            throw new NumeroNonAutoriseException(valeur);
        }
        // operateur déduit du préfixe Airtel/Moov
    }
}
```

Maintenant regarde cette signature de méthode :

```java
public void transferer(AbonneId from, AbonneId to, Argent montant);
```

Tu peux ? Tu **ne peux pas** appeler `transferer(montant, from, to)` par erreur. Le compilateur Java refuse. Avec des `String` et `long` partout, tu aurais pu envoyer 1000 FCFA à un numéro de téléphone, ou pire — un identifiant client à la place du montant — et te demander pourquoi la prod est en feu un vendredi soir. bolooooh 

C'est ce qu'on appelle le **Types Driven Development** : *les erreurs métier deviennent des erreurs de compilation*. MOUSSAVOU, qui peste contre ses 47 tests cassés, aurait préféré que ces 47 tests soient remplacés par UN compilateur qui dit non. C'est exactement ce que les VOs offrent.

Et c'est ICI que ça devient intéressant avec l'IA. Une fois que tu connais les VOs, tu peux dire à Claude *« refactore cette classe pour remplacer chaque `String` par un Value Object typé »*. Il le fait en une minute. C'était sans toi 2 jours de refactor. Avec toi qui ne connais pas les VOs, c'était 0 jour — parce que tu n'aurais jamais demandé.

(Oui, je sais. Encore une analogie. C'est qu'on est dans un article pédagogique. Subis.)

### 2.4 Domain Event = annonce publique dans l'entreprise

Reprends ton entreprise au Gabon. Le service RH embauche quelqu'un. Que se passe-t-il ?

1. Les badges préparent un badge.
2. La paie ouvre un dossier salaire.
3. L'IT crée un compte mail.

Tout ça **en réaction**, sans que les RH appellent chaque service à la main. Comment ? Une **annonce publique** : « NDONG MENGUE a été embauchée le 15 mai. » Chaque service écoute, chacun fait son boulot. Personne ne dépend frontalement de personne.

C'est un **Domain Event** : un fait métier qui s'est produit, qu'on annonce, et que d'autres modules peuvent écouter.

MboloPay a `EvenementAbonneCree`, publié par `identite` quand un abonné est créé. Le module `portefeuille` l'écoute et crée automatiquement un portefeuille à 0 FCFA pour ce nouvel abonné.

```java
public record EvenementAbonneCree(AbonneId abonneId, Instant survenuLe) { }
```

Trois lignes. Un record immuable. **Aucune annotation Spring.** C'est un fait métier, pas un message technique. C'est l'`identite` qui annonce, et c'est le métier qui parle.

Tu vois où je veux en venir ? Le module `portefeuille` ne connaît pas le module `identite` au sens classique. Il connaît juste un *événement* — un nom dans un vocabulaire commun. Demain, on peut remplacer `identite` par un service externe sans toucher `portefeuille`.

C'est exactement la promesse de DDD : **modulariser par le métier, pas par la technique**.

---

## 3. Architecture Hexagonale — Le cœur et ses prises

Maintenant qu'on a nos agrégats, nos VOs et nos events, il reste UNE question : où on les met physiquement dans le code ?

### 3.1 L'idée fondatrice

L'**architecture hexagonale** (aussi appelée *Ports & Adapters*) répond : le **domaine** est au centre. Tout autour, des **adaptateurs** qui le connectent au monde extérieur — HTTP, base de données, message broker, UI, terminaux de paiement, tout ça.

Imagine un cœur. Au centre, ton domaine métier (`Abonne`, `Portefeuille`, leurs règles). Tout autour, des prises électriques. Chaque prise (*adapter*) peut être débranchée et remplacée sans toucher au cœur. Tu testes le cœur avec une fake prise (un repo en mémoire). Tu déploies en prod avec une prise JPA. Tu envisages une prise gRPC pour le mobile — tu la branches.

Tu ris ? Attends de voir la règle absolue.

### 3.2 Ports vs Adapters

Le domaine ne **demande** pas ce dont il a besoin avec des classes concrètes. Il déclare des **interfaces** :

- **Port `in`** : interface d'un cas d'usage. Exemple : `CreerAbonneUseCase`. Le monde extérieur l'appelle.
- **Port `out`** : interface dont le domaine a besoin pour fonctionner. Exemple : `DepotAbonne` (un repository), `PublieurEvenements` (un publisher).

Le domaine ne sait PAS qui implémente ces interfaces. Il dit « j'ai besoin de sauvegarder un Abonne ». C'est l'infrastructure qui répond : « OK, moi je le sauvegarde en JPA » (ou en mémoire pour les tests, ou en HTTP pour un microservice futur).

**Règle d'or à marteler trois fois** : dans MboloPay, `domain/port/in/` et `domain/port/out/` ne contiennent **QUE** des interfaces Java. Aucune classe concrète. Aucune dépendance Spring. C'est vérifié par un test ArchUnit qui casse le build si tu glisses une classe. On y revient au §5.

### 3.3 Les 4 couches MboloPay

Chaque module suit la même structure (ouvre `src/main/java/ga/banga/mbolopay/identite/` sur le [repo](https://github.com/bangaromaric/mbolopay) pour vérifier) :

```
identite/
├── domain/                 # ZÉRO framework. Le cœur.
│   ├── model/              # Abonne, AbonneId, NomGabonais, NumeroTelephoneGabonais
│   ├── event/              # EvenementAbonneCree (record)
│   ├── exception/          # NumeroDejaUtiliseException, NumeroNonAutoriseException
│   ├── port/in/            # CreerAbonneUseCase (interface)
│   ├── port/out/           # DepotAbonne, PublieurEvenements (interfaces)
│   └── service/            # logique métier pure
├── application/
│   └── service/            # CreerAbonneService — orchestration POJO
└── infrastructure/
    ├── primary/            # AbonneController (REST, ENTRE)
    └── secondary/          # DepotAbonneJpa, transactions, publishers (SORT)
```

Et le mieux ? Dans la démo en ligne — <https://mbolopay.banga.ga/> — active le *mode pédagogique* depuis `/profil`, puis le *slow-mo*. Crée un abonné. Tu verras l'opération traverser ces 4 couches **en direct**, avec un curseur lumineux qui glisse de Primary → Application → Domain → Secondary. C'est rare qu'un projet pédagogique te laisse voir l'architecture *en mouvement*. Profites-en.

### 3.4 La règle absolue

**Infrastructure dépend du Domaine. Jamais l'inverse.**

Si tu vois `import org.springframework.*` dans une classe sous `domain/`, c'est un bug. Si tu vois `@Entity` sur un Aggregate Root, c'est un bug. Si tu vois `@Service` sur un service d'application, c'est presque un bug — MboloPay rend ces services 100 % POJO et ajoute la transactionnalité par un *décorateur* infrastructure. Le domaine reste pur, framework-free, testable sans Spring.

Demande à l'IA *« sépare ce code en 4 couches hexagonales : primary, application, domain, secondary, avec ports in et out dans le domain »*. L'IA le fait. Bien. Vite. Mais elle ne te dira **jamais** *« tiens, il faudrait peut-être appliquer le pattern hexagonal ici »* si tu ne le sais pas déjà — c'est ton job à toi.

Tu trouves ça extrême ? Attends de voir comment Spring Modulith assemble plusieurs hexagones.

---

## 4. Spring Modulith — Assembler les bounded contexts proprement

### 4.1 Module = Bounded Context dans le monolithe

Spring Modulith te permet d'avoir **plusieurs bounded contexts dans le même monolithe Spring Boot**, avec des règles strictes vérifiées au runtime. Pas de microservices, pas de packaging Maven multi-module — juste des **paquets Java** avec des frontières déclarées et un test qui s'assure que personne ne triche.

C'est l'entre-deux idéal pour 90 % des projets : tu profites de la simplicité d'un monolithe (un seul JAR, une seule DB, des transactions ACID) tout en gardant la modularité d'un système distribué. Sans les emmerdes du réseau, du déploiement, et des transactions distribuées que personne ne sait vraiment debugger un samedi.

### 4.2 Trois mécanismes à connaître

**`@ApplicationModule`** sur le `package-info.java` racine du module — déclare le type (`OPEN`, `CLOSED`, `NESTED`) et les dépendances autorisées :

```java
@ApplicationModule(allowedDependencies = {"shared", "identite :: events"})
package ga.banga.mbolopay.portefeuille;
```

Traduction : le module `portefeuille` peut dépendre de `shared` (entièrement) et de la *named interface* `events` du module `identite`. Pas du reste. S'il essaie d'importer `identite.domain.model.Abonne`, le test échoue.

**`@NamedInterface`** sur un sous-paquet — l'expose à des modules sélectionnés. Le paquet `identite.domain.event` est annoté `@NamedInterface("events")` dans son `package-info.java`. C'est la **porte publique** d'`identite` vers les autres modules. Le reste du module est invisible de l'extérieur.

**`@ApplicationModuleListener`** — un listener cross-module qui s'exécute dans une transaction propre. Voici l'écouteur côté `portefeuille` :

```java
@Component
class EcouteurEvenementAbonne {
    private final CreerPortefeuilleUseCase creerPortefeuille;

    @ApplicationModuleListener
    void on(EvenementAbonneCree evt) {
        creerPortefeuille.executer(new CommandeCreerPortefeuille(evt.abonneId()));
    }
}
```

Trois annotations, deux mondes parfaitement isolés. Et le code reste *lisible*.

### 4.3 Le moment « OHHH »

Tu réalises ? `portefeuille` ne sait absolument rien de `Abonne`. Il connaît juste un événement et un identifiant. Demain, on extrait `identite` en microservice ? On change le listener pour écouter Kafka au lieu d'un event Spring local. Le reste est intact.

C'est ça, la promesse tenue de **DDD + Hexagonal + Modulith réunis**. Et c'est ça que MOUSSAVOU cherchait depuis 18 mois sans savoir le nommer.

*Un dernier mot sur l'IA :* Claude, ChatGPT, Copilot connaissent parfaitement Spring Modulith. Les annotations, les listeners, les Named Interfaces — ils te génèrent tout ça parfaitement. Ce qu'aucun de ces outils ne peut faire pour toi : **décider où passent les frontières entre tes bounded contexts**. Cette décision est purement métier. Elle vient de ta compréhension du problème, pas de l'IA. Et c'est précisément la décision la plus importante de ton architecture.

---

## 5. jMolecules et jSpecify — Les deux helpers qui changent tout

### 5.1 jMolecules : rendre DDD lisible à la machine

jMolecules est une mini bibliothèque qui fournit des annotations DDD : `@AggregateRoot`, `@Identity`, `@ValueObject`, `@DomainEvent`, etc. Aucune magie runtime — c'est juste du marquage déclaratif.

Avantages concrets :

- Le code dit *exactement* ce qu'il est. `@AggregateRoot class Abonne` se lit en une seconde.
- Tu peux écrire des tests d'architecture qui se basent dessus.
- Des plugins (IntelliJ, autres outils) reconnaissent la sémantique et te guident.

### 5.2 jSpecify : null-safety modernisée

jSpecify est l'évolution de `@Nullable`/`@NonNull` en standard moderne supporté par Eclipse, IntelliJ, et bientôt javac. MboloPay annote ses paquets avec `@NullMarked`, ce qui veut dire : *tout est non-null par défaut, sauf si explicitement marqué `@Nullable`*.

Conséquence pour MOUSSAVOU : moins de NPE en prod, plus de retours `Optional<T>` invasifs partout, plus de bug silencieux « le numéro est null ». C'est gratuit, c'est moderne, c'est non-invasif. Tu peux l'adopter dans ton prochain projet ce soir.

---

## 6. Et les tests, dans tout ça ?

Tu as compris la théorie. Mais qu'est-ce qui empêche un junior pressé de tout casser le vendredi à 17h ?

**Trois suites de tests**, qui cassent le build à la moindre violation :

- **`HexagonalArchitectureTest`** (ArchUnit, 18 règles). Vérifie qu'aucune classe du domaine n'importe Spring, JPA, Jackson ou Jakarta Validation. Vérifie que `domain/port/in|out` ne contiennent QUE des interfaces. Vérifie que toutes les exceptions métier héritent de `ExceptionDomaine`. Vérifie que les `@RestController` vivent UNIQUEMENT dans `infrastructure/primary/web/`.

- **`ModularityTests`** (Spring Modulith). Vérifie la structure modulaire, les `allowedDependencies` déclarées dans les `package-info.java`, l'absence de cycles entre modules. Génère même un diagramme PlantUML automatiquement dans `target/spring-modulith-docs/`.

- Tests unitaires métier classiques sur les VOs et Aggregates.

Le truc essentiel ? Ces règles sont vérifiées par des tests qui **CASSENT le build**. Si demain MOUSSAVOU importe `org.springframework.*` dans `domain/`, sa PR ne passe pas la CI. *L'architecture est devenue exécutable.* C'est la différence entre « on a une convention » et « on a une garantie ». Ton lead dort mieux la nuit. Toi aussi.

Pour voir, clone le repo et lance :

```bash
./mvnw test -Dtest=HexagonalArchitectureTest,ModularityTests
```

15 secondes pour valider que ton architecture tient debout. Imbattable.

> 💡 **En 2026 ces tests deviennent ton meilleur garde-fou contre l'IA.** Quand ChatGPT te génère un code qui marche mais qui glisse un `import org.springframework.*` dans le domaine pour gagner du temps, ton CI s'écroule. Tu vois le bug. Tu redresses. Sans `HexagonalArchitectureTest`, tu n'aurais rien vu — et ton code aurait dérivé en six mois.

---

## 7. L'IA dans tout ça — 3 règles d'or pour les juniors en 2026

Si tu es arrivé·e jusqu'ici, tu as compris le fond. Reste un sujet qu'on ne peut plus esquiver en 2026 : **comment utiliser l'IA SANS qu'elle détruise ton architecture**.

Tu utilises probablement Claude, ChatGPT ou Copilot tous les jours. Moi aussi. Sans eux, MboloPay aurait pris deux ans au lieu de huit mois. **Mais pendant ces huit mois, j'ai appris une chose que personne ne dit assez fort** : l'IA n'a pas d'opinion sur l'architecture. Elle exécute ce que tu lui demandes. Si tu lui demandes mal, elle exécute mal — vite.

Trois règles d'or, durement apprises :

### 7.1 Apprends l'architecture AVANT de l'utiliser pour produire de l'architecture

L'IA est l'assistant le plus brillant que tu auras jamais. Mais c'est un **assistant**. Il accélère. Il n'oriente pas. Si tu lui demandes *« fais-moi une appli de mobile money »*, il te génère un `MobileMoneyService` de 600 lignes qui marche. C'est toi qui dois lui dire *« isole un bounded context identite et un bounded context portefeuille, communique par événement de domaine »*.

Sans cette phrase, tu obtiens un monstre. Avec, tu obtiens MboloPay.

### 7.2 Donne le vocabulaire métier exact

Ce que Claude/ChatGPT/Copilot ne savent pas, c'est ton domaine. Mais ils savent EXACTEMENT comment écrire un Aggregate Root, un Value Object, une factory, un Domain Event, un `@ApplicationModuleListener`. Le vocabulaire technique, ils l'ont avalé pendant leur entraînement.

Ton job : leur donner ce vocabulaire enrichi du tien. Au lieu de *« valide le numéro de téléphone »*, écris *« crée un Value Object `NumeroTelephoneGabonais` avec validation E.164, opérateur Airtel/Moov détecté depuis le préfixe, et exception métier `NumeroNonAutoriseException` qui hérite de `ExceptionDomaine` »*. L'IA livre. Parfait. En 30 secondes.

### 7.3 Verrouille avec des tests d'architecture

L'IA peut **changer d'avis** au prochain prompt. Tu lui as dit hier de respecter les couches hexagonales ; demain elle glissera un `@Service` dans le domaine parce que ce sera plus court. Tu ne verras pas tout.

Tes 18 règles ArchUnit et tes `ModularityTests` sont des **garde-fous non-négociables**. Ils s'en fichent que le code soit de toi ou de Claude — si la règle est violée, le build casse. C'est ce qui empêche ton archi de pourrir silencieusement à chaque sprint.

> 💡 **La phrase à retenir** : en 2026, le vrai super-pouvoir n'est plus de savoir CODER. C'est de savoir **QUOI demander à l'IA**, et de **comprendre ce qu'elle te rend**. Tout le reste de cet article t'a donné ce vocabulaire.

---

## 8. À toi de jouer

Quatre mini-exercices, du plus simple au plus formateur. Compte 30 minutes pour les quatre :

1. **Ouvre la démo** à <https://mbolopay.banga.ga/>. Active *Mode pédagogique* dans `/profil`. Crée un abonné avec un numéro Airtel (`+24107XXXXXXX`). Repère les badges Q/C qui apparaissent et le flash de l'événement `EvenementAbonneCree`.

2. **Active le slow-mo** depuis le même `/profil`. Fais un dépôt de 5000 FCFA. Observe l'overlay qui traverse les 4 couches Hexa. Identifie quel composant est dans la couche Application, lequel est dans Domain, lequel est dans Secondary.

3. **Va sur GitHub** : <https://github.com/bangaromaric/mbolopay>. Ouvre [`Argent.java`](https://github.com/bangaromaric/mbolopay/tree/main/src/main/java/ga/banga/mbolopay/portefeuille/domain/model/vo/Argent.java). Liste les invariants appliqués au constructeur. Bonus : que se passe-t-il si tu passes un montant négatif ? Et un montant `null` ?

4. **Lance les tests d'architecture localement** :

   ```bash
   git clone https://github.com/bangaromaric/mbolopay.git
   cd mbolopay
   ./mvnw test -Dtest=HexagonalArchitectureTest
   ```

   Puis va dans n'importe quelle classe `domain/` et ajoute un `import org.springframework.stereotype.Service;`. Relance le test. Regarde le build mourir avec un message d'erreur précis. Ressuscite-le en supprimant l'import. *Ressens le pouvoir.*

5. **L'épreuve de l'IA**. Ouvre Claude ou ChatGPT. Tape : *« Crée une classe Java pour modéliser un numéro de téléphone gabonais. »* Note ce que tu reçois. Puis tape : *« Refais-le comme un Value Object jMolecules `@ValueObject` avec validation E.164 (`+241[067]\d{7}`), opérateur Airtel/Moov détecté depuis le préfixe, et exception métier `NumeroNonAutoriseException` qui hérite de `ExceptionDomaine`. »* Compare. Toute la différence est dans **ton vocabulaire**. C'est ce que tu viens d'apprendre.

---

## 9. Conclusion + Ressources

Récap en cinq lignes — à retenir avant le prochain prompt que tu enverras à Claude :

- **DDD** = on modélise le métier, pas la technique. Bounded Contexts, Aggregates, Value Objects, Domain Events.
- **Hexagonal** = le domaine est au centre. Tout autour, des adaptateurs interchangeables. Le domaine reste framework-free.
- **Spring Modulith** = plusieurs Bounded Contexts dans un monolithe, avec frontières vérifiées au runtime.
- **jMolecules** = annotations qui rendent DDD lisible à la machine (et à tes collègues).
- **jSpecify** = null-safety moderne, non-invasive, gratuite.

Ce que tu fais maintenant ? Tu clones MboloPay, tu lis le code, tu lances les tests, tu casses une règle volontairement pour voir, tu la répares. Ensuite, tu prends ton prochain projet perso (un mini blog, un gestionnaire de tâches, ton agrégateur de bourses universitaires) et tu essaies **UN seul** de ces patterns dessus. Les Value Objects. C'est le plus rapide à essayer, c'est ce qui te marquera le plus vite.

Pas tout d'un coup. Ne sois pas MOUSSAVOU qui passe deux nuits blanches à refactor tout son legacy. Sois MOUSSAVOU lundi matin : elle a appliqué un VO sur le numéro de téléphone, son lead a souri sur la PR, et elle a dormi le soir.

⚠️ **Une nuance d'honnêteté pour finir** : DDD/Hexagonal/Modulith ne sont **pas** la bonne réponse pour tous les projets. Pour un CRUD pur avec 3 entités et 0 règle métier, c'est de l'over-engineering. Ces patterns brillent quand le métier est riche, quand l'équipe grandit, quand le projet doit vivre 5+ ans. La fintech de MOUSSAVOU coche les trois cases. Le tien probablement aussi, sinon tu ne lirais pas cet article.

En 2026, savoir **coder** ne suffit plus — l'IA le fait. Savoir **demander à l'IA et comprendre sa réponse**, c'est ce qui te distingue. Toutes les notions de cet article (Bounded Context, Aggregate, Value Object, Port, Adapter, Named Interface) sont précisément le vocabulaire qui permet ce dialogue de qualité. Garde-les. Pratique-les. Sans elles, l'IA va plus vite — mais elle te conduira au précipice plus vite aussi.

### Ressources

- **Démo MboloPay** : <https://mbolopay.banga.ga/>
- **Repo GitHub** : <https://github.com/bangaromaric/mbolopay>
- **Livres** : *Domain-Driven Design* (Eric Evans), *Implementing Domain-Driven Design* (Vaughn Vernon), *Get Your Hands Dirty on Clean Architecture* (Tom Hombergs).
- **Docs en ligne** : [jmolecules.org](https://jmolecules.org), [jspecify.dev](https://jspecify.dev), [docs.spring.io/spring-modulith](https://docs.spring.io/spring-modulith).

Bonne route. Et **mbolo** si tu publies ton projet — partage le lien, j'irai lire.

---

*Article rédigé en pensant à tous les MOUSSAVOU qui codent tard le soir dans les fintechs naissantes du continent, avec ou sans l'aide de Claude, ChatGPT ou Copilot. MboloPay est volontairement éducatif et open source — utilise-le, fork-le, casse-le, améliore-le, et publie ton propre article si l'envie te prend.*

*Auteur du projet MboloPay : BANGA Romaric.*
