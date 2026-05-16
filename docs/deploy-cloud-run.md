# Déploiement Cloud Run — MboloPay (image native)

Ce guide couvre le déploiement de MboloPay sur Google Cloud Run en mode natif (GraalVM via Paketo Buildpacks), à partir de Windows.

Le déploiement est automatisé par `cloudRunDeploy.ps1` à la racine du projet. Avant le premier run, **un setup machine est requis une seule fois**.

## Setup initial (une seule fois par machine)

### 1. Variables d'environnement

Définir les 5 variables `GCP_MBOLOPAY_*` pour ton utilisateur Windows :

```powershell
[Environment]::SetEnvironmentVariable("GCP_MBOLOPAY_PROJECT_ID",   "votre-projet-gcp", "User")
[Environment]::SetEnvironmentVariable("GCP_MBOLOPAY_REGION",       "europe-west1",     "User")
[Environment]::SetEnvironmentVariable("GCP_MBOLOPAY_REPOSITORY",   "mbolopay",         "User")
[Environment]::SetEnvironmentVariable("GCP_MBOLOPAY_IMAGE_NAME",   "mbolopay",         "User")
[Environment]::SetEnvironmentVariable("GCP_MBOLOPAY_SERVICE_NAME", "mbolopay",         "User")
```

**Ferme et rouvre PowerShell** pour qu'elles soient chargées, puis vérifie :

```powershell
Get-ChildItem Env: | Where-Object Name -like "GCP_MBOLOPAY_*"
```

### 2. Outils requis

| Outil | Vérification |
|---|---|
| Docker Desktop | `docker info` |
| gcloud CLI | `gcloud --version` |
| gcloud auth (CLI) | `gcloud auth login` |
| gcloud ADC | `gcloud auth application-default login` (⚠️ **distinct du précédent**, requis pour `docker-credential-gcr`) |
| Liberica NIK 25 | `native-image --version` (voir [`native-image-build.md`](native-image-build.md)) |
| VS Build Tools (MSVC) | déjà installé pour la compilation native |
| Git + GitHub auth | `gh auth login` (ou PAT via Git Credential Manager) |

> ⚠️ **Piège classique** : `gcloud auth login` ≠ `gcloud auth application-default login`.
> - Le 1er authentifie la CLI `gcloud` (commandes interactives).
> - Le 2ème écrit `%APPDATA%\gcloud\application_default_credentials.json`, utilisé par les SDKs/outils comme `docker-credential-gcr`.
>
> Sans ADC, le helper échoue avec `auth: "invalid_grant" "Bad Request"` lors du push Maven, **après les 5-10 min de build natif**. Le script `cloudRunDeploy.ps1` vérifie maintenant les ADC en 1 seconde au début pour couper court.

### 3. Installation de `docker-credential-gcr` (CRITIQUE)

C'est le helper officiel Google recommandé pour les scripts automatisés. **Sans lui, Maven/Paketo échoue à pousser vers Artifact Registry**, car `gcloud auth configure-docker` configure un credHelper qui pointe sur un binaire (`docker-credential-gcloud`) absent du PATH sur Windows.

**Étapes** :

1. Télécharger la release Windows depuis <https://github.com/GoogleCloudPlatform/docker-credential-gcr/releases/latest>
   - Fichier : `docker-credential-gcr_windows_amd64-X.Y.Z.zip`

2. Créer un dossier personnel pour les binaires utilisateur :
   ```powershell
   New-Item -Path "$env:USERPROFILE\bin" -ItemType Directory -Force
   ```

