# Rhino integration for JeSsi-Bench

This archive adds a `rhino` engine definition for JeSsi-Bench.

## Files

```text
engines/rhino/manifest.json
engines/rhino/Dockerfile
engines/rhino/template.js
```

## What it runs

The Docker image downloads the `org.mozilla:rhino-all:1.9.1` JAR from Maven Central and exposes a small `/bin/rhino` wrapper around:

```bash
java -cp /rhino/rhino-all.jar org.mozilla.javascript.tools.shell.Main "$@"
```

The `rhino-all` artifact is used because recent Rhino versions split runtime, tools, and XML support across modules; `rhino-all` is the easiest all-in-one JAR for a shell-style command-line engine.

## Setup

From the repository root, copy the files into place, then run:

```bash
sudo bin/jessi-bench engine setup rhino
```

## Test in script mode

```bash
sudo bin/jessi-bench benchmark \
  --workload array-sort \
  --engine rhino \
  --workload-mode script \
  --warmup 5 \
  --repetitions 30 \
  --measurement-mode combined \
  --output res-rhino-script.json
```

## Test in harnessed mode

```bash
sudo bin/jessi-bench benchmark \
  --workload array-sort \
  --engine rhino \
  --workload-mode harnessed \
  --warmup 5 \
  --repetitions 30 \
  --measurement-mode combined \
  --output res-rhino-harnessed.json
```

## Notes

* `template.js` adds a minimal `console.log` shim using Rhino shell's `print()` function.
* The manifest includes a dummy `sha` field so JeSsi-Bench does not need to download Rhino source before building the image. The Dockerfile downloads the Maven artifact directly.
* If you want to pin a different Rhino version, update both `manifest.json` and the `RHINO_VERSION` build argument in the Dockerfile.
