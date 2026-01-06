// src/processor.v1.js
// Versão "ingênua": fácil de escrever, mas cara em alocação e conversões.
// Intenção: ficar relativamente ok no homogêneo e piorar bem mais no heterogêneo.

export function processV1(payload) {
  // 1) Split por vírgula: cria um array de partes (alocação)
  const parts = payload.split(",");

  // 2) Objeto "dinâmico": chaves variam conforme o payload (shape muda)
  const obj = {};

  for (let i = 0; i < parts.length; i++) {
    // Split por '=': cria mais arrays/strings temporárias
    const kv = parts[i].split("=");
    const key = kv[0];
    const val = kv[1] ?? "";

    // Tipagem “ad hoc” (ainda mais trabalho)
    if (key === "id" || key === "amount") obj[key] = Number(val);
    else if (key === "flag") obj[key] = (val === "true");
    else obj[key] = val;
  }

  // 3) Object.values cria array novo
  const values = Object.values(obj);

  // 4) Concatenação: gera muitas strings intermediárias
  let s = "";
  for (let i = 0; i < values.length; i++) {
    s += String(values[i]);
  }

  // 5) Checksum simples (para "usar" o resultado e evitar otimização)
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 131 + s.charCodeAt(i)) | 0;
  }
  return h;
}
