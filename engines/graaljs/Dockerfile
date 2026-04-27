FROM ubuntu:24.04 as build
ARG srcPath
ARG VERSION=25.0.2
WORKDIR /graaljs

RUN apt-get update && apt-get install -qq -y curl && \
    curl -sSLo graaljs.tar.gz https://github.com/oracle/graaljs/releases/download/graal-$VERSION/graaljs-$VERSION-linux-$(bash -c 'case $(uname -m) in x86_64) echo amd64;; aarch64) echo aarch64;; esac').tar.gz && \
    mkdir -p /opt/graaljs && \
    tar xzf graaljs.tar.gz -C /opt/graaljs --strip-components=1 

FROM ubuntu:24.04
WORKDIR /graaljs

RUN apt-get update && apt-get install -qq -y linux-tools-generic time
RUN ln -sf /usr/lib/linux-tools/*-generic/perf /usr/bin/perf

COPY --from=build /opt/graaljs /opt/graaljs

ENV PATH="$PATH:/opt/graaljs/bin"

ENTRYPOINT ["js"]
