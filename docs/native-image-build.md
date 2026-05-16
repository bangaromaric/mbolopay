# Compilation native (GraalVM Native Image) — Guide Windows

## Pourquoi compiler en natif ?

- Démarrage en **~200 ms** (vs ~4 s en JVM)
- Empreinte mémoire divisée par ~3 (~80 Mo vs ~250 Mo)
- Pas de JIT warm-up : perf constante dès la première requête
- Idéal pour serverless, containers, edge computing — partout où le cold-start compte

## Prérequis Windows

### 1. Liberica NIK 25 (JDK + GraalVM Native Image)

Spring Boot 4 exige **Java 25** baseline. Les versions NIK antérieures (NIK 23 / Java 21) échouent avec :

```
NativeImageRequirementsException: Native Image must support at least Java 25 but Java 17 was detected
```

- Télécharger : <https://bell-sw.com/pages/downloads/native-image-kit/>
- Choisir : **NIK 25** — **Full** — **Windows x86_64** — installer **MSI**
- Pendant l'installation, **cocher** :
  - ✅ Add to `PATH`
  - ✅ Set `JAVA_HOME` variable

> **Liberica JDK 25 ≠ Liberica NIK 25.** La JDK seule ne contient pas `native-image.cmd`. Toujours installer la version **NIK** (Native Image Kit).

### 2. Visual Studio Build Tools (compilateur MSVC C/C++)

GraalVM Native Image sur Windows produit le binaire via `cl.exe`. Sans MSVC :

```
Error: Failed to find 'vcvarsall.bat' in a Visual Studio installation.
```

- Télécharger : <https://visualstudio.microsoft.com/visual-cpp-build-tools/>
- Charge de travail à cocher : **"Développement Desktop en C++"**
- Composants requis :
  - **MSVC v143 - VS 2022 C++ x64/x86 build tools** (latest)
  - **Windows 11 SDK** (ou Windows 10 SDK)

### 3. Vérification de l'environnement

Dans un **nouveau** `cmd` (PAS PowerShell — la syntaxe `%VAR%` ne fonctionne pas en PowerShell) :

```cmd
java --version              :: Doit afficher Java 25.x.x
echo %JAVA_HOME%            :: Doit pointer sur le dossier LibericaNIK-25-*
mvnw.cmd -v                 :: La ligne "Java version" doit être 25.x.x
native-image --version      :: Doit afficher une version GraalVM
dir "%JAVA_HOME%\bin\native-image.cmd"
```

⚠️ Piège classique après mise à jour de JDK : `JAVA_HOME` continue de pointer sur l'ancienne installation (orpheline) alors que `PATH` voit déjà Java 25. Maven utilise `JAVA_HOME` en priorité et échouera avec :

```
error: release version 25 not supported
```

**Fix** : Panneau Windows → "Variables d'environnement système" → modifier `JAVA_HOME` pour pointer sur `C:\Program Files\BellSoft\LibericaNIK-25-OpenJDK-25`, puis **fermer tous les terminaux** et en ouvrir un nouveau.

## Compilation

### Option A — x64 Native Tools Command Prompt (recommandé)

Menu Démarrer → chercher **"x64 Native Tools Command Prompt for VS 2022"** → l'ouvrir, puis :

```cmd
cd %USERPROFILE%\IdeaProjects\MboloPay
mvnw.cmd clean native:compile -Pnative
```

Ce prompt a déjà l'environnement MSVC chargé (`vcvars64.bat` exécuté automatiquement).

### Option B — cmd classique avec `vcvars64.bat` manuel

```cmd
call "C:\Program Files (x86)\Microsoft Visual Studio\18\BuildTools\VC\Auxiliary\Build\vcvars64.bat"
cd %USERPROFILE%\IdeaProjects\MboloPay
mvnw.cmd clean native:compile -Pnative
```

