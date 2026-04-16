FROM alpine:3.23 as build
ARG srcPath
WORKDIR /duktape

RUN apk --no-cache add gcc musl-dev make

COPY $srcPath ./
RUN make -f Makefile.cmdline


FROM alpine:3.23
WORKDIR /duktape

RUN apk --no-cache add perf
RUN apk --no-cache -X https://dl-cdn.alpinelinux.org/alpine/v3.23/community add time

COPY --from=build /duktape/duk /bin/

ENTRYPOINT ["duk"]
