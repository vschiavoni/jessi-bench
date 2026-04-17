FROM node:25.9.0-trixie-slim
WORKDIR /v8

RUN apt-get update && apt-get install -qq -y linux-perf time

ENTRYPOINT ["node"]
