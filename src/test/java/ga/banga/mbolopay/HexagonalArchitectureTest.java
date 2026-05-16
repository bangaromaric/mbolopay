package ga.banga.mbolopay;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.importer.ImportOption.DoNotIncludeTests;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;
import ga.banga.mbolopay.shared.exception.ExceptionDomaine;

/**
 * Vérifie que chaque Bounded Context respecte les règles de l'architecture hexagonale.
 *
 * <p>Structure imposée par BC :
 * <pre>
 * {bc}/
 *   domain/
 *     model/        — Entités, Agrégats, Value Objects, Enums
 *     event/        — Événements de domaine (records)
 *     exception/    — Sous-classes de {@link ExceptionDomaine}
 *     command/      — DTOs de commande entrante (records)
 *     port/in/      — Ports entrants (interfaces de use cases UNIQUEMENT)
 *     port/out/     — Ports sortants (interfaces de repositories / services externes UNIQUEMENT)
 *     service/      — Domain services (logique métier pure, framework-free)
 *   application/
 *     service/      — Application services (orchestration uniquement)
 *   infrastructure/
 *     primary/      — Adaptateurs entrants (REST, consumers d'événements)
 *     secondary/    — Adaptateurs sortants (implémentations des ports out)
 * </pre>
 *
 * @author BANGA Romaric
 */
@AnalyzeClasses(packagesOf = MboloPayApplication.class, importOptions = DoNotIncludeTests.class)
class HexagonalArchitectureTest {

    // -------------------------------------------------------------------------
    // Règles couche Domain
    // -------------------------------------------------------------------------

    /** Le domaine ne doit dépendre d'aucune couche infrastructure. */
    @ArchTest
    static final ArchRule domainNeDoitPasDependreDeLInfrastructure = noClasses()
            .that().resideInAPackage("..domain..")
            .should().dependOnClassesThat().resideInAPackage("..infrastructure..")
            .as("La couche domain ne doit pas dépendre de infrastructure");

    /**
     * Le domaine est framework-agnostique : aucune dépendance sur Spring.
     *
     * <p>Les {@code package-info} sont exclus : ils peuvent porter des méta-annotations
     * Spring Modulith ({@code @NamedInterface}) qui sont des déclarations de packaging,
     * pas du code applicatif.
     */
    @ArchTest
    static final ArchRule domainNeDoitPasImporterSpring = noClasses()
            .that().resideInAPackage("..domain..")
            .and().doNotHaveSimpleName("package-info")
            .should().dependOnClassesThat().resideInAPackage("org.springframework..")
            .as("La couche domain ne doit pas dépendre de Spring Framework");

    /** Le domaine est framework-agnostique : aucune dépendance sur JPA / Hibernate. */
    @ArchTest
    static final ArchRule domainNeDoitPasImporterJpa = noClasses()
            .that().resideInAPackage("..domain..")
            .and().doNotHaveSimpleName("package-info")
            .should().dependOnClassesThat().resideInAnyPackage("javax.persistence..", "jakarta.persistence..", "org.hibernate..")
            .as("La couche domain ne doit pas dépendre de JPA/Hibernate");

    /** Le domaine ne dépend pas de Jackson (sérialisation = infrastructure). */
    @ArchTest
    static final ArchRule domainNeDoitPasImporterJackson = noClasses()
            .that().resideInAPackage("..domain..")
            .and().doNotHaveSimpleName("package-info")
            .should().dependOnClassesThat().resideInAPackage("com.fasterxml.jackson..")
            .as("La couche domain ne doit pas dépendre de Jackson");

    /** Le domaine ne dépend pas de Jakarta Validation (validation = infrastructure / primary). */
    @ArchTest
    static final ArchRule domainNeDoitPasImporterJakartaValidation = noClasses()
            .that().resideInAPackage("..domain..")
            .and().doNotHaveSimpleName("package-info")
            .should().dependOnClassesThat().resideInAPackage("jakarta.validation..")
            .as("La couche domain ne doit pas dépendre de Jakarta Validation");

    /**
     * Toute exception levée par le domaine doit hériter de {@link ExceptionDomaine}.
     *
     * <p>Garantit qu'une couche supérieure (REST controller, listener) peut traduire uniformément
     * les violations métier vers la frontière externe.
     */
    @ArchTest
    static final ArchRule exceptionsDomaineHeritentDeExceptionDomaine = classes()
            .that().resideInAPackage("..domain.exception..")
            .and().doNotHaveSimpleName("package-info")
            .should().beAssignableTo(ExceptionDomaine.class)
            .as("Les exceptions du domaine doivent hériter de ExceptionDomaine");

