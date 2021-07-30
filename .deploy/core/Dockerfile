FROM node:lts-alpine3.14 AS development

RUN apk update \
	&& apk add libexecinfo libexecinfo-dev \
	&& npm i -g npm \
	&& apk --no-cache add --virtual builds-deps build-base \
	snappy g++ snappy-dev gcc libgcc libstdc++ linux-headers autoconf automake make nasm python2 git \
	&& npm install --quiet node-gyp -g \
	&& npm config set python /usr/bin/python \
	&& npm install yarn -g --force

ENV APP_HOME=/home/emarket

RUN mkdir $APP_HOME

WORKDIR $APP_HOME

COPY package.json yarn.lock lerna.json package.workspaces.json ./
COPY packages/core/package.json ./packages/core/package.json
COPY .snyk ./.snyk
COPY packages/core/.snyk ./packages/core/.snyk
COPY packages/common ./packages/common

RUN yarn install && yarn cache clean

FROM node:lts-alpine3.14 AS production

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.6.0/wait /wait

RUN npm install cross-env -g && npm install pm2 -g --unsafe-perm && chmod +x /wait

RUN mkdir $APP_HOME
RUN mkdir -p $APP_HOME/packages/core
RUN mkdir -p $APP_HOME/packages/common

WORKDIR $APP_HOME

ARG NODE_OPTIONS="--max-old-space-size=2048"
ENV NODE_OPTIONS $NODE_OPTIONS
ENV NODE_ENV production

COPY --from=development $APP_HOME/node_modules ./node_modules
COPY --from=development $APP_HOME/packages/core/node_modules ./packages/core/node_modules
COPY package.json yarn.lock lerna.json package.workspaces.json tsconfig.base.json ./
COPY packages/common ./packages/common
COPY packages/core ./packages/core

EXPOSE 5500 5501 5050 5555

CMD /wait \
	&& yarn --cwd ./packages/common build && yarn run:server
