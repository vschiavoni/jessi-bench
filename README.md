# JeSsi-Bench

JeSsi-Bench is a tool that can run different workloads on different IoT-friendly JavaScript engines. Each engine is automatically built from source and gets executed inside a Docker container. This tool can be used to generate benchmarks and compare the performances of different engines.

## Usage

### Prerequisite

To run JeSsi-Bench, all you need is **Docker** to be installed on the target machine. Make sure the `perf_event_paranoid` system variable is set to 2 or lower, as some Linux distributions seem to set it higher by default. This is required for JeSsi-Bench to be able to measure performance statistics.

```bash
sudo sysctl -w kernel.perf_event_paranoid=2
```

### Command line

Clone or download this repository, then run `bin/jessi-bench` from the root of the project. To get a list of available commands and options, run:

```bash
bin/jessi-bench help
```

When requested as an argument or option, a **workload** must match a script in the `workloads` directory without the `.js` extension, and an **engine** must match one of the folders in the `engines` directory.

#### Benchmark

```bash
bin/jessi-bench benchmark [options]
bin/jessi-bench bm [options]
```

This command runs workloads with engines and generates a benchmark JSON file. When encountering a new engine, JeSsi-Bench automatically downloads its source code and builds a Docker image.

The following options are available:

- `-w`, `--workload <workload...>`: workload(s) to run, default: all.
- `-e`, `--engine <engine...>`: engine(s) to use, default: all.
- `-o`, `--output <file>`: output file that will store the results.
- `-p`, `--plot`: display plots immediately after the benchmark is generated.
- `-r`, `--repetitions <number>`: number of measured repetitions, default: 30.
- `--warmup <number>`: number of separate pre-measurement executions, default: 5.
- `--confidence <number>`: confidence level used for statistical summaries, default: 0.95.
- `--measurement-mode <combined|split>`: select how runtime/performance counters and memory usage are measured, default: `combined`.
- `--no-metadata`: disable collection of machine/environment metadata.

The `--workload` and `--engine` options also support negative filtering. For example:

```bash
bin/jessi-bench benchmark --engine '!jerryscript'
```

selects every engine except JerryScript.

##### Measurement modes

JeSsi-Bench supports two measurement modes:

- `combined`: runtime, performance counters, and maximum resident set size are collected from the same process execution using `/usr/bin/time -v perf stat ...`. This is the default and recommended mode for publishable results.
- `split`: runtime/performance counters and memory usage are collected from two separate executions. This can be useful if `time` and `perf` interact badly for a given platform or engine, but each sample combines metrics from different process executions.

Warm-up runs are currently separate pre-measurement executions. They help reduce cold-start effects such as Docker/image/filesystem effects, but they do **not** preserve process-local JIT/runtime state for measured repetitions.

Example:

```bash
bin/jessi-bench benchmark \
  --workload array-sort \
  --engine quickjs \
  --warmup 5 \
  --repetitions 30 \
  --measurement-mode combined \
  --output res.json
```

To reproduce the older split-execution behaviour:

```bash
bin/jessi-bench benchmark \
  --workload array-sort \
  --engine quickjs \
  --warmup 5 \
  --repetitions 30 \
  --measurement-mode split \
  --output res.json
```

#### Engine

To list all available JavaScript engines, run:

```bash
bin/jessi-bench engine list
```

To download and build a specific engine, run:

```bash
bin/jessi-bench engine setup <engine>
```

#### Workload

To list all available workloads, run:

```bash
bin/jessi-bench workload list
```

#### Plots

To draw plots for an already generated benchmark, run:

```bash
bin/jessi-bench plot <benchmark>
```

where `<benchmark>` is a path to the target JSON file.

### Current limitations

Running `bin/jessi-bench` starts JeSsi-Bench inside a Docker container, which may cause errors on ARM machines.

If you get errors during the setup about `lzma-native`, try installing Node.js manually, then install dependencies, build the source code, and run JeSsi-Bench by calling `node` directly:

```bash
npm install
npm run build
node build/main <command>
```

Drawing plots is not supported inside Docker containers, so follow the same process if needed.

## Contributing

### Adding an engine

To add a new engine to the project, create a new folder in the `engines` directory. This folder must contain a manifest file, a Dockerfile, and optionally a workload template.

### Adding a workload

To add a new workload, create a JavaScript file in the `workloads` directory. Workloads should be self-contained and should follow older ECMAScript standards so that most engines can run them.

## Troubleshooting

If JeSsi-Bench fails to work as expected, run it with the `--verbose` option.
