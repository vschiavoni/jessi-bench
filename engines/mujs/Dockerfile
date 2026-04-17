FROM ubuntu:24.04 as build
ARG srcPath
WORKDIR /mujs

RUN apt-get update && apt-get install -qq -y build-essential libreadline-dev

COPY $srcPath ./
RUN make prefix=/usr/local install


FROM ubuntu:24.04
WORKDIR /mujs

RUN apt-get update && apt-get install -qq -y linux-tools-generic time libreadline8
RUN ln -sf /usr/lib/linux-tools/*-generic/perf /usr/bin/perf

COPY --from=build /usr/local/bin/mujs /bin/

ENTRYPOINT ["mujs"]
