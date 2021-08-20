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
COPY --chown=$APP_USER:$APP_USER packages/shop-web-angular/package.json ./packages/shop-web-angular/package.json
COPY --chown=$APP_USER:$APP_USER packages/shop-web-angular/nginx ./packages/shop-web-angular/nginx
COPY --chown=$APP_USER:$APP_USER packages/common ./packages/common
COPY --chown=$APP_USER:$APP_USER packages/common-angular ./packages/common-angular

## Install packages
RUN yarn install && yarn cache clean

FROM node:lts-alpine3.14 AS production

RUN npm install cross-env -g

ENV APP_HOME=/srv/emarket

RUN mkdir $APP_HOME && chown $APP_USER:$APP_USER $APP_HOME
RUN mkdir -p $APP_HOME/packages/common && chown $APP_USER:$APP_USER $APP_HOME/packages/common
RUN mkdir -p $APP_HOME/packages/common-angular && chown $APP_USER:$APP_USER $APP_HOME/packages/common-angular
RUN mkdir -p $APP_HOME/packages/shop-web-angular && chown $APP_USER:$APP_USER $APP_HOME/packages/shop-web-angular

USER $APP_USER

WORKDIR $APP_HOME

## Set environment variables
ARG NODE_OPTIONS="--max-old-space-size=2048"
ENV NODE_OPTIONS $NODE_OPTIONS
ENV NODE_ENV production

## Copy installed yarn packages
COPY --from=development --chown=$APP_USER:$APP_USER $APP_HOME/node_modules ./node_modules
COPY --from=development --chown=$APP_USER:$APP_USER $APP_HOME/packages/common/node_modules              ./packages/common/node_modules
COPY --from=development --chown=$APP_USER:$APP_USER $APP_HOME/packages/common-angular/node_modules      ./packages/common-angular/node_modules
COPY --from=development --chown=$APP_USER:$APP_USER $APP_HOME/packages/shop-web-angular/nginx           ./packages/shop-web-angular/nginx
COPY --from=development --chown=$APP_USER:$APP_USER $APP_HOME/packages/shop-web-angular/node_modules    ./packages/shop-web-angular/node_modules

COPY --chown=$APP_USER:$APP_USER package.json yarn.lock lerna.json \
	package.workspaces.json tsconfig.base.json ./
COPY --chown=$APP_USER:$APP_USER packages/common                                ./packages/common
COPY --chown=$APP_USER:$APP_USER packages/common-angular                        ./packages/common-angular
COPY --chown=$APP_USER:$APP_USER packages/shop-web-angular                      ./packages/shop-web-angular
COPY --chown=$APP_USER:$APP_USER packages/shop-web-angular/nginx/default.conf   /etc/nginx/conf.d/default.conf
