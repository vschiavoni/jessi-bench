FROM eclipse-temurin:21-jre-jammy

ARG RHINO_VERSION=1.9.1

WORKDIR /rhino

RUN apt-get update \
    && apt-get install -qq -y --no-install-recommends \
        ca-certificates \
        curl \
        linux-tools-generic \
        time \
    && ln -sf /usr/lib/linux-tools/*-generic/perf /usr/bin/perf \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL \
      "https://repo1.maven.org/maven2/org/mozilla/rhino-all/${RHINO_VERSION}/rhino-all-${RHINO_VERSION}.jar" \
      -o /rhino/rhino-all.jar

RUN printf '%s\n' \
    '#!/bin/sh' \
    'exec java ${RHINO_JAVA_OPTS:-} -cp /rhino/rhino-all.jar org.mozilla.javascript.tools.shell.Main "$@"' \
    > /bin/rhino \
    && chmod +x /bin/rhino

ENTRYPOINT ["rhino"]
