FROM busybox
WORKDIR /plugin
COPY --chown=voice:voice plugin .
