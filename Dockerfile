FROM debian:bullseye AS deb
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get upgrade -y && apt-get clean && \
    ln -sf /usr/share/zoneinfo/Europe/Moscow /etc/localtime && dpkg-reconfigure --frontend noninteractive tzdata


FROM deb AS nodejs

RUN apt-get install -y curl gnupg && \
    curl -sL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get update && apt-get install -y nodejs && \
    apt-get remove --purge -y curl gnupg && apt-get autoremove --purge -y && apt-get clean


FROM nodejs AS builder

RUN apt-get install -y build-essential && \
    apt-get install -y curl gnupg && \
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    apt-get update && apt-get install -y yarn && \
    apt-get remove --purge -y curl gnupg && apt-get autoremove --purge -y && apt-get clean && \
    mkdir -p /app

WORKDIR /app

COPY log4js-safe-rotate-appender /app/log4js-safe-rotate-appender/
COPY \
    package.json \
    tsconfig.json \
    /app/

RUN yarn install

COPY src/ /app/src/
RUN yarn run build && \
    cp -a log4js-safe-rotate-appender package.json dist/ && \
    cd dist && \
    yarn install --production && \
    rm -rf log4js-safe-rotate-appender package.json


FROM nodejs AS runner

WORKDIR /app

COPY --from=builder /app/dist/ /app/

RUN mkdir -p /app/logs

#ENTRYPOINT exec node index.js


