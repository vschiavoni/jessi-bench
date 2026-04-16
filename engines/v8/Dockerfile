FROM node:20.3.0-alpine
WORKDIR /v8

RUN apk --no-cache add perf
RUN apk --no-cache -X https://dl-cdn.alpinelinux.org/alpine/v3.23/community add time

ENTRYPOINT ["node"]
