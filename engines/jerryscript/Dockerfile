FROM python:3.11-alpine3.20 as build
ARG srcPath
WORKDIR /jerry

RUN apk --no-cache add gcc musl-dev make cmake
RUN ln -s /usr/bin/gcc /usr/bin/aarch64-linux-gnu-gcc

COPY $srcPath ./
RUN python tools/build.py


FROM alpine:3.23
WORKDIR /jerry

RUN apk --no-cache add perf
RUN apk --no-cache -X https://dl-cdn.alpinelinux.org/alpine/v3.23/community add time

COPY --from=build /jerry/build/bin/jerry /bin/

ENTRYPOINT ["jerry"]
