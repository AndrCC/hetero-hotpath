// src/runner.js
import { performance } from "node:perf_hooks";
import { makeHomogeneous, makeHeterogeneous } from "./generator.js";
import { processV1 } from "./processor.v1.js";
import { processV2 } from "./processor.v2.js";

// Ajuste aqui se sua máquina for muito lenta/rápida
const N = 20_000;
const WARMUP = 10_000;

function percentile(sorted, p) {
  const idx = Math.floor(p * (sorted.length - 1));
  return sorted[idx];
}

function benchCase(name, data, fn) {
  // warmup (JIT)
  let acc = 0;
  for (let i = 0; i < WARMUP; i++) acc ^= fn(data[i % data.length]);

  // medição
  const times = new Array(data.length);

  const t0 = performance.now();
  for (let i = 0; i < data.length; i++) {
    const s = performance.now();
    acc ^= fn(data[i]);
    const e = performance.now();
    times[i] = e - s; // latência por item (ms)
  }
  const t1 = performance.now();

  times.sort((a, b) => a - b);

  const totalMs = t1 - t0;
  const ops = Math.floor(data.length / (totalMs / 1000));

  const p50 = percentile(times, 0.50);
  const p95 = percentile(times, 0.95);
  const p99 = percentile(times, 0.99);

  console.log(`\n${name}`);
  console.log(`  total(ms): ${totalMs.toFixed(2)}`);
  console.log(`  ops/s:     ${ops}`);
  console.log(`  p50(ms):   ${p50.toFixed(4)}`);
  console.log(`  p95(ms):   ${p95.toFixed(4)}`);
  console.log(`  p99(ms):   ${p99.toFixed(4)}`);
  console.log(`  acc:       ${acc}`);
}

function main() {
  const homo = makeHomogeneous(N);
  const hetero = makeHeterogeneous(N);

  benchCase("HOMO - V1", homo, processV1);
  benchCase("HOMO - V2", homo, processV2);
  benchCase("HETERO - V1", hetero, processV1);
  benchCase("HETERO - V2", hetero, processV2);
}

main();
