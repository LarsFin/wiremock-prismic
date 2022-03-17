FROM node:16-alpine

RUN apk update && \
    apk add dumb-init

COPY package.json package-lock.json ./
RUN npm install

COPY app/ app/

ENTRYPOINT ["dumb-init", "npm"]
CMD ["start"]
