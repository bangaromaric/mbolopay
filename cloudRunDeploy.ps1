<#
.SYNOPSIS
  Build + déploie MboloPay sur Cloud Run en mode NATIF (GraalVM via Paketo Buildpacks).

.DESCRIPTION
  Workflow : bump version → commit/tag git → build natif (Linux) dans un container
  Paketo Buildpacks → push direct sur GCP Artifact Registry → déploiement Cloud Run.

  Prérequis (setup détaillé dans docs/deploy-cloud-run.md) :
    - Docker Desktop lancé (Paketo Buildpacks utilise Docker comme moteur de build).
    - gcloud CLI authentifié (`gcloud auth login`).
    - `docker-credential-gcr` installé et dans le PATH (helper officiel Google pour
      pousser vers Artifact Registry). Sans lui, le push Paketo échoue silencieusement.
    - Variables d'environnement définies :
        GCP_MBOLOPAY_PROJECT_ID    (ex: votre-projet-gcp)
        GCP_MBOLOPAY_REGION        (ex: europe-west1)
        GCP_MBOLOPAY_REPOSITORY    (ex: mbolopay)
        GCP_MBOLOPAY_IMAGE_NAME    (ex: mbolopay)
        GCP_MBOLOPAY_SERVICE_NAME  (ex: mbolopay)

  Notes :
    - Le build natif via Paketo prend ~5-10 min (compilation GraalVM + téléchargement
      builder paketobuildpacks/builder-noble-java-tiny la première fois).
    - Cold-start Cloud Run mesuré : ~200 ms (vs ~3-4 s en JVM classique).
    - H2 in-memory = données perdues à chaque cold-start et chaque instance Cloud Run
      a sa propre DB. Adapté uniquement à une démo. Pour la prod, brancher Cloud SQL
      et créer un application-prod.yml.

.AUTHOR
  BANGA Romaric
#>

# ============================================================
# 1. Lecture + validation des variables d'environnement
# ============================================================
$PROJECT_ID   = $env:GCP_MBOLOPAY_PROJECT_ID
$REGION       = $env:GCP_MBOLOPAY_REGION
$REPOSITORY   = $env:GCP_MBOLOPAY_REPOSITORY
$IMAGE_NAME   = $env:GCP_MBOLOPAY_IMAGE_NAME
$SERVICE_NAME = $env:GCP_MBOLOPAY_SERVICE_NAME

$requiredVars = @(
  "GCP_MBOLOPAY_PROJECT_ID",
  "GCP_MBOLOPAY_REGION",
  "GCP_MBOLOPAY_REPOSITORY",
  "GCP_MBOLOPAY_IMAGE_NAME",
  "GCP_MBOLOPAY_SERVICE_NAME"
)
foreach ($var in $requiredVars) {
    if (-not (Get-Item "env:$var" -ErrorAction SilentlyContinue)) {
        Write-Host "ERREUR : la variable d'environnement $var est manquante." -ForegroundColor Red
        exit 1
    }
}

