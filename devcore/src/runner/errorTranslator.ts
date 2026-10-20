// O Orwin traduz erros comuns para português simples, sem entregar a solução.
import type { Language, RunError, RunResult } from './types';

const where = (line: number | null) => (line ? ` (linha ${line})` : '');

function quoted(msg: string): string | null {
  const m = msg.match(/['"`]([^'"`]+)['"`]/);
  return m ? m[1] : null;
}

/** Explicação amigável de um erro. Retorna o texto que o Orwin fala. */
export function translateError(err: RunError, lang: Language): string {
  const { type, message: msg, line } = err;
  const at = where(line);
  switch (type) {
    case 'TimeoutError':
      return `O feitiço não parava de rodar e eu precisei interromper. Isso costuma ser um laço sem condição de parada: confira se a variável do laço muda a cada volta e se a condição um dia fica falsa.`;
    case 'FunctionNotFound':
      return `Não encontrei a função que o desafio pede. Confira se o nome está escrito exatamente igual, com as mesmas letras maiúsculas e minúsculas, e se ela foi ${lang === 'python' ? 'definida com def' : 'declarada com function'}.`;
    case 'LoadError':
      return 'O Python não carregou. Ele vem da internet na primeira vez; confira a conexão e tente de novo.';
    case 'IndentationError':
    case 'TabError':
      return `Problema de recuo${at}. Em Python, os espaços no começo da linha dizem o que está dentro de quê. Tudo que pertence a um def, if ou for precisa estar recuado no mesmo nível (4 espaços).`;
    case 'SyntaxError': {
      if (lang === 'python') {
        if (/expected ':'/i.test(msg)) return `Erro de sintaxe${at}: faltou os dois-pontos (:) no fim da linha. Em Python, def, if, elif, else, for e while terminam com ":".`;
        if (/never closed|was not closed|unexpected EOF|EOF while/i.test(msg)) return `Erro de sintaxe${at}: algum parêntese, colchete ou aspas foi aberto e não foi fechado. Conte os pares.`;
        if (/unmatched/i.test(msg)) return `Erro de sintaxe${at}: tem um parêntese ou colchete fechando sem ter sido aberto.`;
        if (/invalid syntax\. Maybe you meant '==' or ':='/i.test(msg) || /cannot assign/i.test(msg)) return `Erro de sintaxe${at}: para comparar use "==". Um "=" sozinho guarda um valor numa variável.`;
        if (/unterminated string/i.test(msg)) return `Erro de sintaxe${at}: um texto (string) começou com aspas e não terminou.`;
        return `Erro de sintaxe${at}: o Python não conseguiu ler essa linha. Olhe com calma para parênteses, aspas, dois-pontos e vírgulas.`;
      }
      if (/Unexpected end of input/i.test(msg)) return `Erro de sintaxe${at}: faltou fechar alguma chave }, parêntese ou colchete. Conte os pares.`;
      if (/Unexpected token|Unexpected identifier|missing \)/i.test(msg)) return `Erro de sintaxe${at}: tem um símbolo fora do lugar. Confira parênteses, chaves, vírgulas e ponto e vírgula perto dessa linha.`;
      if (/Invalid or unexpected token|Unterminated string/i.test(msg)) return `Erro de sintaxe${at}: provavelmente uma aspa que abriu e não fechou.`;
      if (/already been declared/i.test(msg)) return `Erro de sintaxe${at}: você declarou a mesma variável duas vezes (let/const). Declare uma vez e depois só atribua.`;
      return `Erro de sintaxe${at}: o JavaScript não conseguiu ler o código. Olhe parênteses, chaves e aspas.`;
    }
    case 'NameError': {
      const name = quoted(msg);
      return `O nome ${name ? `"${name}" ` : ''}não existe${at}. Pode ser erro de digitação, uma variável usada antes de ser criada ou um texto sem aspas.`;
    }
    case 'UnboundLocalError':
      return `Você usou uma variável${at} antes de dar um valor a ela dentro da função. Crie a variável antes de usá-la.`;
    case 'ReferenceError': {
      const name = msg.split(' ')[0];
      if (/before initialization/i.test(msg)) return `A variável "${name}" foi usada${at} antes da linha em que é criada.`;
      return `"${name}" não existe${at}. Confira a digitação (maiúsculas importam!) e se a variável foi criada com let ou const.`;
    }
    case 'TypeError': {
      if (lang === 'python') {
        if (/unsupported operand/i.test(msg) || /can only concatenate/i.test(msg) || /must be str, not/i.test(msg)) return `Tipos misturados${at}: você tentou juntar coisas de tipos diferentes, como texto com número. Converta antes com str() ou int().`;
        if (/missing \d+ required positional argument/i.test(msg)) return `A função foi chamada com menos valores do que espera${at}. Confira quantos parâmetros ela recebe.`;
        if (/takes \d+ positional argument/i.test(msg)) return `A função recebeu mais valores do que espera${at}. Confira a lista de parâmetros no def.`;
        if (/not callable/i.test(msg)) return `Você tentou chamar com () algo que não é função${at}.`;
        if (/not subscriptable/i.test(msg)) return `Você usou [ ] em algo que não é lista nem dicionário${at}.`;
        if (/not iterable/i.test(msg)) return `O for precisa de algo que dê para percorrer (lista, texto, range)${at}, e recebeu outra coisa.`;
        return `Erro de tipo${at}: uma operação recebeu um valor do tipo errado. Confira se cada variável é número, texto ou lista como você imagina.`;
      }
      if (/is not a function/i.test(msg)) return `Você chamou com () algo que não é função${at}. Confira o nome.`;
      if (/Cannot read propert|undefined|null/i.test(msg)) return `Você tentou acessar algo dentro de um valor vazio (undefined ou null)${at}. Confira se a variável tem mesmo um valor nesse ponto.`;
      if (/Assignment to constant/i.test(msg)) return `Você tentou mudar uma constante${at}. Se o valor vai mudar, declare com let em vez de const.`;
      return `Erro de tipo${at}: uma operação recebeu um valor do tipo errado.`;
    }
    case 'ZeroDivisionError':
      return `Divisão por zero${at}! Nem a Entidade consegue isso. Antes de dividir, confira se o divisor pode ser 0 e trate esse caso.`;
    case 'IndexError':
      return `Você pediu uma posição que não existe na lista${at}. Lembre: a primeira posição é 0 e a última é len(lista) - 1.`;
    case 'KeyError':
      return `A chave ${msg} não existe no dicionário${at}. Confira a grafia ou use .get() para buscar com segurança.`;
    case 'AttributeError':
      return `Esse valor não tem a propriedade ou método que você usou${at}. Confira o nome e o tipo do valor.`;
    case 'ValueError':
      return `O tipo do valor estava certo, mas o conteúdo não${at} (por exemplo, int("abc")). Confira o que está sendo convertido.`;
    case 'RecursionError':
      return `A função chamou a si mesma vezes demais${at}. Toda recursão precisa de um caso-base que pare as chamadas, e cada chamada precisa chegar mais perto dele.`;
    case 'RangeError':
      if (/call stack/i.test(msg)) return 'A função chamou a si mesma vezes demais. Toda recursão precisa de um caso-base que pare as chamadas, e cada chamada precisa chegar mais perto dele.';
      return `Um valor saiu do intervalo permitido${at}.`;
    case 'RuntimeError':
      if (/input\(\)/.test(msg)) return 'Aqui não usamos input(): os valores chegam pelos parâmetros da função.';
      return `Erro durante a execução${at}: ${msg}`;
    default:
      return `Algo deu errado${at}: ${type}. Leia a mensagem no terminal com calma: ela costuma apontar a linha do problema.`;
  }
}

/** Fala do Orwin para um resultado inteiro (erro, testes falhando ou sucesso). */
export function mentorFeedback(result: RunResult, lang: Language): string {
  if (result.error) return translateError(result.error, lang);
  const failed = result.tests.filter((t) => !t.ok);
  if (!failed.length) return 'Todos os testes passaram. Bonito.';
  const visible = failed.find((t) => !t.hidden);
  if (visible && visible.received === undefined && !visible.error) {
    return lang === 'javascript'
      ? 'Sua função não devolveu nada (undefined). Faltou um return com o resultado?'
      : 'Sua função não devolveu nada (None). Faltou um return com o resultado?';
  }
  if (visible && visible.received === null && lang === 'python' && !visible.error) return 'Sua função devolveu None. Faltou um return com o resultado?';
  const passed = result.tests.length - failed.length;
  if (!visible) return `Os testes visíveis passaram, mas ${failed.length} teste(s) oculto(s) falharam. Pense nos casos extremos: zero, números negativos, listas vazias.`;
  return `${passed} de ${result.tests.length} testes passaram. Compare o esperado com o recebido no teste que falhou: a diferença conta a história.`;
}
