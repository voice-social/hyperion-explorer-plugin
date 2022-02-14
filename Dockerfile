FROM node:16.5
# WORKDIR /opt
RUN npm install pm2 -g
RUN git clone https://github.com/eosrio/hyperion-history-api.git
WORKDIR /hyperion-history-api
COPY scripts/start-hyperion.sh ./

RUN git checkout  v3.3.5 && \
         chmod 777 hpm start-hyperion.sh && \
         npm install  
COPY . plugins/repos/explorer

RUN npm install plugins/repos/explorer && \
    ./hpm enable explorer && \
    pm2 startup

RUN adduser --system --group voice && chown -R voice:voice /hyperion-history-api
USER voice
RUN  npm install

EXPOSE 7000
