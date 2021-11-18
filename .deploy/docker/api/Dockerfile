FROM node:lts-alpine3.14

RUN apk update \
	&& apk add libexecinfo libexecinfo-dev \
	&& apk --no-cache add --virtual builds-deps build-base \
	snappy g++ snappy-dev gcc libgcc libstdc++ linux-headers \
    autoconf automake make nasm python2 git nginx \
	&& npm i -g npm \
	&& npm i --quiet node-gyp -g \
	&& npm config set python /usr/bin/python \
	&& npm i yarn -g --force

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.6.0/wait /wait

RUN npm install cross-env -g \
    && npm install pm2 -g --unsafe-perm \
    && chmod +x /wait

ENV APP_USER=node

ENV APP_HOME=/srv/emarket

## Set environment variables
ARG NODE_OPTIONS="--max-old-space-size=2048"
ENV NODE_OPTIONS $NODE_OPTIONS
ENV NODE_ENV production

RUN mkdir $APP_HOME && chown $APP_USER:$APP_USER $APP_HOME

USER $APP_USER

WORKDIR $APP_HOME

COPY --chown=$APP_USER:$APP_USER .snyk ./.snyk
COPY --chown=$APP_USER:$APP_USER package.json package.workspaces.json lerna.json tsconfig.base.json ./
COPY --chown=$APP_USER:$APP_USER packages/common    ./packages/common
COPY --chown=$APP_USER:$APP_USER packages/core      ./packages/core
COPY --chown=$APP_USER:$APP_USER packages/core/nginx/default.conf /etc/nginx/conf.d/default.conf

RUN yarn install --silent --frozen-lockfile && yarn cache clean

RUN yarn --cwd ./packages/common build && yarn --cwd ./packages/core build:prod

EXPOSE 5500 5501 5050 5555

CMD /wait && yarn --cwd ./packages/core prod
