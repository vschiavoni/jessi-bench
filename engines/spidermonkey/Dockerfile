FROM ubuntu:24.04
ARG srcPath
WORKDIR /spidermonkey

COPY $srcPath ./
RUN apt update && apt install -qq -y build-essential llvm rustup pkg-config zlib1g-dev python3 linux-tools-generic time && \
    rustup default stable && \
    cargo install cbindgen && \
    export PATH=$PATH:/root/.cargo/bin && \
    mkdir -p js/src/_build && \
    cd js/src/_build && \
    ../configure --enable-optimize && \
    make && \
    make install
RUN ln -sf /usr/lib/linux-tools/*-generic/perf /usr/bin/perf

ENTRYPOINT ["js150"]