Le segment `\18\` correspond à la version majeure de VS Build Tools (18 = mise à jour 2026). Adapter selon la version installée — vérifier avec :

```cmd
dir "C:\Program Files (x86)\Microsoft Visual Studio\"
```

⚠️ **Ne PAS lancer depuis WSL, Git Bash ou MSYS** — `native-image.cmd` a besoin d'un environnement Windows natif avec MSVC chargé. Les commandes Maven Linux fonctionnent dans WSL pour les builds JVM, mais pas pour la compilation native.

**Durée typique** : ~2 minutes. Pic mémoire ~10 Go. Prévoir 16 Go de RAM minimum.

## Exécution

```cmd
cd target
MboloPay.exe
```

L'exécutable s'accompagne de plusieurs `.dll` générées dans `target/` :

- `awt.dll`, `fontmanager.dll`, `freetype.dll`, `javaaccessbridge.dll`, `javajpeg.dll`, `jawt.dll`, `lcms.dll`, `management_ext.dll`
- `java.dll`, `jvm.dll` (shims JDK)

Pour un **déploiement standalone**, copier tout le dossier `target/`, pas juste l'`.exe`.

## Benchmark mesuré (2026-05-16)

Mesure réalisée sur MboloPay avec Spring Boot 4.0.2 + Spring Modulith 2.0.2 + Hibernate 7.2.1 + Tomcat 11.0.15 + H2 in-memory.

| Phase | JVM (Java 25 + DevTools) | Natif (Java 25 AOT) | Gain |
|---|---|---|---|
| Démarrage → Tomcat initialisé | 1 207 ms | 36 ms | **33×** |
| Tomcat → Hikari démarré | 559 ms | 65 ms | 8,6× |
| Hikari → JPA initialisé | 774 ms | 14 ms | **55×** |
| JPA → Tomcat sur 8080 | 875 ms | 76 ms | 11,5× |
| **Total "Started in"** | **3 740 ms** | **205 ms** | **18,2×** |

### Trade-offs

| Critère | JVM | Natif |
|---|---|---|
| Démarrage | ~3-4 s | **~200 ms** |
| RAM résident | ~250 Mo | **~80 Mo** |
| Build time | **~10 s** | ~2 min |
| Taille livrable | **~50 Mo** JAR | ~180 Mo exe + DLLs |
| Reflection dynamique | **Marche d'office** | Nécessite hints AOT |
| Hot-reload (DevTools) | **Oui** | Non |
| Pic de perf (rps) | **JIT optimise au fil du temps** | Constante sans pic |

**Cas d'usage natif** : Lambda, Cloud Run, containers où le cold-start compte, CLI tools, edge.

**Cas d'usage JVM** : développement local (build instantané + DevTools), apps long-running où le JIT compense le démarrage.

## Troubleshooting

| Erreur | Cause | Fix |
|---|---|---|
| `Failed to find 'vcvarsall.bat'` | Pas de MSVC OU mauvais terminal | Installer VS Build Tools (charge C++) + lancer depuis **x64 Native Tools Prompt** |
| `Native Image must support at least Java 25 but Java 17 was detected` | NIK avec Java < 25 (typiquement NIK 23) | Installer **NIK 25** |
| `release version 25 not supported` lors de `process-aot` | `JAVA_HOME` pointe sur ancienne JDK | Mettre à jour `JAVA_HOME` vers NIK 25, **redémarrer le terminal** |
| `native-image is not installed in your JAVA_HOME` | LibericaJDK installée mais pas la variante NIK | Réinstaller la version **NIK** (Native Image Kit), pas la JDK seule |
| Le binaire ne démarre pas sur une autre machine | DLLs manquantes ou CPU incompatible | Copier tout `target/`, et **ne pas** utiliser `-march=native` |

## Optimisations optionnelles

GraalVM suggère trois améliorations à ajouter dans `pom.xml`, sur le `native-maven-plugin` :

```xml
<plugin>
    <groupId>org.graalvm.buildtools</groupId>
    <artifactId>native-maven-plugin</artifactId>
    <configuration>
        <buildArgs>
            <buildArg>--future-defaults=all</buildArg>
            <buildArg>-R:MaxHeapSize=512m</buildArg>
            <!-- <buildArg>-march=native</buildArg>  ⚠️ binaire non portable -->
        </buildArgs>
    </configuration>
</plugin>
```

- `--future-defaults=all` — prépare la migration vers la prochaine version GraalVM
- `-R:MaxHeapSize=512m` — empreinte mémoire prévisible en prod
- `-march=native` — perf CPU améliorée mais **binaire non portable** vers d'autres machines

## Notes Spring Boot 4 + Native

- L'AOT processing (`spring-boot-maven-plugin:process-aot`) tourne en **premier** : si cette étape échoue, le binaire n'est pas généré. C'est généralement un problème de JDK (`JAVA_HOME`).
- La console H2 (`/h2-console`) **ne fonctionne probablement pas** en mode natif — la servlet H2 utilise de la reflection dynamique non pré-enregistrée. Utiliser `./mvnw spring-boot:run` pour le développement.
- Spring Boot DevTools (`spring-boot-devtools`) est ignoré en mode natif (pas de hot-reload).
- Les warnings `'DynamicProxyConfigurationResources' is deprecated` au build viennent de dépendances Spring transitives — sans impact.

## Auteur

BANGA Romaric — documentation établie à partir de la session de debug du 2026-05-16.
