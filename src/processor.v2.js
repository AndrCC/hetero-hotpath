// src/processor.v2.js
// Versão otimizada: menos alocação, parsing por scan e shape fixo.

function parseKVScan(payload) {
  // Shape fixo: sempre as mesmas chaves
  const obj = {
    id: 0,
    type: "",
    amount: 0,
    tag: "",
    extra: undefined,
    flag: false,
    noise: ""
  };

  let i = 0;
  const len = payload.length;

  while (i < len) {
    // ler chave até '='
    const kStart = i;
    while (i < len && payload.charCodeAt(i) !== 61) i++; // '='
    const key = payload.slice(kStart, i);
    i++; // pula '='

    // ler valor até ',' ou fim
    const vStart = i;
    while (i < len && payload.charCodeAt(i) !== 44) i++; // ','
    const val = payload.slice(vStart, i);
    i++; // pula ',' (mesmo no fim, ok)

    switch (key) {
      case "id":
        obj.id = val | 0;
        break;
      case "type":
        obj.type = val;
        break;
      case "amount":
        // TODO (SEU): converter val para inteiro rápido, do mesmo jeito que id
        obj.amount = val | 0;
        break;
      case "tag":
        obj.tag = val;
        break;
      case "extra":
        obj.extra = val;
        break;
      case "flag":
        obj.flag = (val === "true");
        break;
      case "noise":
        obj.noise = val;
        break;
      default:
        break;
    }
  }

  return obj;
}

export function processV2(payload) {
  const obj = parseKVScan(payload);

  // checksum simples sem criar arrays e sem concatenar string gigante
  let h = 0;
  h = (h * 131 + obj.id) | 0;
  h = (h * 131 + obj.amount) | 0;

  const s1 = obj.type;
  const s2 = obj.tag;
  const s3 = obj.noise;

  for (let i = 0; i < s1.length; i++) h = (h * 131 + s1.charCodeAt(i)) | 0;
  for (let i = 0; i < s2.length; i++) h = (h * 131 + s2.charCodeAt(i)) | 0;

  // limita custo do noise para reduzir variância extrema
  const cap = Math.min(120, s3.length);
  for (let i = 0; i < cap; i++) h = (h * 131 + s3.charCodeAt(i)) | 0;

  return h;
}
