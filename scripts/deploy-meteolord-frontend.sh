#!/usr/bin/env bash
# Safe, frontend-only MeteoLord deployment runner. It never uses git pull.
set -Eeuo pipefail
IFS=$'\n\t'

readonly SCRIPT_PATH="$(readlink -f "$0")"
readonly DEFAULT_REPO=/home/deploy/tecnolord-apps
readonly DEFAULT_STATE=/var/lib/meteolord-frontend-deploy
readonly DEFAULT_NODE_IMAGE=node:20-alpine

MODE=''
COMMIT=''
PACKAGE=''
ORIGINAL_ARGS=("$@")
REPO_DIR="${METEOLORD_REPO_DIR:-$DEFAULT_REPO}"
STATE_DIR="${METEOLORD_STATE_DIR:-$DEFAULT_STATE}"
BASE_URL="${METEOLORD_BASE_URL:-https://tecnolord.cat}"
NODE_IMAGE="${METEOLORD_NODE_IMAGE:-$DEFAULT_NODE_IMAGE}"
TEST_MODE="${METEOLORD_DEPLOY_TEST_MODE:-0}"

usage() {
  cat <<'USAGE'
Usage:
  sudo scripts/deploy-meteolord-frontend.sh --check  (--commit <sha> | --package <source.tar.gz>)
  sudo scripts/deploy-meteolord-frontend.sh --deploy (--commit <sha> | --package <source.tar.gz>)
  sudo scripts/deploy-meteolord-frontend.sh --rollback

Builds the frontend in a Docker Node image, never changes the backend, database,
Compose stack, or the production Git checkout. --package contains source with
site/ and scripts/frontend/build-meteo.js; it is not an already-built release.
USAGE
}

die() { printf 'METEOLORD_FRONTEND_DEPLOY_FAIL %s\n' "$*" >&2; exit 1; }
log() { printf 'METEOLORD_FRONTEND_DEPLOY %s\n' "$*"; }

while (($#)); do
  case "$1" in
    --check|--deploy|--rollback) [[ -z "$MODE" ]] || die 'exactly one mode is required'; MODE="${1#--}" ;;
    --commit) COMMIT="${2:-}"; shift ;;
    --package) PACKAGE="${2:-}"; shift ;;
    --repo-dir) REPO_DIR="${2:-}"; shift ;;
    --state-dir) STATE_DIR="${2:-}"; shift ;;
    --base-url) BASE_URL="${2:-}"; shift ;;
    --node-image) NODE_IMAGE="${2:-}"; shift ;;
    --help|-h) usage; exit 0 ;;
    *) die "unknown argument: $1" ;;
  esac
  shift
done

[[ -n "$MODE" ]] || { usage >&2; exit 2; }
if [[ "$MODE" == rollback ]]; then
  [[ -z "$COMMIT" && -z "$PACKAGE" ]] || die 'rollback does not accept source input'
else
  [[ -n "$COMMIT" || -n "$PACKAGE" ]] || die 'commit or package is required'
  [[ -z "$COMMIT" || -z "$PACKAGE" ]] || die 'use either commit or package, not both'
fi

if (( EUID != 0 )) && [[ "$TEST_MODE" != 1 ]]; then
  exec sudo -- "$SCRIPT_PATH" "${ORIGINAL_ARGS[@]}"
fi

readonly SITE_DIR="${METEOLORD_SITE_DIR:-$REPO_DIR/site}"
readonly LOCK_FILE="$STATE_DIR/deploy.lock"
readonly BACKUPS_DIR="$STATE_DIR/backups"
readonly WORK_DIR="$STATE_DIR/work"
readonly STABLE_FILES=(index.html compte/index.html mapa/index.html assets/icons/site.webmanifest)

mkdir -p "$BACKUPS_DIR" "$WORK_DIR"
exec 9>"$LOCK_FILE"
flock -n 9 || die 'another MeteoLord frontend deployment is running'
[[ -d "$SITE_DIR" ]] || die "site directory is missing: $SITE_DIR"

