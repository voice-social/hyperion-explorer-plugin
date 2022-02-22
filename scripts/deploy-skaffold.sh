#!/usr/bin/env bash
set -e
set -x 

export NO_PROXY="${KUBERNETES_SERVICE_HOST}"

nvm use 16
yarn global add @voice-social/voice-skaffold-tools@latest

voice-deploy-skaffold "$@"
