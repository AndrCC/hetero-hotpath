// src/generator.js
// Gera payloads como strings no formato: "id=1,type=A,amount=100,tag=core,noise=abc..."
// Objetivo: ter um workload homogêneo (shape/tamanho estável) e outro heterogêneo (shape/tamanho variando).

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function padNoise(len) {
  // ruído determinístico (barato) para controlar tamanho do payload
  let s = "";
  for (let i = 0; i < len; i++) s += String.fromCharCode(97 + (i % 26));
  return s;
}

export function makeHomogeneous(n) {
  const out = new Array(n);
  for (let i = 0; i < n; i++) {
    out[i] = `id=${i},type=A,amount=100,tag=core,noise=${padNoise(40)}`;
  }
  return out;
}

export function makeHeterogeneous(n, seed = 42) {
  // Vamos “semi-determinístico”: o seed é usado só para variar de forma reproduzível depois
  // (por enquanto, usamos Math.random; depois podemos trocar por PRNG seeded se quiser).
  const out = new Array(n);

  for (let i = 0; i < n; i++) {
    const t = (i % 3 === 0) ? "A" : (i % 3 === 1 ? "B" : "C");
    const amount = randomInt(1, 5000);

    // varia muito o tamanho do payload
    const noiseLen = randomInt(0, 600);

    // campos opcionais (mudam o "shape" percebido quando parsearmos em objeto)
    const maybeExtra = (i % 4 === 0) ? `,extra=${padNoise(randomInt(10, 80))}` : "";
    const maybeFlag = (i % 5 === 0) ? `,flag=true` : "";

    out[i] = `id=${i},type=${t},amount=${amount},tag=${t}${maybeExtra}${maybeFlag},noise=${padNoise(noiseLen)}`;
  }
  return out;
}
