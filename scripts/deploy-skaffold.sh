#!/usr/bin/env bash
set -e
set -x 

export NO_PROXY="${KUBERNETES_SERVICE_HOST}"

npm install @voice-social/voice-skaffold-tools
# export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm install v14 && npm install -g yarn retire zx 
# yarn global add @voice-social/voice-skaffold-tools@latest

voice-deploy-skaffold "$@"
