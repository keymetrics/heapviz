FROM node:9

RUN mkdir -p /app
WORKDIR /app

COPY package.json package.json
COPY yarn.lock yarn.lock

RUN yarn

COPY . /app/
RUN yarn build


FROM kyma/docker-nginx
# move builded files
COPY --from=0 /app/build/ /var/www

CMD 'nginx'