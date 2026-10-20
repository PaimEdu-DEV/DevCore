import type { NpcId } from '../data/characters';
import type { SaveData } from '../state/save';
import type { PropId } from './map';

export type TalkAction =
  | 'close'
  | 'training'
  | 'tutorial'
  | 'tip'
  | 'shop'
  | 'chat'
  | 'scroll'
  | 'save'
  | 'profile'
  | 'welcome'
  | 'lightning'
  | 'duel'
  | 'daily'
  | 'missions'
  | 'bossSelect'
  | 'cosmetics';

export interface Talk {
  speaker: NpcId | null;
  lines: string[];
  choices: { label: string; action: TalkAction }[];
}

const TIPS = [
  'Leia a mensagem de erro de baixo para cima. A última linha diz O QUE deu errado; as de cima dizem ONDE.',
  'Quando travar, explique o problema em voz alta para um pato de borracha. Funciona. Eu uso um pombo.',
  'Nomes de variáveis bons valem ouro. "total" diz mais que "x".',
  'Teste os casos extremos: zero, lista vazia, número negativo. É ali que os bugs moram.',
  'Um print no lugar certo vale mais que dez minutos encarando o código.',
  'Programar é 10% escrever e 90% ler o que você escreveu. Seja gentil com o você do futuro.',
  'Indentação em Python não é enfeite: ela diz o que está dentro de quê.',
  'Em JavaScript, prefira const. Use let só quando o valor precisar mudar.',
];

export function randomTip(): string {
  return TIPS[Math.floor(Math.random() * TIPS.length)];
}

export const TUTORIAL_LINES = [
  'Tutorial rápido, preste atenção que eu só explico... bom, quantas vezes você precisar.',
  'Na vila: setas ou WASD para andar, Enter ou Espaço para falar, Esc para abrir o menu. Clicar no chão também funciona.',
  'Cada desafio tem um enunciado e um editor. Você escreve a função pedida e aperta ▶ Executar, ou Ctrl+Enter.',
  'Os testes chamam a sua função com valores e comparam o que ela devolve com o esperado. Verde passou, vermelho não.',
  'Testes ocultos escondem os valores para você pensar nos casos extremos, em vez de decorar respostas.',
  'Se aparecer um erro, eu traduzo a mensagem. A linha com problema fica destacada em vermelho no editor.',
  'Dicas custam moedas e vêm em três níveis, cada uma mais direta. Mas eu nunca entrego a resposta pronta.',
  'Nas lutas, código certo vira dano. Sem dicas e sem erros, o golpe é crítico. Errar gera contra-ataque, mas você não perde progresso.',
];

export function npcTalk(id: NpcId, save: SaveData, today: string): Talk {
  const name = save.player.name;
  switch (id) {
    case 'orwin': {
      const first = !save.flags.met_orwin;
      return {
        speaker: 'orwin',
        lines: first
          ? [`Ah, ${name}. Aqui é onde eu guardo os pergaminhos que a Entidade não conseguiu queimar.`, 'Treine comigo antes de encarar o portão. Cada lição destrava a luta contra um dos traidores.']
          : [['De volta? Ótimo. O chá ainda está quente.', `${name}! Pronto para mais um pergaminho?`, 'Diga, diga. Os pergaminhos não se leem sozinhos.'][Math.floor(Math.random() * 3)]],
        choices: [
          { label: 'Treino (lições)', action: 'training' },
          { label: 'Tutorial', action: 'tutorial' },
          { label: 'Uma dica', action: 'tip' },
          { label: 'Até mais', action: 'close' },
        ],
      };
    }
    case 'garrick':
      return {
        speaker: 'garrick',
        lines: [save.stats.coins >= 100 ? 'Ouço moedas tilintando! Venha ver o que a bigorna cuspiu hoje.' : 'Chapéus, auras, molduras... Um herói também precisa de estilo, sabia?'],
        choices: [
          { label: 'Ver a loja', action: 'shop' },
          { label: 'Conversar', action: 'chat' },
          { label: 'Até mais', action: 'close' },
        ],
      };
    case 'maren':
      return {
        speaker: 'maren',
        lines: ['Eu registro cada feito do reino no Pergaminho. Cada lição, cada vilão derrotado.'],
        choices: [
          { label: 'Ver o Pergaminho', action: 'scroll' },
          { label: 'Minha posição', action: 'chat' },
          { label: 'Até mais', action: 'close' },
        ],
      };
    case 'isolde': {
      const bonus = save.daily.lastWelcomeBonus !== today;
      return {
        speaker: 'isolde',
        lines: [bonus ? `Bem-vindo de volta, ${name}! Tenho um presentinho do dia guardado para você.` : 'Precisa descansar? Seu quarto está sempre pronto.'],
        choices: [
          ...(bonus ? [{ label: 'Bônus do dia', action: 'welcome' as const }] : []),
          { label: 'Salvar o jogo', action: 'save' },
          { label: 'Meu perfil', action: 'profile' },
          { label: 'Até mais', action: 'close' },
        ],
      };
    }
    case 'torvan':
      return {
        speaker: 'torvan',
        lines: ['HA! Mais um desafiante! Na minha arena só existe uma regra: rápido e certo!'],
        choices: [
          { label: 'Desafio Relâmpago', action: 'lightning' },
          { label: 'Duelo 1x1 (em breve)', action: 'duel' },
          { label: 'Até mais', action: 'close' },
        ],
      };
    case 'elowen': {
      const done = !!save.daily.completed[today];
      return {
        speaker: 'elowen',
        lines: [done ? 'Já caçou o desafio de hoje. Bom trabalho. Amanhã tem outro no quadro.' : 'Tem um desafio novo no quadro hoje. Topa? Se não der hoje, tudo bem: amanhã tem outro.'],
        choices: [
          { label: done ? 'Refazer o desafio do dia' : 'Desafio do dia', action: 'daily' },
          { label: 'Missões', action: 'missions' },
          { label: 'Até mais', action: 'close' },
        ],
      };
    }
  }
}

export function chatLines(id: NpcId, rankText: string | null): string[] {
  switch (id) {
    case 'garrick':
      return ['Antes da Entidade, eu forjava as engrenagens do Core. Hoje forjo chapéus. A vida dá voltas.', 'Mas olhe: ferreiro e programador são parecidos. Martela, testa, martela de novo.'];
    case 'maren':
      return [rankText ?? 'Ainda não encontrei seu nome no Pergaminho. Conclua uma lição e eu escrevo.'];
    default:
      return ['...'];
  }
}

export function propTalk(prop: PropId): Talk {
  switch (prop) {
    case 'gate':
      return {
        speaker: null,
        lines: ['O Portão do Reino. Fendas verdes pulsam na madeira. Do outro lado, os traidores esperam.'],
        choices: [
          { label: 'Atravessar o portão', action: 'bossSelect' },
          { label: 'Ainda não', action: 'close' },
        ],
      };
    case 'sign':
      return { speaker: null, lines: ['"Quadro de caçadas da Elowen: desafios novos todo dia. Sem pressa, sem punição. — E."'], choices: [] };
    case 'well':
      return { speaker: null, lines: ['Um poço antigo. Lá no fundo, uma moeda brilha. Alguém fez um pedido: "que o Core volte a falar".'], choices: [] };
  }
}
