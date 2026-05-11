###1. Experiment manifests

Add a persistent experiment file, for example:

name: iot-security-arm
engines:
  tags: [iot]
workloads:
  tags: [security]
benchmark:
  workloadMode: harnessed
  measurementMode: combined
  warmup: 10
  repetitions: 50
  confidence: 0.95
  
bin/jessi-bench benchmark --experiment experiments/iot-security.yml

Make results reproducible and easier to cite. 
Instead of describing long CLI commands in the paper, we show the experiment manifest.  

###2. Result comparison command
bin/jessi-bench compare old.json new.json

Could report:
    engine/workload pairs added or missing
    median speedup/slowdown
    confidence interval overlap
    regressions above threshold

Useful when comparing hardware platforms, branches, engine versions, or workload revisions.

###3. Run provenance bundle
Command that packages everything needed to reproduce a benchmark:

bin/jessi-bench bundle results.json

    result JSON
    jessi-bench git commit
    engine manifests
    Dockerfile hashes
    workload hashes
    tag config
    experiment manifest
    machine metadata
    gnuplot/CSV exports

Metadata already collects useful fields such as platform, architecture, CPU, Docker image, package version, uname, and perf_event_paranoid; could be improved to a formal provenance bundle would strengthen reproducibility.


###4. Workload validation / compatibility checker

Add the following command:
    bin/jessi-bench workload check
    bin/jessi-bench workload check --engine quickjs

Verify the following:
    syntax compatibility
    presence of benchmark() for harnessed mode
    no unsupported globals
    whether console.log is available or shimmed
    whether JSON/Date/Map/Set/etc. are used

###5. Engine capability metadata
Add capabilities to engine manifests or a central file:
    {
      "quickjs": {
        "features": ["es2020", "interpreter", "console-template"],
        "unsupported": ["promise", "async-await"]
      }
    }
    
Then, workloads could declare requirements:    
    {
      "map-set": ["Map", "Set"],
      "promise-chain": ["Promise"],
      "async-await": ["async"]
    }
    
###6. Precompile/setup hooks

This would be especially useful for Hermes bytecode, V8 snapshots, QuickJS bytecode, or other engines with compilation stages.  Conceptually:

    prepare workload     -> compile source to bytecode
    measure execution    -> run bytecode only
    cleanup
    
Currently, Docker/engine model executes an engine entrypoint over a mounted workload file; adding pre-run hooks allows us to separate “compile time” from “execution time,” which is important for bytecode-oriented engines. 

###7. measurement backend
Pluggable metric collector:   
    perf/time collector
    RAPL collector
    external power meter collector
    tegrastats / vcgencmd collector

The benchmark layer already centralizes metric collection around each run, so energy could become another metric family alongside runtime, memory, and hardware counters. 
The current implementation already parses perf and GNU time, so a clean next step would be a generic “measurement backend” interface rather than hardcoding only those tools

###8. Result normalization modes
Add built-in normalization:
    --normalize fastest
    --normalize engine:v8
    --normalize hardware:rpi4

This would directly support plots like:
    slowdown relative to fastest engine
    slowdown relative to V8
    speedup over Duktape
    
###9 Failed-Run Taxonomy
Support to classify failures:
    build-failure
    syntax-error
    missing-global
    timeout
    out-of-memory
    runtime-exception
    metric-parse-failure
    unsupported-feature
    
###10. Timeout and resource limits
Add options such as:
    --timeout 120s
    --memory-limit 512m
    --cpu-set 0   

Could be used to limit the resources associated to a container.

###11. Engine version matrix
Allow multiple versions of the same engine:
    quickjs@2024-01
    quickjs@2025-09
    jerryscript@3.0.0
    jerryscript@main
    
###12. Workload scale factors
Some workloads may be too short on fast machines and too long on slow devices.
What can we do here?    