3. Extraire `docker-credential-gcr.exe` dans `$env:USERPROFILE\bin\`.

4. Ajouter ce dossier au `PATH` utilisateur :
   ```powershell
   $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
   if ($currentPath -notlike "*$env:USERPROFILE\bin*") {
       [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$env:USERPROFILE\bin", "User")
   }
   ```

5. **Fermer et rouvrir PowerShell**, puis vérifier :
   ```powershell
   where.exe docker-credential-gcr
   docker-credential-gcr version
   ```

6. Configurer Docker avec ce helper pour les registres GCP utilisés :
   ```cmd
   docker-credential-gcr configure-docker --registries=europe-west1-docker.pkg.dev,europe-west9-docker.pkg.dev,africa-south1-docker.pkg.dev
   ```
   Cette commande **remplace** les entrées `"gcloud"` (cassées) par `"gcr"` (fonctionnelles) dans `%USERPROFILE%\.docker\config.json`.

7. Vérifier le résultat :
   ```powershell
   Get-Content "$env:USERPROFILE\.docker\config.json"
   ```
   Tu dois voir :
   ```json
   "credHelpers": {
     "europe-west1-docker.pkg.dev": "gcr",
     ...
   }
   ```

8. Smoke test (l'image v0.0.6 a déjà été poussée manuellement) :
   ```powershell
   docker pull "${env:GCP_MBOLOPAY_REGION}-docker.pkg.dev/${env:GCP_MBOLOPAY_PROJECT_ID}/${env:GCP_MBOLOPAY_REPOSITORY}/${env:GCP_MBOLOPAY_IMAGE_NAME}:<TAG>"
   ```
   (avec `<TAG>` un tag déjà poussé, ex. `latest`). Doit fonctionner **sans aucun warning** lié à `docker-credential-gcloud`.

> **Une fois ce setup fait** : tout outil Docker (CLI, Maven/Paketo, Jib, kpack, kaniko…) s'authentifiera proprement sur n'importe quel registre GCP `*-docker.pkg.dev`, pour **tous les futurs projets**, sans intervention. Le helper utilise automatiquement tes Application Default Credentials (`gcloud auth login`).

## Setup côté GCP (par projet)

Vérifications/créations à faire une fois par projet GCP :

```powershell
# Facturation active sur le projet (à vérifier dans la Console Cloud)
# https://console.cloud.google.com/billing

# APIs requises
gcloud services enable `
    artifactregistry.googleapis.com `
    run.googleapis.com `
    iam.googleapis.com `
    --project=$env:GCP_MBOLOPAY_PROJECT_ID

# Dépôt Artifact Registry (Docker, dans la bonne région)
gcloud artifacts repositories create $env:GCP_MBOLOPAY_REPOSITORY `
    --repository-format=docker `
    --location=$env:GCP_MBOLOPAY_REGION `
    --description="Images Docker MboloPay (native)" `
    --project=$env:GCP_MBOLOPAY_PROJECT_ID

# Permissions IAM (si tu n'es pas Owner du projet)
gcloud projects add-iam-policy-binding $env:GCP_MBOLOPAY_PROJECT_ID `
    --member="user:$(gcloud config get-value account)" `
    --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding $env:GCP_MBOLOPAY_PROJECT_ID `
    --member="user:$(gcloud config get-value account)" `
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding $env:GCP_MBOLOPAY_PROJECT_ID `
    --member="user:$(gcloud config get-value account)" `
    --role="roles/iam.serviceAccountUser"
```

## Workflow de déploiement

Une fois le setup machine + GCP fait, le déploiement complet tient en **une commande** :

```powershell
.\cloudRunDeploy.ps1
```

Le script enchaîne :

1. Vérif Docker Desktop + auth gcloud + présence de `docker-credential-gcr`
2. `git checkout main` + `git pull`
3. Bump version Maven (`X.Y.Z-SNAPSHOT` → `X.Y.(Z+1)-SNAPSHOT`)
4. Commit + push de `pom.xml` sur `main`
5. Création du tag Git `vX.Y.Z+1`
6. `gcloud config set project`
7. **Build natif via Paketo** + push direct vers Artifact Registry
8. Tag `:latest` + push
9. Déploiement Cloud Run

Durée totale typique : ~7-12 minutes (la compilation native est le poste le plus long).

## Vérifier que tout fonctionne après déploiement

```powershell
# URL du service
gcloud run services describe $env:GCP_MBOLOPAY_SERVICE_NAME `
    --region $env:GCP_MBOLOPAY_REGION `
    --project $env:GCP_MBOLOPAY_PROJECT_ID `
    --format "value(status.url)"

# Cold-start dans les logs (doit afficher ~200 ms)
gcloud run services logs read $env:GCP_MBOLOPAY_SERVICE_NAME `
    --region $env:GCP_MBOLOPAY_REGION `
    --project $env:GCP_MBOLOPAY_PROJECT_ID `
    --limit 50 | Select-String "Started MboloPayApplication"

# Smoke test endpoint
curl https://<SERVICE_URL>/actuator
```

## Troubleshooting

| Erreur | Cause | Fix |
|---|---|---|
| `Cannot run program "docker-credential-gcloud"` | `docker-credential-gcr` non installé/non dans PATH | Étape 3 ci-dessus |
| `docker-credential-gcr/helper: ... auth: "invalid_grant" "Bad Request"` | ADC absentes ou périmées | `gcloud auth application-default login` |
| `'username' must not be null` (côté Maven build-image) | Conséquence du `invalid_grant` ci-dessus | Idem : reconfigurer ADC |
| `No 'io.buildpacks.builder.metadata' label found` | Cache Docker corrompu sur image Paketo | `docker system prune --all --force` puis relancer |
| `release version 25 not supported` (pendant `process-aot`) | `JAVA_HOME` pointe sur une JDK < 25 | Voir [`native-image-build.md`](native-image-build.md) — corriger `JAVA_HOME` vers Liberica NIK 25 |
| `Authentication failed for 'https://github.com/...'` | GitHub n'accepte plus l'auth par mot de passe | `gh auth login` (ou Personal Access Token via Git Credential Manager) |
| `Unauthenticated request... artifactregistry.repositories.uploadArtifacts` | `docker-credential-gcr` pas dans PATH, ou credHelpers encore à `"gcloud"` | Refaire étape 3 (vérifier `Get-Content config.json`) |
| `release version not supported` côté Maven | JDK active ≠ Java 25 | `mvnw.cmd -v` doit afficher Java 25 ; sinon corriger `JAVA_HOME` |
| `Échec du git push` | GitHub pas authentifié | `gh auth login` |

## Notes importantes

- **H2 in-memory** : la base est éphémère, donnée perdue à chaque cold-start Cloud Run et chaque instance a sa propre DB. Adapté uniquement à une démo. Pour la prod, brancher **Cloud SQL** + créer un profil Spring `application-prod.yml`.
- **`spring.jpa.open-in-view`** : warning au démarrage — à désactiver explicitement en prod.
- **Cold-start mesuré** : ~200 ms en natif vs ~3-4 s en JVM (voir [`native-image-build.md`](native-image-build.md) pour le benchmark détaillé).
- **Coût Cloud Run** : avec `--min-instances 0`, le service scale à zéro quand inutilisé → coût quasi-nul en idle.

## Auteur

BANGA Romaric