clean_run_dir=''
cleanup() { [[ -z "$clean_run_dir" ]] || rm -rf -- "$clean_run_dir"; }
trap cleanup EXIT

release_from_json() {
  local file="$1"
  sed -n 's/.*"version":"\([0-9a-f]\{64\}\)".*/\1/p' "$file"
}

assert_caddy_cache_contract() {
  local caddy="$REPO_DIR/Caddyfile"
  [[ -f "$caddy" ]] || die "Caddyfile is missing: $caddy"
  awk '
    /^  handle @meteo_runtime \{/ { section="runtime" }
    /^  handle_path \/meteo\*/ { section="meteo" }
    section && /header Cache-Control "no-store, max-age=0"/ { found[section]=1 }
    /^  }/ { section="" }
    END { exit !(found["runtime"] && found["meteo"]) }
  ' "$caddy" || die 'required Meteo Cache-Control contract is absent from Caddyfile'
}

assert_live_cache_contract() {
  local headers endpoint
  for endpoint in /meteo/ /meteo/runtime-config.js; do
    headers="$(curl --fail --silent --show-error --head --max-time 15 "$BASE_URL$endpoint")" \
      || die "cannot read live headers for $endpoint"
    grep -qi '^Cache-Control:.*no-store.*max-age=0' <<<"$headers" \
      || die "live cache contract is missing for $endpoint"
  done
}

assert_live_release() {
  local version="$1" body live_version relative
  body="$(curl --fail --silent --show-error --max-time 15 "$BASE_URL/meteo/release.json")" \
    || die 'published release.json is not reachable'
  live_version="$(printf '%s' "$body" | sed -n 's/.*"version":"\([0-9a-f]\{64\}\)".*/\1/p')"
  [[ "$live_version" == "$version" ]] || die 'live release.json does not match candidate'
  for relative in src/main.js src/styles.css map-assets/maplibre-gl-worker.mjs; do
    local headers
    headers="$(curl --fail --silent --show-error --head --max-time 15 \
      "$BASE_URL/meteo/releases/$version/$relative")" \
      || die "published resource is not reachable: $relative"
    if grep -qi '^Content-Type:.*text/html' <<<"$headers"; then
      die "published resource resolved to the HTML fallback: $relative"
    fi
  done
}

source_from_commit() {
  local destination="$1"
  [[ "$COMMIT" =~ ^[0-9a-fA-F]{7,64}$ ]] || die 'commit must be a hexadecimal Git revision'
  [[ -d "$REPO_DIR/.git" ]] || die "Git repository is missing: $REPO_DIR"
  local resolved
  resolved="$(git -C "$REPO_DIR" rev-parse --verify "${COMMIT}^{commit}")" \
    || die 'commit is not available in the local VPS checkout'
  git -C "$REPO_DIR" archive --format=tar "$resolved" | tar -xf - -C "$destination"
  log "SOURCE commit=$resolved"
}

