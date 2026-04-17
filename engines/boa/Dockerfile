FROM rust:1.94-alpine3.23 as build
ARG srcPath
WORKDIR /boa

RUN apk --no-cache add gcc openssl-dev openssl-libs-static

COPY $srcPath ./
RUN cargo build --release


FROM alpine:3.23
WORKDIR /boa

RUN apk --no-cache add perf
RUN apk --no-cache -X https://dl-cdn.alpinelinux.org/alpine/v3.23/community add time

COPY --from=build /boa/target/release/boa /bin/

ENTRYPOINT ["boa"]
