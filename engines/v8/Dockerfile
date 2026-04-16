FROM node:25.9.0-alpine3.23
WORKDIR /v8

RUN apk --no-cache add perf
RUN apk --no-cache -X https://dl-cdn.alpinelinux.org/alpine/v3.23/community add time

ENTRYPOINT ["node"]
