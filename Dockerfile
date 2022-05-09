FROM gcr.io/voice-ops-dev/alpine-node:16 as build

FROM busybox
COPY --chown=voice:voice --from=build /opt/app/hyperion-history-api/plugins/repos/explorer /opt/app/hyperion-history-api/plugins/repos/explorer
