FROM ubuntu:24.04 as build
ARG srcPath
WORKDIR /quickjs

RUN apt-get update && apt-get install -qq -y build-essential

COPY $srcPath ./
RUN make


FROM ubuntu:24.04
WORKDIR /quickjs

RUN apt-get update && apt-get install -qq -y linux-tools-generic time
RUN ln -sf /usr/lib/linux-tools/*-generic/perf /usr/bin/perf

COPY --from=build /quickjs/qjs /bin/

ENTRYPOINT ["qjs"]