try {
  # ============================================================
  # 2. Pré-requis : Docker Desktop + gcloud auth + docker-credential-gcr
  # ============================================================
  Write-Host "***** 1. Vérification de Docker Desktop... *****" -ForegroundColor Yellow
  docker info 2>$null | Out-Null
  if ($LASTEXITCODE -ne 0) {
    throw "Docker Desktop n'est pas lancé. Paketo Buildpacks nécessite Docker pour construire l'image."
  }

  Write-Host "***** 2. Vérification de l'authentification gcloud... *****" -ForegroundColor Yellow
  $gcloudUser = gcloud config get-value account 2>$null
  if (-not $gcloudUser) {
    throw "gcloud non authentifié. Lance 'gcloud auth login' d'abord."
  }
  Write-Host "Compte gcloud actif : $gcloudUser"

  Write-Host "***** 2bis. Vérification des Application Default Credentials (ADC)... *****" -ForegroundColor Yellow
  # docker-credential-gcr utilise les ADC, PAS les credentials de 'gcloud auth login'.
  # Sans ADC, le helper échoue avec 'invalid_grant Bad Request' et le push Maven plante
  # après les ~5-10 min de build natif — on coupe court ici en 1 seconde.
  $adcPath = "$env:APPDATA\gcloud\application_default_credentials.json"
  if (-not (Test-Path $adcPath)) {
    throw "Application Default Credentials non configurées. Lance 'gcloud auth application-default login' d'abord (ouvre un navigateur, à faire une fois)."
  }
  # Test fonctionnel : un token doit pouvoir être obtenu via ADC
  $adcToken = gcloud auth application-default print-access-token 2>$null
  if ([string]::IsNullOrWhiteSpace($adcToken)) {
    throw "ADC présentes mais le token ne peut pas être obtenu (probablement périmées). Relance 'gcloud auth application-default login'."
  }
  Write-Host "ADC OK : $adcPath"

  Write-Host "***** 2ter. Vérification du credential helper Docker (docker-credential-gcr)... *****" -ForegroundColor Yellow
  $helper = Get-Command docker-credential-gcr -ErrorAction SilentlyContinue
  if (-not $helper) {
    throw "docker-credential-gcr introuvable dans le PATH. Voir docs/deploy-cloud-run.md (section 'Installation de docker-credential-gcr') pour l'installer."
  }
  Write-Host "Helper trouvé : $($helper.Source)"

  # ============================================================
  # 3. Synchronisation avec main
  # ============================================================
  Write-Host "***** 3. Checkout main + pull origin... *****" -ForegroundColor Yellow
  git checkout main
  if ($LASTEXITCODE -ne 0) { throw "Échec du git checkout main" }
  git pull origin main
  if ($LASTEXITCODE -ne 0) { throw "Échec du git pull" }

  # ============================================================
  # 4. Bump de version Maven (X.Y.Z-SNAPSHOT -> X.Y.(Z+1)-SNAPSHOT)
  # ============================================================
  Write-Host "***** 4. Bump de version Maven... *****" -ForegroundColor Yellow
  ./mvnw -q versions:set -DnextSnapshot
  if ($LASTEXITCODE -ne 0) { throw "Échec du versions:set" }
  ./mvnw -q versions:commit
  if ($LASTEXITCODE -ne 0) { throw "Échec du versions:commit" }

  $pom = [xml](Get-Content "./pom.xml")
  $RAW_VERSION = $pom.project.version
  $VERSION = $RAW_VERSION -replace "-SNAPSHOT", ""
  Write-Host "Nouvelle version Maven : $RAW_VERSION" -ForegroundColor Green
  Write-Host "Tag Docker (sans SNAPSHOT) : $VERSION" -ForegroundColor Green

  # ============================================================
  # 5. Commit + push de la nouvelle version
  # ============================================================
  Write-Host "***** 5. Commit + push de la version... *****" -ForegroundColor Cyan
  git add pom.xml
  git commit -m "chore(release): bump version $VERSION pour déploiement Cloud Run"
  if ($LASTEXITCODE -ne 0) { throw "Échec du git commit" }
  git push origin main
  if ($LASTEXITCODE -ne 0) { throw "Échec du git push" }

  # ============================================================
  # 6. Création (ou recréation) du tag Git
  # ============================================================
  Write-Host "***** 6. Création du tag Git v$VERSION... *****" -ForegroundColor Magenta
  $TAG = "v$VERSION"
  $tagExists = git tag --list $TAG
  if ($tagExists -ne "") {
    Write-Host "Tag $TAG existe déjà, suppression et recréation..." -ForegroundColor Yellow
    git tag -d $TAG | Out-Null
    git push origin ":refs/tags/$TAG" | Out-Null
  }
  git tag $TAG -m "Release version $TAG (native image)"
  if ($LASTEXITCODE -ne 0) { throw "Échec du git tag" }
  git push origin $TAG
  if ($LASTEXITCODE -ne 0) { throw "Échec du git push tag" }
  Write-Host "Tag créé et poussé : $TAG" -ForegroundColor Green

  # ============================================================
  # 7. Configuration du projet GCP actif
  # ============================================================
  # Pas de docker login manuel ici : docker-credential-gcr (vérifié en étape 2bis)
  # prend le relais via les Application Default Credentials de gcloud. Maven/Paketo
  # lira automatiquement les credentials depuis ~/.docker/config.json grâce au helper.
  Write-Host "***** 7. Sélection du projet GCP... *****" -ForegroundColor Cyan
  gcloud config set project $PROJECT_ID

  # ============================================================
  # 8. Build NATIF (Paketo Buildpacks) + push direct vers Artifact Registry
  # ============================================================
  Write-Host "***** 8. Compilation native + push vers Artifact Registry (~5-10 min)... *****" -ForegroundColor Cyan
  $IMAGE_URL  = "${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}:${VERSION}"
  $LATEST_URL = "${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}:latest"

  $mvnArgs = @(
    "spring-boot:build-image",
    "-Pnative",
    "-DskipTests",
    "-Dspring-boot.build-image.imageName=$IMAGE_URL",
    "-Dspring-boot.build-image.publish=true"
  )
  & ./mvnw $mvnArgs
  if ($LASTEXITCODE -ne 0) { throw "Échec du build natif / push vers Artifact Registry" }

  # ============================================================
  # 9. Ajout du tag :latest (alias mutable vers la dernière release)
  # ============================================================
  Write-Host "***** 9. Push du tag :latest... *****" -ForegroundColor Cyan
  docker tag $IMAGE_URL $LATEST_URL
  docker push $LATEST_URL
  if ($LASTEXITCODE -ne 0) { throw "Échec du push du tag :latest" }

  # ============================================================
  # 10. Déploiement Cloud Run
  # ============================================================
  Write-Host "***** 10. Déploiement sur Cloud Run... *****" -ForegroundColor Cyan
  gcloud run deploy $SERVICE_NAME `
        --image $IMAGE_URL `
        --region $REGION `
        --project $PROJECT_ID `
        --port 8080 `
        --memory 512Mi `
        --cpu 1 `
        --min-instances 0 `
        --max-instances 10 `
        --allow-unauthenticated `
        --quiet
  if ($LASTEXITCODE -ne 0) { throw "Échec du déploiement Cloud Run" }

  $SERVICE_URL = gcloud run services describe $SERVICE_NAME `
                    --region $REGION `
                    --project $PROJECT_ID `
                    --format "value(status.url)"

  Write-Host ""
  Write-Host "********* SUCCÈS : Application déployée *********" -ForegroundColor Green
  Write-Host "URL service     : $SERVICE_URL"     -ForegroundColor Green
  Write-Host "Image versionnée : $IMAGE_URL"       -ForegroundColor Green
  Write-Host "Image latest    : $LATEST_URL"      -ForegroundColor Green
  Write-Host "Tag Git         : $TAG"             -ForegroundColor Green
}
catch {
  Write-Host ""
  Write-Host "ERREUR CRITIQUE : $_" -ForegroundColor Red
  exit 1
}
