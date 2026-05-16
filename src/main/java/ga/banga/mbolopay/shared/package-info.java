/**
 * Module transverse exposant les types communs réutilisables par tous les bounded contexts
 * (exception racine {@link ga.banga.mbolopay.shared.exception.ExceptionDomaine}, etc.).
 *
 * <p>Déclaré {@link org.springframework.modulith.ApplicationModule.Type#OPEN} : tous ses
 * sous-packages sont visibles depuis les autres modules sans avoir à exposer chaque package
 * via {@code @NamedInterface}.
 *
 * @author BANGA Romaric
 */
@org.jspecify.annotations.NullMarked
@org.springframework.modulith.ApplicationModule(
    displayName = "Shared - Types transverses",
    type = org.springframework.modulith.ApplicationModule.Type.OPEN
)
package ga.banga.mbolopay.shared;
