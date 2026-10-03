#!/usr/bin/env bash

# Wait for the final PostgreSQL process started by the official container
# entrypoint. pg_isready alone can succeed against the temporary bootstrap
# postmaster which is subsequently stopped before PID 1 execs final postgres.
prod01_wait_for_final_postgres() {
  local container="$1"
  local database_user="$2"
  local docker_bin="${PROD01_DOCKER_BIN:-docker}"
  local max_attempts="${PROD01_READINESS_MAX_ATTEMPTS:-120}"
  local sleep_seconds="${PROD01_READINESS_SLEEP_SECONDS:-1}"
  local stable_final_probes=0
  local attempt state sql_ready

  [[ -n "${container}" ]]
  [[ -n "${database_user}" ]]
  [[ "${max_attempts}" =~ ^[1-9][0-9]*$ ]]
  [[ "${sleep_seconds}" =~ ^[0-9]+$ ]]

  for ((attempt=1; attempt<=max_attempts; attempt+=1)); do
    state="$("${docker_bin}" inspect --format '{{.State.Status}}' "${container}" 2>/dev/null || true)"
    if [[ "${state}" != 'running' ]]; then
      printf 'PROD01_READINESS_FAIL attempt=%s container_state=%s\n' \
        "${attempt}" "${state:-unavailable}" >&2
      return 1
    fi

    if "${docker_bin}" exec "${container}" \
      pg_isready --username="${database_user}" --dbname=postgres >/dev/null 2>&1; then
      if "${docker_bin}" exec "${container}" sh -eu -c \
        'test "$(cat /proc/1/comm)" = postgres' >/dev/null 2>&1; then
        sql_ready="$("${docker_bin}" exec "${container}" psql \
          --no-psqlrc \
          --set=ON_ERROR_STOP=1 \
          --tuples-only \
          --no-align \
          --username="${database_user}" \
          --dbname=postgres \
          --command="SELECT current_database()='postgres' AND NOT pg_is_in_recovery() AND pg_postmaster_start_time() IS NOT NULL" \
          2>/dev/null || true)"
        if [[ "${sql_ready}" == 't' ]]; then
          stable_final_probes=$((stable_final_probes + 1))
          printf 'PROD01_FINAL_POSTGRES_PROBE attempt=%s stable=%s/2\n' \
            "${attempt}" "${stable_final_probes}"
          if [[ "${stable_final_probes}" -ge 2 ]]; then
            printf 'PROD01_FINAL_POSTGRES_READY\n'
            return 0
          fi
        else
          stable_final_probes=0
          printf 'PROD01_READINESS_WAIT attempt=%s phase=final-sql-not-ready\n' "${attempt}"
        fi
      else
        stable_final_probes=0
        printf 'PROD01_READINESS_WAIT attempt=%s phase=temporary-postmaster\n' "${attempt}"
      fi
    else
      stable_final_probes=0
      printf 'PROD01_READINESS_WAIT attempt=%s phase=postgres-unavailable\n' "${attempt}"
    fi

    sleep "${sleep_seconds}"
  done

  printf 'PROD01_READINESS_FAIL reason=final-postgres-timeout attempts=%s\n' \
    "${max_attempts}" >&2
  return 1
}
