// Soluções de referência, usadas SÓ pelos testes automáticos (Vitest e Playwright)
// para garantir que todo desafio é resolvível. Não é importado pelo jogo.
import type { Language } from '../../../runner/types';

export const SOLUTIONS: Record<string, Record<Language, string>> = {
  'aldric-l1': {
    python: 'def armadura(base, bonus):\n    total = base + bonus\n    return total\n',
    javascript: 'function armadura(base, bonus) {\n  let total = base + bonus;\n  return total;\n}\n',
  },
  'aldric-l2': {
    python: 'def cracha(nome, nivel):\n    return nome + " (nível " + str(nivel) + ")"\n',
    javascript: 'function cracha(nome, nivel) {\n  return `${nome} (nível ${nivel})`;\n}\n',
  },
  'aldric-l3': {
    python: 'def classificar(forca):\n    if forca < 10:\n        return "fraco"\n    elif forca < 50:\n        return "médio"\n    else:\n        return "forte"\n',
    javascript: 'function classificar(forca) {\n  if (forca < 10) return "fraco";\n  else if (forca < 50) return "médio";\n  else return "forte";\n}\n',
  },
  'aldric-b1': {
    python: 'def reagir(postura):\n    if postura == "defesa":\n        return "atacar"\n    return "defender"\n',
    javascript: 'function reagir(postura) {\n  return postura === "defesa" ? "atacar" : "defender";\n}\n',
  },
  'aldric-b2': {
    python: 'def golpe(postura, forca, escudo):\n    if postura == "ataque":\n        return forca * 2\n    return max(0, forca - escudo)\n',
    javascript: 'function golpe(postura, forca, escudo) {\n  if (postura === "ataque") return forca * 2;\n  return Math.max(0, forca - escudo);\n}\n',
  },
  'veyr-l1': {
    python: 'def somar_ate(n):\n    total = 0\n    for i in range(1, n + 1):\n        total += i\n    return total\n',
    javascript: 'function somarAte(n) {\n  let total = 0;\n  for (let i = 1; i <= n; i++) total += i;\n  return total;\n}\n',
  },
  'veyr-l2': {
    python: 'def contar_pares(numeros):\n    q = 0\n    for n in numeros:\n        if n % 2 == 0:\n            q += 1\n    return q\n',
    javascript: 'function contarPares(numeros) {\n  let q = 0;\n  for (const n of numeros) if (n % 2 === 0) q++;\n  return q;\n}\n',
  },
  'veyr-l3': {
    python: 'def primeiro_acima(numeros, limite):\n    for n in numeros:\n        if n > limite:\n            return n\n    return -1\n',
    javascript: 'function primeiroAcima(numeros, limite) {\n  for (const n of numeros) if (n > limite) return n;\n  return -1;\n}\n',
  },
  'veyr-b1': {
    python: 'def esquivar(golpes):\n    return ["abaixar" if g == "alto" else "pular" for g in golpes]\n',
    javascript: 'function esquivar(golpes) {\n  return golpes.map((g) => (g === "alto" ? "abaixar" : "pular"));\n}\n',
  },
  'veyr-b2': {
    python: 'def sequencia_de_veyr(n):\n    r = []\n    a, b = 3, 5\n    for _ in range(n):\n        r.append(a)\n        a, b = b, a + b\n    return r\n',
    javascript: 'function sequenciaDeVeyr(n) {\n  const r = [];\n  let a = 3, b = 5;\n  for (let i = 0; i < n; i++) {\n    r.push(a);\n    const p = a + b;\n    a = b;\n    b = p;\n  }\n  return r;\n}\n',
  },
  'seraphine-l1': {
    python: 'def media(a, b, c):\n    return (a + b + c) / 3\n',
    javascript: 'function media(a, b, c) {\n  return (a + b + c) / 3;\n}\n',
  },
  'seraphine-l2': {
    python: 'def dobro(x):\n    return x * 2\n\ndef quadruplo(x):\n    return dobro(dobro(x))\n',
    javascript: 'function dobro(x) {\n  return x * 2;\n}\nfunction quadruplo(x) {\n  return dobro(dobro(x));\n}\n',
  },
  'seraphine-l3': {
    python: 'def fatorial(n):\n    if n == 0:\n        return 1\n    return n * fatorial(n - 1)\n',
    javascript: 'function fatorial(n) {\n  if (n === 0) return 1;\n  return n * fatorial(n - 1);\n}\n',
  },
  'seraphine-b1': {
    python: 'def copias(tamanho):\n    if tamanho < 1:\n        return 0\n    return 1 + copias(tamanho // 2)\n',
    javascript: 'function copias(tamanho) {\n  if (tamanho < 1) return 0;\n  return 1 + copias(Math.floor(tamanho / 2));\n}\n',
  },
  'seraphine-b2': {
    python: 'def achatar(lista):\n    r = []\n    for item in lista:\n        if isinstance(item, list):\n            r.extend(achatar(item))\n        else:\n            r.append(item)\n    return r\n',
    javascript: 'function achatar(lista) {\n  const r = [];\n  for (const item of lista) {\n    if (Array.isArray(item)) r.push(...achatar(item));\n    else r.push(item);\n  }\n  return r;\n}\n',
  },
  'entity-l1': {
    python: 'import json\n\ndef ler_pergaminho(texto):\n    try:\n        return json.loads(texto)\n    except ValueError:\n        return None\n',
    javascript: 'function lerPergaminho(texto) {\n  try {\n    return JSON.parse(texto);\n  } catch (e) {\n    return null;\n  }\n}\n',
  },
  'entity-l2': {
    python: 'def validar_feitico(nome, poder):\n    if not isinstance(nome, str) or nome == "":\n        return "nome inválido"\n    if isinstance(poder, bool) or not isinstance(poder, (int, float)) or not (1 <= poder <= 100):\n        return "poder inválido"\n    return "ok"\n',
    javascript: 'function validarFeitico(nome, poder) {\n  if (typeof nome !== "string" || nome === "") return "nome inválido";\n  if (typeof poder !== "number" || poder < 1 || poder > 100) return "poder inválido";\n  return "ok";\n}\n',
  },
  'entity-b1': {
    python: 'def somar_validos(entradas):\n    total = 0\n    for t in entradas:\n        try:\n            total += int(t)\n        except ValueError:\n            pass\n    return total\n',
    javascript: 'function somarValidos(entradas) {\n  let total = 0;\n  for (const t of entradas) {\n    const n = Number(t);\n    if (t.trim() !== "" && Number.isInteger(n)) total += n;\n  }\n  return total;\n}\n',
  },
  'entity-b2': {
    python: 'def executar(lista, indice):\n    try:\n        v = lista[indice]\n    except IndexError:\n        return "fora do alcance"\n    if isinstance(v, bool) or not isinstance(v, (int, float)):\n        return "valor corrompido"\n    return v * 2\n',
    javascript: 'function executar(lista, indice) {\n  const v = lista.at(indice);\n  if (v === undefined) return "fora do alcance";\n  if (typeof v !== "number") return "valor corrompido";\n  return v * 2;\n}\n',
  },
  'entity-b3': {
    python: 'def relatorio(registros):\n    total = 0\n    erros = 0\n    for r in registros:\n        tipo = r.get("tipo")\n        valor = r.get("valor")\n        if tipo not in ("ataque", "defesa") or isinstance(valor, bool) or not isinstance(valor, (int, float)):\n            erros += 1\n            continue\n        if tipo == "ataque":\n            total += valor\n        else:\n            total -= valor // 2\n    return {"total": total, "erros": erros}\n',
    javascript: 'function relatorio(registros) {\n  let total = 0, erros = 0;\n  for (const r of registros) {\n    const { tipo, valor } = r;\n    if ((tipo !== "ataque" && tipo !== "defesa") || typeof valor !== "number") { erros++; continue; }\n    if (tipo === "ataque") total += valor;\n    else total -= Math.floor(valor / 2);\n  }\n  return { total, erros };\n}\n',
  },
  'extra-maior': { python: 'def maior(a, b):\n    return max(a, b)\n', javascript: 'function maior(a, b) {\n  return Math.max(a, b);\n}\n' },
  'extra-par': { python: 'def eh_par(n):\n    return n % 2 == 0\n', javascript: 'function ehPar(n) {\n  return n % 2 === 0;\n}\n' },
  'extra-inverter': { python: 'def inverter(texto):\n    return texto[::-1]\n', javascript: 'function inverter(texto) {\n  return texto.split("").reverse().join("");\n}\n' },
  'extra-vogais': {
    python: 'def contar_vogais(texto):\n    return sum(1 for c in texto.lower() if c in "aeiou")\n',
    javascript: 'function contarVogais(texto) {\n  return [...texto.toLowerCase()].filter((c) => "aeiou".includes(c)).length;\n}\n',
  },
  'extra-soma-lista': { python: 'def soma_lista(numeros):\n    return sum(numeros)\n', javascript: 'function somaLista(numeros) {\n  return numeros.reduce((a, b) => a + b, 0);\n}\n' },
  'extra-maior-lista': { python: 'def maior_da_lista(numeros):\n    return max(numeros)\n', javascript: 'function maiorDaLista(numeros) {\n  return Math.max(...numeros);\n}\n' },
  'extra-tabuada': { python: 'def tabuada(n):\n    return [n * i for i in range(1, 11)]\n', javascript: 'function tabuada(n) {\n  return Array.from({ length: 10 }, (_, i) => n * (i + 1));\n}\n' },
  'extra-palindromo': {
    python: 'def palindromo(texto):\n    t = texto.lower()\n    return t == t[::-1]\n',
    javascript: 'function palindromo(texto) {\n  const t = texto.toLowerCase();\n  return t === [...t].reverse().join("");\n}\n',
  },
  'extra-fizzbuzz': {
    python: 'def fizzbuzz(n):\n    if n % 15 == 0:\n        return "FizzBuzz"\n    if n % 3 == 0:\n        return "Fizz"\n    if n % 5 == 0:\n        return "Buzz"\n    return str(n)\n',
    javascript: 'function fizzbuzz(n) {\n  if (n % 15 === 0) return "FizzBuzz";\n  if (n % 3 === 0) return "Fizz";\n  if (n % 5 === 0) return "Buzz";\n  return String(n);\n}\n',
  },
  'extra-palavras': {
    python: 'def contar_palavras(frase):\n    return len(frase.split())\n',
    javascript: 'function contarPalavras(frase) {\n  const t = frase.trim();\n  return t === "" ? 0 : t.split(/\\s+/).length;\n}\n',
  },
};
