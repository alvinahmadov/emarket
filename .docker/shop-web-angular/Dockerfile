FROM node:lts-alpine3.14 AS development

RUN apk update \
    && apk add libexecinfo libexecinfo-dev \
	&& npm i -g npm \
	&& apk --no-cache add --virtual builds-deps build-base \
	snappy g++ snappy-dev gcc libgcc libstdc++ linux-headers autoconf automake make nasm python2 git nginx \
	&& npm install --quiet node-gyp -g \
	&& npm config set python /usr/bin/python \
	&& npm install yarn -g --force

ENV APP_HOME=/home/emarket

RUN mkdir $APP_HOME

WORKDIR $APP_HOME

COPY package.json yarn.lock lerna.json package.workspaces.json ./
COPY packages/shop-web-angular/package.json ./packages/shop-web-angular/package.json
COPY packages/shop-web-angular/.nginx ./packages/shop-web-angular/.nginx
COPY .snyk ./.snyk
COPY packages/common ./packages/common
COPY packages/common-angular ./packages/common-angular

RUN yarn install && yarn cache clean

FROM node:lts-alpine3.14 AS production

RUN npm install cross-env -g

ENV APP_HOME=/home/emarket

RUN mkdir $APP_HOME
RUN mkdir -p $APP_HOME/packages/shop-web-angular
RUN mkdir -p $APP_HOME/packages/common
RUN mkdir -p $APP_HOME/packages/common-angular

WORKDIR $APP_HOME

ARG NODE_OPTIONS="--max-old-space-size=2048"
ENV NODE_OPTIONS $NODE_OPTIONS
ENV NODE_ENV production
 
RUN rm -rf /usr/share/nginx/html

COPY --from=development $APP_HOME/packages/shop-web-angular/.nginx ./packages/shop-web-angular/.nginx
COPY --from=development $APP_HOME/node_modules ./node_modules
COPY --from=development $APP_HOME/packages/common/node_modules ./packages/common/node_modules
COPY --from=development $APP_HOME/packages/common-angular/node_modules ./packages/common-angular/node_modules
COPY --from=development $APP_HOME/packages/shop-web-angular/node_modules ./packages/shop-web-angular/node_modules
COPY --from=development $APP_HOME/packages/shop-web-angular/www /usr/share/nginx/html

COPY package.json yarn.lock lerna.json package.workspaces.json tsconfig.base.json ./
COPY packages/common ./packages/common
COPY packages/common-angular ./packages/common-angular
COPY packages/shop-web-angular ./packages/shop-web-angular
COPY packages/shop-web-angular/.nginx/default.conf /etc/nginx/conf.d/default.conf
RUN nginx -s reload
