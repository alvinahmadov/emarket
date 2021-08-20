FROM node:lts-alpine3.14 AS development

RUN apk update \
	&& apk add libexecinfo libexecinfo-dev \
	&& npm i -g npm \
	&& apk --no-cache add --virtual builds-deps build-base \
	snappy g++ snappy-dev gcc libgcc libstdc++ linux-headers autoconf automake make nasm python2 git nginx \
	&& npm install --quiet node-gyp -g \
	&& npm config set python /usr/bin/python \
	&& npm install yarn -g --force

ENV APP_USER=node

ENV APP_HOME=/srv/emarket

RUN mkdir $APP_HOME && chown $APP_USER:$APP_USER $APP_HOME

USER $APP_USER

WORKDIR $APP_HOME

COPY --chown=$APP_USER:$APP_USER package.json yarn.lock lerna.json package.workspaces.json ./
COPY --chown=$APP_USER:$APP_USER packages/core/package.json ./packages/core/package.json
COPY --chown=$APP_USER:$APP_USER .snyk ./.snyk
COPY --chown=$APP_USER:$APP_USER packages/core/.snyk ./packages/core/.snyk
COPY --chown=$APP_USER:$APP_USER packages/core/nginx ./packages/core/nginx
COPY --chown=$APP_USER:$APP_USER packages/common ./packages/common

RUN yarn install && yarn cache clean

FROM node:lts-alpine3.14 AS production

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.6.0/wait /wait

RUN npm install cross-env -g \
    && npm install pm2 -g --unsafe-perm \
    && chmod +x /wait

ENV APP_HOME=/home/emarket

RUN mkdir $APP_HOME && chown $APP_USER:$APP_USER $APP_HOME
RUN mkdir -p $APP_HOME/packages/common && chown $APP_USER:$APP_USER $APP_HOME/packages/common
RUN mkdir -p $APP_HOME/packages/core && chown $APP_USER:$APP_USER $APP_HOME/packages/core

USER $APP_USER

WORKDIR $APP_HOME

## Set environment variables
ARG NODE_OPTIONS="--max-old-space-size=2048"
ENV NODE_OPTIONS $NODE_OPTIONS
ENV NODE_ENV production

## Copy installed yarn packages
COPY --from=development --chown=$APP_USER:$APP_USER $APP_HOME/node_modules                  ./node_modules
COPY --from=development --chown=$APP_USER:$APP_USER $APP_HOME/packages/core/nginx           ./packages/core/nginx
COPY --from=development --chown=$APP_USER:$APP_USER $APP_HOME/packages/core/node_modules    ./packages/core/node_modules

COPY --chown=$APP_USER:$APP_USER package.json yarn.lock lerna.json package.workspaces.json tsconfig.base.json  ./
COPY --chown=$APP_USER:$APP_USER packages/common                            ./packages/common
COPY --chown=$APP_USER:$APP_USER packages/core                              ./packages/core
COPY --chown=$APP_USER:$APP_USER packages/core/nginx/default.conf           /etc/nginx/conf.d/default.conf

EXPOSE 5500 5501 5050 5555

CMD /wait \
&& yarn --cwd ./packages/common build \
&& yarn run:server