    // -------------------------------------------------------------------------
    // Règles couche Application
    // -------------------------------------------------------------------------

    /** L'application orchestre mais n'accède pas directement à l'infrastructure. */
    @ArchTest
    static final ArchRule applicationNeDoitPasDependreDeLInfrastructure = noClasses()
            .that().resideInAPackage("..application..")
            .should().dependOnClassesThat().resideInAPackage("..infrastructure..")
            .as("La couche application ne doit pas dépendre de infrastructure");

    /** L'application n'utilise pas Spring MVC (point d'entrée HTTP = primary adapter). */
    @ArchTest
    static final ArchRule applicationNeDoitPasImporterSpringMvc = noClasses()
            .that().resideInAPackage("..application..")
            .should().dependOnClassesThat().resideInAPackage("org.springframework.web..")
            .as("La couche application ne doit pas dépendre de Spring MVC");

    /**
     * Les services d'application doivent vivre dans {@code application/service/}, jamais à plat
     * sous {@code application/}.
     */
    @ArchTest
    static final ArchRule applicationServicesDansSousDossierService = classes()
            .that().resideInAPackage("..application..")
            .and().haveSimpleNameEndingWith("Service")
            .should().resideInAPackage("..application.service..")
            .as("Les services d'application doivent vivre dans application/service/");

    // -------------------------------------------------------------------------
    // Règles couche Infrastructure
    // -------------------------------------------------------------------------

    /**
     * La couche infrastructure ne contient que {@code primary/} et {@code secondary/} comme
     * sous-dossiers directs. Aucune classe ne doit vivre dans
     * {@code <module>/infrastructure/<autre>/} en dehors de ces deux familles.
     */
    @ArchTest
    static final ArchRule infrastructureNeContientQuePrimaryEtSecondary = classes()
            .that().resideInAPackage("..infrastructure..")
            .and().doNotHaveSimpleName("package-info")
            .should().resideInAnyPackage("..infrastructure.primary..", "..infrastructure.secondary..")
            .as("infrastructure/ ne doit contenir que primary/ et secondary/");

    /** Les adaptateurs primary ne connaissent pas les adaptateurs secondary. */
    @ArchTest
    static final ArchRule primaryNeDoitPasDependreDeSecondary = noClasses()
            .that().resideInAPackage("..infrastructure.primary..")
            .should().dependOnClassesThat().resideInAPackage("..infrastructure.secondary..")
            .as("Les adaptateurs primary ne doivent pas dépendre des adaptateurs secondary");

    /** Les adaptateurs secondary ne connaissent pas les adaptateurs primary. */
    @ArchTest
    static final ArchRule secondaryNeDoitPasDependreDePrimary = noClasses()
            .that().resideInAPackage("..infrastructure.secondary..")
            .should().dependOnClassesThat().resideInAPackage("..infrastructure.primary..")
            .as("Les adaptateurs secondary ne doivent pas dépendre des adaptateurs primary");

    /** Les {@code @RestController} sont des adaptateurs primaires : aucun ailleurs. */
    @ArchTest
    static final ArchRule controllersUniquementEnPrimary = classes()
            .that().areAnnotatedWith(org.springframework.web.bind.annotation.RestController.class)
            .should().resideInAPackage("..infrastructure.primary..")
            .as("Les @RestController doivent vivre dans infrastructure/primary/");

    // -------------------------------------------------------------------------
    // Règles sur les ports (Types Driven Development)
    // -------------------------------------------------------------------------

    /**
     * Les ports entrants (use cases) doivent être des interfaces UNIQUEMENT.
     * Ni classes, ni enums, ni records — la séparation port/implémentation est non négociable.
     */
    @ArchTest
    static final ArchRule portsEntrantsSontDesInterfaces = classes()
            .that().resideInAPackage("..domain.port.in..")
            .and().doNotHaveSimpleName("package-info")
            .should().beInterfaces()
            .as("Les ports entrants (domain.port.in) doivent être des interfaces");

    /**
     * Les ports sortants (repositories / services externes) doivent être des interfaces UNIQUEMENT.
     */
    @ArchTest
    static final ArchRule portsSortantsSontDesInterfaces = classes()
            .that().resideInAPackage("..domain.port.out..")
            .and().doNotHaveSimpleName("package-info")
            .should().beInterfaces()
            .as("Les ports sortants (domain.port.out) doivent être des interfaces");
}
