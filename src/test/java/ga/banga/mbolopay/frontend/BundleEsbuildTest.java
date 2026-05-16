package ga.banga.mbolopay.frontend;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Garde-fou sur le bundle généré par esbuild.
 *
 * <p>Vérifie après {@code mvn process-resources} que :
 * <ul>
 *   <li>le bundle {@code src/main/resources/static/js/main.js} a bien été produit,</li>
 *   <li>il n'y subsiste <b>aucun import nu</b> (= absence de la moindre dépendance
 *       non résolue qui partirait au navigateur),</li>
 *   <li>le {@code node_modules} synthétique contient les paquets clés ({@code @vaadin/router},
 *       {@code @material/web}, {@code path-to-regexp}, {@code tslib}) — toute oubli d'une
 *       ligne {@code <copy>} dans {@code pom.xml} (antrun) ferait échouer ce test.</li>
 * </ul>
 *
 * <p>Le test est désactivé par défaut (il dépend des artefacts de build qui peuvent ne pas
 * être présents) ; on l'active via la propriété système {@code mbolopay.frontend.check=true}
 * — typiquement positionnée dans la CI après un {@code mvn process-resources}.
 *
 * @author BANGA Romaric
 */
@EnabledIfSystemProperty(named = "mbolopay.frontend.check", matches = "true")
class BundleEsbuildTest {

    private static final Path PROJECT_ROOT = Path.of(System.getProperty("user.dir"));
    private static final Path BUNDLE = PROJECT_ROOT.resolve("src/main/resources/static/js/main.js");
    private static final Path NODE_MODULES = PROJECT_ROOT.resolve("node_modules");

    /** Détecte les imports nus subsistants (= clé qui ne commence pas par . ou /). */
    private static final Pattern IMPORT_NU = Pattern.compile(
            "(?m)^\\s*import\\b[^\"']*[\"']([^./][^\"']*)[\"']"
    );

    @Test
    void le_bundle_main_js_existe() {
        assertThat(BUNDLE).exists().isRegularFile();
        assertThat(BUNDLE).isNotEmptyFile();
    }

    @Test
    void le_bundle_ne_contient_aucun_import_nu_residuel() throws Exception {
        String contenu = Files.readString(BUNDLE);
        var matcher = IMPORT_NU.matcher(contenu);
        var importsNus = matcher.results()
                .map(r -> r.group(1))
                .filter(s -> !s.isBlank())
                .distinct()
                .toList();
        assertThat(importsNus)
                .as("Imports nus encore présents dans main.js — esbuild n'a pas su les résoudre. "
                        + "Ajouter le WebJar correspondant dans pom.xml et la ligne <copy> dans antrun.")
                .isEmpty();
    }

    @Test
    void le_node_modules_contient_les_paquets_critiques() {
        List<Path> paquetsRequis = List.of(
                NODE_MODULES.resolve("lit/index.js"),
                NODE_MODULES.resolve("@lit/reactive-element/reactive-element.js"),
                NODE_MODULES.resolve("@material/web/button/filled-button.js"),
                NODE_MODULES.resolve("tslib/tslib.es6.mjs")
        );
        for (Path requis : paquetsRequis) {
            assertThat(requis)
                    .as("Paquet manquant dans le node_modules synthétique : %s. "
                            + "Vérifier la section maven-antrun-plugin du pom.xml.", requis)
                    .exists();
        }
    }
}
