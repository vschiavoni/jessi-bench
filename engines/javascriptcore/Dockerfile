FROM oven/bun:1.3.13-debian
WORKDIR /javascriptcore

RUN apt-get update && apt-get install -qq -y linux-perf time

ENTRYPOINT ["bun"]
