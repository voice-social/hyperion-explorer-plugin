#!/usr/bin/env bash
set -e
set -x 

export NO_PROXY="${NO_PROXY},${KUBERNETES_SERVICE_HOST}"

yarn global add @voice-social/voice-skaffold-tools@latest

voice-deploy-skaffold "$@"
