# hetero-hotpath (Node.js)

Benchmark + profiling: como um hot path “ok” colapsa em workload heterogêneo — e como corrigir.

---

## Problema

Em produção, serviços de ingestão/processamento raramente recebem dados “bonitinhos”.
Quando o workload fica **heterogêneo** (mensagens variando muito em tamanho e campos opcionais), um código que parecia rápido pode sofrer:

* queda grande de throughput (ops/s)
* piora forte de cauda (p95/p99)
* mais alocação → mais GC

Este projeto demonstra isso em Node.js comparando duas estratégias de parsing/processamento.

---

## Hipótese

1. Uma implementação “ingênua” baseada em `split()` + objeto dinâmico gera muitas alocações e perde otimizações do runtime.
2. Uma implementação com parsing por scan + shape fixo reduz alocação e fica mais estável sob heterogeneidade.

---

## Experimento (matriz 2×2)

### Workloads

* **HOMO**: mensagens com tamanho e formato estáveis
* **HETERO**: mensagens com tamanho muito variável e campos opcionais

### Implementações

* **V1**: `split(",")`, `split("=")`, objeto com chaves variáveis, `Object.values`, concatenação
* **V2**: parsing por scan (loop), shape fixo, checksum direto (sem arrays ou concatenação grande)

### Cenários

* HOMO – V1
* HOMO – V2
* HETERO – V1
* HETERO – V2

---

## Resultados (exemplo real)

Output do comando `npm run bench`:

HOMO - V1
total(ms): 83.25
ops/s: 240238
p50(ms): 0.0035
p95(ms): 0.0059
p99(ms): 0.0078

HOMO - V2
total(ms): 38.19
ops/s: 523682
p50(ms): 0.0009
p95(ms): 0.0018
p99(ms): 0.0026

HETERO - V1
total(ms): 251.32
ops/s: 79580
p50(ms): 0.0078
p95(ms): 0.0217
p99(ms): 0.0318

HETERO - V2
total(ms): 50.71
ops/s: 394385
p50(ms): 0.0024
p95(ms): 0.0043
p99(ms): 0.0053

### Leituras rápidas

* **Heterogeneidade quebra a V1**
  Throughput caiu ~3× (240k → 79k) e p99 ficou ~4× pior.

* **V2 recupera estabilidade**
  Em HETERO, V2 entrega ~5× mais ops/s e reduz p99 em ~6×.

---

## Profiling (evidência do hot path)

Profiling gerado com:

node --prof src/runner.js
node --prof-process isolate-*-v8.log > prof.txt

Trecho do `Bottom up (heavy) profile`:

Builtin: StringPrototypeSplit
JS: *processV1 src/processor.v1.js

**Interpretação**

O hot path da V1 é dominado por `String.prototype.split`, consistente com:

* parsing baseado em arrays temporários
* alta alocação de strings
* maior pressão de GC
* piora acentuada em workload heterogêneo

---

## Conclusões

* **Dados importam tanto quanto código**: inputs heterogêneos revelam gargalos ocultos.
* **Alocação e shape importam**: reduzir arrays/strings temporárias e manter shape fixo melhora p95/p99.
* **Benchmark representativo é essencial** para pipelines de ingestão.

---

## Como rodar

### Requisitos

* Node.js 18+ (testado também em Node.js 22)

### Instalar dependências

npm install

### Rodar benchmark

npm run bench

### Rodar profiling

node --prof src/runner.js
node --prof-process isolate-*-v8.log > prof.txt

Abra `prof.txt` e procure a seção **Bottom up (heavy) profile**.

---

## Estrutura do projeto

* src/generator.js — gera workloads homogêneo e heterogêneo
* src/processor.v1.js — baseline ingênuo (split + objeto dinâmico)
* src/processor.v2.js — versão otimizada (scan + shape fixo)
* src/runner.js — executa os 4 cenários e mede ops/s e p50/p95/p99

---

## TODO (boas práticas / melhorias)

* [ ] Permitir perfilar **um cenário por vez** (ex.: apenas HETERO–V1 vs HETERO–V2)
* [ ] Adicionar GitHub Actions (`npm ci` + `npm run bench`)
* [ ] Salvar resultados de referência em `docs/results.md`

---

