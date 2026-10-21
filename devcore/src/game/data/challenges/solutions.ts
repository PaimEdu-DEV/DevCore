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
  'entity-l1': {
    python: 'import json\n\ndef ler_pergaminho(texto):\n    try:\n        return json.loads(texto)\n    except ValueError:\n        return None\n',
    javascript: 'function lerPergaminho(texto) {\n  try {\n    return JSON.parse(texto);\n  } catch (e) {\n    return null;\n  }\n}\n',
  },
  'entity-l2': {
    python: 'def validar_feitico(nome, poder):\n    if not isinstance(nome, str) or nome == "":\n        return "nome inválido"\n    if isinstance(poder, bool) or not isinstance(poder, (int, float)) or not (1 <= poder <= 100):\n        return "poder inválido"\n    return "ok"\n',
    javascript: 'function validarFeitico(nome, poder) {\n  if (typeof nome !== "string" || nome === "") return "nome inválido";\n  if (typeof poder !== "number" || poder < 1 || poder > 100) return "poder inválido";\n  return "ok";\n}\n',
  },
  // Jornada (capangas e chefes)
  'bug-soma': {
    python: "def soma(a, b):\n    return a + b\n",
    javascript: "function soma(a, b) {\n  return a + b;\n}\n",
  },
  'bug-cura': {
    python: "def curar(vida, cura):\n    return vida + cura\n",
    javascript: "function curar(vida, cura) {\n  return vida + cura;\n}\n",
  },
  'aldric-b1': {
    python: "def dobro(forca):\n    return forca * 2\n",
    javascript: "function dobro(forca) {\n  return forca * 2;\n}\n",
  },
  'aldric-b2': {
    python: "def dano(forca, escudo):\n    return forca - escudo\n",
    javascript: "function dano(forca, escudo) {\n  return forca - escudo;\n}\n",
  },
  'bug-par-impar': {
    python: "def par_ou_impar(n):\n    if n % 2 == 0:\n        return \"par\"\n    else:\n        return \"impar\"\n",
    javascript: "function parOuImpar(n) {\n  if (n % 2 === 0) {\n    return \"par\";\n  } else {\n    return \"impar\";\n  }\n}\n",
  },
  'bug-eh-par': {
    python: "def eh_par(n):\n    if n % 2 == 0:\n        return True\n    else:\n        return False\n",
    javascript: "function ehPar(n) {\n  if (n % 2 === 0) {\n    return true;\n  } else {\n    return false;\n  }\n}\n",
  },
  'veyr-b1': {
    python: "def esquivar(golpe):\n    if golpe == \"alto\":\n        return \"abaixar\"\n    else:\n        return \"pular\"\n",
    javascript: "function esquivar(golpe) {\n  if (golpe === \"alto\") {\n    return \"abaixar\";\n  } else {\n    return \"pular\";\n  }\n}\n",
  },
  'veyr-b2': {
    python: "def maior(a, b):\n    if a > b:\n        return a\n    else:\n        return b\n",
    javascript: "function maior(a, b) {\n  if (a > b) {\n    return a;\n  } else {\n    return b;\n  }\n}\n",
  },
  'bug-saudacao': {
    python: "def saudacao(nome):\n    return \"Oi, \" + nome\n",
    javascript: "function saudacao(nome) {\n  return \"Oi, \" + nome;\n}\n",
  },
  'bug-grito': {
    python: "def gritar(texto):\n    return texto.upper()\n",
    javascript: "function gritar(texto) {\n  return texto.toUpperCase();\n}\n",
  },
  'seraphine-b1': {
    python: "def copias(n):\n    return n * 2\n",
    javascript: "function copias(n) {\n  return n * 2;\n}\n",
  },
  'seraphine-b2': {
    python: "def revelar(nome):\n    return \"Eu vejo você, \" + nome + \"!\"\n",
    javascript: "function revelar(nome) {\n  return \"Eu vejo você, \" + nome + \"!\";\n}\n",
  },
  'bug-media': {
    python: "def media(a, b):\n    return (a + b) / 2\n",
    javascript: "function media(a, b) {\n  return (a + b) / 2;\n}\n",
  },
  'bug-senha': {
    python: "def portao(senha):\n    if senha == \"core\":\n        return \"entrar\"\n    else:\n        return \"bloqueado\"\n",
    javascript: "function portao(senha) {\n  if (senha === \"core\") {\n    return \"entrar\";\n  } else {\n    return \"bloqueado\";\n  }\n}\n",
  },
  'entity-b1': {
    python: "def somar_tres(a, b, c):\n    return a + b + c\n",
    javascript: "function somarTres(a, b, c) {\n  return a + b + c;\n}\n",
  },
  'entity-b2': {
    python: "def corrigir(n):\n    if n < 0:\n        return 0\n    else:\n        return n\n",
    javascript: "function corrigir(n) {\n  if (n < 0) {\n    return 0;\n  } else {\n    return n;\n  }\n}\n",
  },
  'entity-b3': {
    python: "def somar_lista(numeros):\n    total = 0\n    for n in numeros:\n        total += n\n    return total\n",
    javascript: "function somarLista(numeros) {\n  let total = 0;\n  for (const n of numeros) {\n    total += n;\n  }\n  return total;\n}\n",
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
  'extra-filtrar-pares': {
    python: 'def filtrar_pares(numeros):\n    return [n for n in numeros if n % 2 == 0]\n',
    javascript: 'function filtrarPares(numeros) {\n  return numeros.filter((n) => n % 2 === 0);\n}\n',
  },
  'extra-sem-repetidos': {
    python: 'def sem_repetidos(itens):\n    r = []\n    for x in itens:\n        if x not in r:\n            r.append(x)\n    return r\n',
    javascript: 'function semRepetidos(itens) {\n  return [...new Set(itens)];\n}\n',
  },
  'extra-acima-media': {
    python: 'def acima_da_media(numeros):\n    if not numeros:\n        return 0\n    m = sum(numeros) / len(numeros)\n    return len([n for n in numeros if n > m])\n',
    javascript: 'function acimaDaMedia(numeros) {\n  if (numeros.length === 0) return 0;\n  const m = numeros.reduce((a, b) => a + b, 0) / numeros.length;\n  return numeros.filter((n) => n > m).length;\n}\n',
  },
  'extra-inventario': {
    python: 'def inventario(itens):\n    c = {}\n    for i in itens:\n        c[i] = c.get(i, 0) + 1\n    return c\n',
    javascript: 'function inventario(itens) {\n  const c = {};\n  for (const i of itens) c[i] = (c[i] ?? 0) + 1;\n  return c;\n}\n',
  },
  'extra-conta-loja': {
    python: 'def conta_da_loja(precos, compras):\n    return sum(precos.get(i, 0) for i in compras)\n',
    javascript: 'function contaDaLoja(precos, compras) {\n  return compras.reduce((t, i) => t + (precos[i] ?? 0), 0);\n}\n',
  },
  'extra-titulo': {
    python: 'def titulo(frase):\n    return " ".join(p[:1].upper() + p[1:].lower() for p in frase.split(" "))\n',
    javascript: 'function titulo(frase) {\n  return frase.split(" ").map((p) => p.slice(0, 1).toUpperCase() + p.slice(1).toLowerCase()).join(" ");\n}\n',
  },
  'extra-iniciais': {
    python: 'def iniciais(nome):\n    return "".join(p[0] for p in nome.split()).upper()\n',
    javascript: 'function iniciais(nome) {\n  return nome.split(" ").filter(Boolean).map((p) => p[0]).join("").toUpperCase();\n}\n',
  },
  'extra-cifra': {
    python: 'def cifrar(texto, k):\n    r = ""\n    for c in texto:\n        if "a" <= c <= "z":\n            r += chr((ord(c) - 97 + k) % 26 + 97)\n        else:\n            r += c\n    return r\n',
    javascript: 'function cifrar(texto, k) {\n  let r = "";\n  for (const c of texto) {\n    r += c >= "a" && c <= "z" ? String.fromCharCode((c.charCodeAt(0) - 97 + k) % 26 + 97) : c;\n  }\n  return r;\n}\n',
  },
};
