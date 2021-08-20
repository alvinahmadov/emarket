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

COPY package.json yarn.lock lerna.json \
						package.workspaces.json     ./
COPY packages/merchant-tablet-ionic/package.json    ./packages/merchant-tablet-ionic/package.json
COPY packages/merchant-tablet-ionic/nginx           ./packages/merchant-tablet-ionic/nginx
COPY packages/common                                ./packages/common
COPY packages/common-angular                        ./packages/common-angular

## Install packages
RUN yarn install && yarn cache clean

FROM node:lts-alpine3.14 AS production

RUN npm install cross-env -g

ENV APP_HOME=/home/emarket

RUN mkdir $APP_HOME
RUN mkdir -p $APP_HOME/packages/merchant-tablet-ionic
RUN mkdir -p $APP_HOME/packages/common
RUN mkdir -p $APP_HOME/packages/common-angular

WORKDIR $APP_HOME

## Set environment variables
ARG NODE_OPTIONS="--max-old-space-size=2048"
ENV NODE_OPTIONS $NODE_OPTIONS
ENV NODE_ENV production

## Copy installed yarn packages
COPY --from=development $APP_HOME/node_modules                                  ./node_modules
COPY --from=development $APP_HOME/packages/common/node_modules                  ./packages/common/node_modules
COPY --from=development $APP_HOME/packages/common-angular/node_modules          ./packages/common-angular/node_modules
COPY --from=development $APP_HOME/packages/merchant-tablet-ionic/nginx          ./packages/merchant-tablet-ionic/nginx
COPY --from=development $APP_HOME/packages/merchant-tablet-ionic/node_modules   ./packages/merchant-tablet-ionic/node_modules

COPY package.json yarn.lock lerna.json \
		 package.workspaces.json tsconfig.base.json      ./
COPY packages/common                                    ./packages/common
COPY packages/common-angular                            ./packages/common-angular
COPY packages/merchant-tablet-ionic                     ./packages/merchant-tablet-ionic
COPY packages/merchant-tablet-ionic/nginx/default.conf  /etc/nginx/conf.d/default.conf
