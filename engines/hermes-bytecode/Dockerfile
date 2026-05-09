FROM ubuntu:22.04 as build

ARG srcPath
WORKDIR /workspace

RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -qq -y \
        build-essential \
        ca-certificates \
        cmake \
        git \
        ninja-build \
        libicu-dev \
        python3 \
        zip \
        libreadline-dev \
    && rm -rf /var/lib/apt/lists/*

COPY $srcPath ./hermes

# Build the Hermes command-line tools in Release mode.
# hermesc compiles JS source to Hermes bytecode; hvm executes Hermes bytecode.
RUN cmake -S hermes -B build -G Ninja -DCMAKE_BUILD_TYPE=Release \
    && cmake --build build -j$(nproc)

FROM ubuntu:22.04

WORKDIR /hermes

RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -qq -y \
        libicu-dev \
        libreadline8 \
        linux-tools-generic \
        time \
    && ln -sf /usr/lib/linux-tools/*-generic/perf /usr/bin/perf \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /workspace/build/bin/hermes /usr/local/bin/hermes
COPY --from=build /workspace/build/bin/hermesc /usr/local/bin/hermesc
COPY --from=build /workspace/build/bin/hvm /usr/local/bin/hvm
COPY --from=build /workspace/build/bin/hbcdump /usr/local/bin/hbcdump

# JeSsi-Bench currently executes one mounted JS file as the engine argument.
# This wrapper compiles that JS source to Hermes bytecode and then executes it.
# Note: until JeSsi-Bench supports precompile hooks, compilation is part of the
# measured command for this engine variant.
RUN cat > /usr/local/bin/hermesbc <<'EOF2'
#!/usr/bin/env sh
set -eu
if [ "$#" -lt 1 ]; then
  echo "Usage: hermesbc <workload.js> [args...]" >&2
  exit 2
fi
src="$1"
shift || true
out="/tmp/jessi-bench-workload-$$.hbc"
hermesc -O -emit-binary -out "$out" "$src"
exec hvm "$out" "$@"
EOF2
RUN chmod +x /usr/local/bin/hermesbc

ENTRYPOINT ["hermesbc"]
