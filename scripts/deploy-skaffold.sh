#!/usr/bin/env bash
set -e

export NO_PROXY="${KUBERNETES_SERVICE_HOST}"

nvm use 14
yarn global add @voice-social/voice-skaffold-tools@latest

voice-deploy-skaffold "$@"