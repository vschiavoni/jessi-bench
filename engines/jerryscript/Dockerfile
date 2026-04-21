FROM python:3.14-slim-trixie as build
ARG srcPath
WORKDIR /jerry

RUN apt-get update && apt-get install -qq -y build-essential cmake
RUN test -f /usr/bin/aarch64-linux-gnu-gcc || ln -s /usr/bin/gcc /usr/bin/aarch64-linux-gnu-gcc

COPY $srcPath ./
RUN python tools/build.py


FROM ubuntu:24.04
WORKDIR /jerry

RUN apt-get update && apt-get install -qq -y linux-tools-generic time
RUN ln -sf /usr/lib/linux-tools/*-generic/perf /usr/bin/perf

COPY --from=build /jerry/build/bin/jerry /bin/

ENTRYPOINT ["jerry"]
