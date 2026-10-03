#!/usr/bin/env bash

# Linux sockaddr_un.sun_path has 108 bytes including the terminating NUL.
# PROD-01 caps the complete socket pathname at 100 bytes, leaving seven
# pathname bytes plus the NUL as an explicit operational safety margin.
readonly PROD01_UNIX_SOCKET_PATH_SAFE_MAX_BYTES=100

prod01_socket_path_bytes() {
  LC_ALL=C printf '%s' "$1" | wc -c
}

prod01_assert_socket_path() {
  local socket_file="$1"
  local path_bytes
  [[ "${socket_file}" == /*/.s.PGSQL.5432 ]]
  path_bytes="$(prod01_socket_path_bytes "${socket_file}")"
  if (( path_bytes > PROD01_UNIX_SOCKET_PATH_SAFE_MAX_BYTES )); then
    printf 'PROD01_SOCKET_PATH_REJECTED bytes=%s safe_max=%s path=%s\n' \
      "${path_bytes}" "${PROD01_UNIX_SOCKET_PATH_SAFE_MAX_BYTES}" "${socket_file}" >&2
    return 1
  fi
  printf 'PROD01_SOCKET_PATH_ACCEPTED bytes=%s safe_max=%s\n' \
    "${path_bytes}" "${PROD01_UNIX_SOCKET_PATH_SAFE_MAX_BYTES}"
}

prod01_read_database_inventory() {
  local inventory_file="$1"
  local inventory canonical

  [[ -s "${inventory_file}" ]]
  if grep -n '^$' "${inventory_file}" >/dev/null; then
    printf 'PROD01_DATABASE_INVENTORY_REJECTED reason=blank-line file=%s\n' \
      "${inventory_file}" >&2
    return 1
  fi

  inventory="$(cat "${inventory_file}")"
  canonical="$(LC_ALL=C sort -u "${inventory_file}")"
  if [[ "${inventory}" != "${canonical}" ]]; then
    printf 'PROD01_DATABASE_INVENTORY_REJECTED reason=not-sorted-unique file=%s\n' \
      "${inventory_file}" >&2
    return 1
  fi
  printf '%s' "${inventory}"
}

prod01_assert_database_delta() {
  local before_file="$1"
  local after_file="$2"
  local target="$3"
  local before after expected

  [[ "${target}" =~ ^meteo_prod_dryrun_[0-9]{8}_[0-9]{6}$ ]]
  before="$(prod01_read_database_inventory "${before_file}")"
  after="$(prod01_read_database_inventory "${after_file}")"

  if grep -Fx "${target}" "${before_file}" >/dev/null; then
    printf 'PROD01_DATABASE_DELTA_REJECTED reason=target-already-in-baseline target=%s\n' \
      "${target}" >&2
    return 1
  fi

  expected="$(printf '%s\n%s\n' "${before}" "${target}" | LC_ALL=C sort -u)"
  if [[ "${after}" != "${expected}" ]]; then
    printf 'PROD01_DATABASE_DELTA_REJECTED reason=after-not-baseline-plus-target target=%s\n' \
      "${target}" >&2
    return 1
  fi

  printf 'PROD01_DATABASE_DELTA_PASS target=%s\n' "${target}"
}
