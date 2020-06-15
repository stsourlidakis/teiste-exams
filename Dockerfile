FROM node:6

WORKDIR /app

COPY package.json /tmp/package.json
RUN cd /tmp && \
  npm install && \
  mv /tmp/node_modules /app/node_modules && \
  rm /tmp/package.json

COPY . /app