source_from_package() {
  local destination="$1"
  [[ -f "$PACKAGE" ]] || die "package is missing: $PACKAGE"
  tar -tzf "$PACKAGE" | awk '($0 ~ /^\// || $0 ~ /(^|\/)\.\.\//) { exit 1 }' \
    || die 'package contains an unsafe path'
  tar --no-same-owner -xzf "$PACKAGE" -C "$destination"
  local entries=()
  mapfile -t entries < <(find "$destination" -mindepth 1 -maxdepth 1 -printf '%f\n')
  if [[ ! -f "$destination/scripts/frontend/build-meteo.js" ]]; then
    [[ ${#entries[@]} -eq 1 && -d "$destination/${entries[0]}" ]] || die 'package lacks MeteoLord source root'
    destination="$destination/${entries[0]}"
  fi
  printf '%s' "$destination"
}

build_candidate() {
  clean_run_dir="$(mktemp -d "$WORK_DIR/run.XXXXXX")"
  local source="$clean_run_dir/source"
  local output="$clean_run_dir/output"
  mkdir -p "$source" "$output"
  if [[ -n "$COMMIT" ]]; then
    source_from_commit "$source"
  else
    source="$(source_from_package "$source")"
  fi
  [[ -f "$source/scripts/frontend/build-meteo.js" && -d "$source/site" ]] \
    || die 'source lacks the MeteoLord frontend builder or site directory'
  docker image inspect "$NODE_IMAGE" >/dev/null 2>&1 \
    || die "required Docker image is unavailable locally: $NODE_IMAGE"
  docker run --rm --network none --read-only --cap-drop ALL --security-opt no-new-privileges \
    --tmpfs /tmp:rw,noexec,nosuid,size=16m \
    --mount "type=bind,src=$source,dst=/workspace,readonly" \
    --mount "type=bind,src=$output,dst=/output" \
    "$NODE_IMAGE" node /workspace/scripts/frontend/build-meteo.js /output/web >/dev/null
  CANDIDATE_DIR="$output/web"
}

validate_candidate() {
  local output="$1"
  CANDIDATE_RELEASE="$(release_from_json "$output/release.json")"
  [[ "$CANDIDATE_RELEASE" =~ ^[0-9a-f]{64}$ ]] || die 'candidate release.json is invalid'
  local release_dir="$output/releases/$CANDIDATE_RELEASE"
  [[ -f "$release_dir/SHA256SUMS" ]] || die 'candidate has no release integrity manifest'
  (cd "$release_dir" && sha256sum --strict -c SHA256SUMS >/dev/null) \
    || die 'candidate versioned resources fail integrity validation'
  local relative
  for relative in "${STABLE_FILES[@]}"; do
    [[ -f "$output/$relative" ]] || die "candidate stable file missing: $relative"
  done
  for relative in index.html compte/index.html mapa/index.html; do
    grep -Fq "/meteo/releases/$CANDIDATE_RELEASE/" "$output/$relative" \
      || die "candidate HTML lacks versioned resources: $relative"
  done
}

current_release() {
  [[ -f "$SITE_DIR/release.json" ]] || return 0
  release_from_json "$SITE_DIR/release.json"
}

release_integrity_ok() {
  local version="$1" release_dir="$SITE_DIR/releases/$1"
  [[ -f "$release_dir/SHA256SUMS" ]] && (cd "$release_dir" && sha256sum --strict -c SHA256SUMS >/dev/null)
}

stable_matches_candidate() {
  local output="$1" relative
  for relative in "${STABLE_FILES[@]}" release.json; do
    cmp -s "$output/$relative" "$SITE_DIR/$relative" || return 1
  done
}

backup_current_stable() {
  local version="$1" relative
  BACKUP_DIR="$BACKUPS_DIR/$(date -u +%Y%m%dT%H%M%SZ)-before-$version"
  mkdir -p "$BACKUP_DIR/files" "$BACKUP_DIR/absent"
  for relative in "${STABLE_FILES[@]}" release.json; do
    if [[ -e "$SITE_DIR/$relative" ]]; then
      mkdir -p "$BACKUP_DIR/files/$(dirname "$relative")"
      cp -a "$SITE_DIR/$relative" "$BACKUP_DIR/files/$relative"
    else
      : >"$BACKUP_DIR/absent/${relative//\//_}"
    fi
  done
  printf '%s\n' "$(current_release || true)" >"$BACKUP_DIR/release-before.txt"
  printf '%s\n' "$BACKUP_DIR" >"$STATE_DIR/pending-backup"
}

atomic_install() {
  local source="$1" target="$2" temporary
  temporary="$(dirname "$target")/.$(basename "$target").new.$$"
  if [[ "$TEST_MODE" == 1 ]]; then
    install -D -m 0644 "$source" "$temporary"
  else
    install -D -o root -g root -m 0644 "$source" "$temporary"
  fi
  mv -f -- "$temporary" "$target"
}

publish_candidate() {
  local output="$1" release_dir="$SITE_DIR/releases/$CANDIDATE_RELEASE"
  if [[ -e "$release_dir" ]]; then
    release_integrity_ok "$CANDIDATE_RELEASE" || die 'existing release directory fails integrity; refusing overwrite'
    cmp -s "$output/releases/$CANDIDATE_RELEASE/SHA256SUMS" "$release_dir/SHA256SUMS" \
      || die 'existing release has the same version but different contents'
  else
    local temporary="$SITE_DIR/releases/.${CANDIDATE_RELEASE}.new.$$"
    if [[ "$TEST_MODE" == 1 ]]; then install -d -m 0755 "$temporary"
    else install -d -o root -g root -m 0755 "$temporary"; fi
    cp -r "$output/releases/$CANDIDATE_RELEASE/." "$temporary/"
    [[ "$TEST_MODE" == 1 ]] || chown -R root:root "$temporary"
    (cd "$temporary" && sha256sum --strict -c SHA256SUMS >/dev/null) \
      || die 'copied release fails integrity validation'
    mv -- "$temporary" "$release_dir"
  fi
  local relative
  for relative in "${STABLE_FILES[@]}"; do atomic_install "$output/$relative" "$SITE_DIR/$relative"; done
  if [[ "$TEST_MODE" == 1 && "${METEOLORD_DEPLOY_TEST_FAIL_AFTER_STABLE:-}" == 1 ]]; then
    die 'injected failure after stable files; run --rollback to recover'
  fi
  # The announcement is always the final write.
  atomic_install "$output/release.json" "$SITE_DIR/release.json"
}

restore_backup() {
  local backup="$1" relative
  [[ -d "$backup/files" && -d "$backup/absent" ]] || die 'backup is incomplete'
  for relative in "${STABLE_FILES[@]}"; do
    if [[ -f "$backup/files/$relative" ]]; then atomic_install "$backup/files/$relative" "$SITE_DIR/$relative"
    elif [[ -e "$backup/absent/${relative//\//_}" ]]; then rm -f -- "$SITE_DIR/$relative"
    else die "backup does not describe: $relative"; fi
  done
  # release.json is deliberately restored last, like normal publication.
  relative=release.json
  if [[ -f "$backup/files/$relative" ]]; then atomic_install "$backup/files/$relative" "$SITE_DIR/$relative"
  elif [[ -e "$backup/absent/${relative//\//_}" ]]; then rm -f -- "$SITE_DIR/$relative"
  else die 'backup does not describe release.json'; fi
}

rollback() {
  local record="$STATE_DIR/pending-backup"
  [[ -f "$record" ]] || record="$STATE_DIR/last-success-backup"
  [[ -f "$record" ]] || die 'no deployment backup is available for rollback'
  local backup
  backup="$(<"$record")"
  restore_backup "$backup"
  rm -f -- "$STATE_DIR/pending-backup"
  printf '%s\n' "$backup" >"$STATE_DIR/last-rollback"
  log "ROLLBACK_PASS backup=$backup"
}

if [[ "$MODE" == rollback ]]; then
  rollback
  exit 0
fi

assert_caddy_cache_contract
assert_live_cache_contract
CANDIDATE_RELEASE=''
CANDIDATE_DIR=''
build_candidate
validate_candidate "$CANDIDATE_DIR"
log "CHECK_PASS release=$CANDIDATE_RELEASE"
if [[ "$MODE" == check ]]; then exit 0; fi

if [[ "$(current_release || true)" == "$CANDIDATE_RELEASE" ]] \
  && release_integrity_ok "$CANDIDATE_RELEASE" && stable_matches_candidate "$CANDIDATE_DIR"; then
  log "DEPLOY_NO_CHANGES release=$CANDIDATE_RELEASE"
  exit 0
fi

backup_current_stable "$CANDIDATE_RELEASE"
publish_candidate "$CANDIDATE_DIR"
assert_live_cache_contract
assert_live_release "$CANDIDATE_RELEASE"
[[ "$(current_release)" == "$CANDIDATE_RELEASE" ]] || die 'published release.json does not match candidate'
release_integrity_ok "$CANDIDATE_RELEASE" || die 'published release fails integrity validation'
mv -f -- "$STATE_DIR/pending-backup" "$STATE_DIR/last-success-backup"
log "DEPLOY_PASS release=$CANDIDATE_RELEASE"
