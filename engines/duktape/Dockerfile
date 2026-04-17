FROM ubuntu:24.04 as build
ARG srcPath
WORKDIR /duktape

RUN apt-get update && apt-get install -qq -y build-essential

COPY $srcPath ./
RUN make -f Makefile.cmdline


FROM ubuntu:24.04
WORKDIR /duktape

RUN apt-get update && apt-get install -qq -y linux-tools-generic time
RUN ln -sf /usr/lib/linux-tools/*-generic/perf /usr/bin/perf

COPY --from=build /duktape/duk /bin/

ENTRYPOINT ["duk"]
