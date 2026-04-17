FROM rust:1.94-slim-trixie as build
ARG srcPath
WORKDIR /boa

RUN apt-get update && apt-get install -qq -y build-essential pkg-config libssl-dev

COPY $srcPath ./
RUN cargo build --release


FROM ubuntu:24.04
WORKDIR /boa

RUN apt-get update && apt-get install -qq -y linux-tools-generic time
RUN ln -sf /usr/lib/linux-tools/*-generic/perf /usr/bin/perf

COPY --from=build /boa/target/release/boa /bin/

ENTRYPOINT ["boa"]
