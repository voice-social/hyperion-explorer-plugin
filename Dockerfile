FROM gcr.io/voice-ops-dev/alpine-node:16 as build
ARG NPM_AUTH_TOKEN
USER root
RUN apk add git
USER voice
RUN  git clone https://github.com/voice-social/hyperion-history-api.git
WORKDIR /opt/app/hyperion-history-api
COPY --chown=voice:voice . plugins/repos/explorer
RUN cp  .npmrc.template .npmrc && npm ci &&  ./hpm build-all && rm .npmrc

FROM busybox
COPY --chown=voice:voice --from=build /opt/app/hyperion-history-api/plugins/repos/explorer /opt/app/hyperion-history-api/plugins/repos/explorer
