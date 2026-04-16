FROM alpine:3.23 as build
ARG srcPath
WORKDIR /mujs

RUN apk --no-cache add gcc musl-dev readline-dev make

COPY $srcPath ./
RUN make prefix=/usr/local install


FROM alpine:3.23
WORKDIR /mujs

RUN apk --no-cache add perf
RUN apk --no-cache -X https://dl-cdn.alpinelinux.org/alpine/v3.23/community add time

COPY --from=build /usr/local/bin/mujs /bin/

ENTRYPOINT ["mujs"]
