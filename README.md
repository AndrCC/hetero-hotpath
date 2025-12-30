# hetero-hotpath

Benchmark e profiling em Node.js para demonstrar como workloads heterogêneos
podem causar degradação significativa de performance em comparação a workloads homogêneos.

## Objetivo
Demonstrar, com benchmark e profiling do V8, como decisões de alocação
e variação de object shape afetam throughput e latência.

## Experimento
O projeto compara quatro cenários:
- HOMO + V1 (implementação ingênua)
- HOMO + V2 (implementação otimizada)
- HETERO + V1 (ingênua sob carga heterogênea)
- HETERO + V2 (otimizada sob carga heterogênea)

## Resultados
_(a preencher após implementação do benchmark)_

## Profiling
_(a preencher após execução do V8 profiler)_

## Como rodar
```bash
npm install
npm run bench
npm run prof && npm run prof:process
