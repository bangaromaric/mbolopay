package ga.banga.mbolopay.shared.infrastructure.primary.web;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuration MVC transverse : forward des routes SPA vers {@code index.html}.
 * <p>
 * Toute route sans extension (qui ne ressemble pas à un asset) et qui n'est ni
 * {@code /api/**} (REST) ni {@code /webjars/**} (libs front) est forwardée vers
 * la coquille SPA. Le routeur côté client (Vaadin Router) prend ensuite le
 * relais pour afficher la bonne page.
 * <p>
 * Sans ce forward, un refresh navigateur sur {@code /creer-abonne} renverrait
 * un 404 HTTP : Spring ne saurait pas que cette URL est une route SPA.
 *
 * @author BANGA Romaric
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    /**
     * Enregistre le pattern d'URL à forwarder vers {@code /index.html}.
     * <p>
     * Le pattern {@code /{path:[^\\.]*}} matche une route SPA à un seul segment
     * sans point (ex. {@code /accueil}, {@code /creer-abonne}). La contrainte
     * regex {@code [^\\.]*} exclut tout segment contenant un point, donc les
     * assets ({@code .js}, {@code .css}, {@code .woff2}, {@code .svg}…) ne sont
     * pas interceptés et restent servis par les ressource handlers Spring.
     * <p>
     * <b>Limite assumée</b> : les routes SPA à plusieurs segments
     * (ex. {@code /profil/parametres}) ne sont pas couvertes. Un pattern
     * catch-all multi-segments comme {@code /{path:[^\\.]*}/{*remainder}}
     * intercepterait aussi les paths techniques imbriqués
     * (ex. {@code /js/main.js}), retournant le HTML d'{@code index.html} avec
     * un mauvais MIME — le navigateur refuserait alors le module ES.
     * <p>
     * Si des routes SPA à plusieurs segments deviennent nécessaires plus tard,
     * les déclarer explicitement une par une, ou ajouter un controller dédié
     * qui exclut manuellement {@code /api/**}, {@code /webjars/**},
     * {@code /js/**}, {@code /assets/**}.
     *
     * @param registry registre des view controllers fourni par Spring MVC
     */
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/{path:[^\\.]*}")
                .setViewName("forward:/index.html");
    }
}
