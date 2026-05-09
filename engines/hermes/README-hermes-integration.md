# Hermes engine integration for JeSsi-Bench

This patch adds two engine variants:

```text
engines/hermes/
engines/hermes-bytecode/
```

## Variant 1: `hermes`

This runs the Hermes CLI directly on the JavaScript workload:

```bash
hermes /jessi-bench/workload.js
```

This is the normal source-input path. Hermes parses/compiles the JS source and executes it in the same CLI invocation.

## Variant 2: `hermes-bytecode`

This uses a small wrapper named `hermesbc`:

```bash
hermesc -O -emit-binary -out /tmp/workload.hbc /jessi-bench/workload.js
hvm /tmp/workload.hbc
```

So it exercises the Hermes bytecode pipeline: `hermesc` produces `.hbc`, then `hvm` executes it.

Important caveat: with the current JeSsi-Bench engine interface, the bytecode compilation happens inside the engine entrypoint. Therefore, in `--measurement-mode combined`, the measured command includes both bytecode compilation and bytecode execution. To measure *only* bytecode execution, JeSsi-Bench needs a later precompile hook or a benchmark-stage that compiles the temporary workload outside the measured `perf/time` command.

## Setup

After copying these folders into the repository:

```bash
sudo bin/jessi-bench engine setup hermes
sudo bin/jessi-bench engine setup hermes-bytecode
```

Then test:

```bash
sudo bin/jessi-bench benchmark \
  --workload array-sort \
  --engine hermes \
  --workload-mode harnessed \
  --warmup 5 \
  --repetitions 30 \
  --measurement-mode combined \
  --output res-hermes.json

sudo bin/jessi-bench benchmark \
  --workload array-sort \
  --engine hermes-bytecode \
  --workload-mode harnessed \
  --warmup 5 \
  --repetitions 30 \
  --measurement-mode combined \
  --output res-hermes-bytecode.json
```

## Notes

The Dockerfiles build Hermes v0.12.0 from source. The official Hermes build documentation says the main `hermes` binary can execute JavaScript source or bytecode, while `hermesc` compiles JavaScript to Hermes bytecode and `hvm` executes bytecode.
