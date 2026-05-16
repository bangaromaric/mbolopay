package ga.banga.mbolopay.shared.infrastructure.primary.web;

import org.junit.jupiter.api.Test;
import org.springframework.http.server.PathContainer;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.util.pattern.PathPatternParser;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Tests unitaires de {@link WebMvcConfig}.
 * <p>
 * Trois angles de vérification :
 * <ol>
 *   <li>contrat avec {@link ViewControllerRegistry} (bonnes URL, bon forward) ;</li>
 *   <li>compatibilité avec {@link PathPatternParser} de Spring 6+ (anti-régression
 *       sur l'erreur « {*...} or ** pattern elements should be placed at the
 *       start or end of the pattern ») ;</li>
 *   <li>les patterns enregistrés NE doivent PAS capturer les paths techniques
 *       comme {@code /js/main.js} — sinon Spring forward du HTML avec un MIME
 *       {@code text/html} et le navigateur refuse de charger le module ES.</li>
 * </ol>
 *
 * @author BANGA Romaric
 */
class WebMvcConfigTest {

    @Test
    void enregistre_le_pattern_forwarde_vers_index_html() {
        var registry = mock(ViewControllerRegistry.class);
        var reg = mock(ViewControllerRegistration.class);
        when(registry.addViewController(anyString())).thenReturn(reg);

        new WebMvcConfig().addViewControllers(registry);

        verify(registry).addViewController("/{path:[^\\.]*}");
        verify(reg).setViewName(eq("forward:/index.html"));
    }

    /**
     * Garde-fou anti-régression : tout pattern enregistré doit être parsable
     * par le {@link PathPatternParser} utilisé par défaut dans Spring 6+.
     */
    @Test
    void tous_les_patterns_sont_acceptes_par_path_pattern_parser() {
        var patterns = patternsEnregistres();
        var parser = PathPatternParser.defaultInstance;
        assertThat(patterns).isNotEmpty();
        for (String pattern : patterns) {
            assertThatNoException()
                    .as("Pattern '%s' rejeté par PathPatternParser", pattern)
                    .isThrownBy(() -> parser.parse(pattern));
        }
    }

    /**
     * Garde-fou anti-régression critique : aucun pattern fallback SPA ne doit
     * matcher un path d'asset (JS, CSS, WOFF2, SVG…). Si un de ces paths
     * était capturé, Spring forward {@code index.html} avec MIME
     * {@code text/html} → le navigateur refuse de charger le module ES et la
     * SPA ne démarre pas.
     */
    @Test
    void aucun_pattern_ne_capture_les_paths_techniques() {
        var patterns = patternsEnregistres();
        var parser = PathPatternParser.defaultInstance;
        var pathsTechniques = List.of(
                "/js/main.js",
                "/js/main.js.map",
                "/assets/css/tokens.css",
                "/assets/fonts/Inter-Variable.woff2",
                "/assets/icons/favicon.svg",
                "/webjars/lit/3.2.0/index.js",
                "/api/abonnes",
                "/api/abonnes/sante",
                "/api/portefeuilles/abonne/123"
        );

        for (String pattern : patterns) {
            var compile = parser.parse(pattern);
            for (String path : pathsTechniques) {
                assertThat(compile.matches(PathContainer.parsePath(path)))
                        .as("Pattern '%s' capture à tort le path technique '%s'", pattern, path)
                        .isFalse();
            }
        }
    }

    /**
     * Vérification positive : les routes SPA déclarées (mono-segment sans point)
     * SONT bien capturées par le pattern fallback.
     */
    @Test
    void le_pattern_capture_bien_les_routes_spa_mono_segment() {
        var patterns = patternsEnregistres();
        var parser = PathPatternParser.defaultInstance;
        var routesSpa = List.of("/accueil", "/creer-abonne", "/profil", "/route-inconnue");

        for (String route : routesSpa) {
            var captured = patterns.stream()
                    .map(parser::parse)
                    .anyMatch(p -> p.matches(PathContainer.parsePath(route)));
            assertThat(captured)
                    .as("Route SPA '%s' devrait être capturée par un des patterns fallback", route)
                    .isTrue();
        }
    }

    private List<String> patternsEnregistres() {
        var registry = mock(ViewControllerRegistry.class);
        var reg = mock(ViewControllerRegistration.class);
        List<String> patterns = new ArrayList<>();
        when(registry.addViewController(anyString())).thenAnswer(invocation -> {
            patterns.add(invocation.getArgument(0));
            return reg;
        });
        new WebMvcConfig().addViewControllers(registry);
        return patterns;
    }
}
