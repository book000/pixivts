#!/bin/bash

# shellcheck disable=SC2046
[ -f .env ] && export $(grep -v '^#' .env | xargs)

pnpm install
pnpm run test -u
