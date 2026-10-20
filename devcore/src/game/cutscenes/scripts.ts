import type { Cutscene, Step } from './types';

// Posições padrão (pés) no palco 320x180. A caixa de diálogo ocupa a faixa de baixo (~y 126+).
const HERO_X = 86;
const FOE_X = 236;
const FLOOR = 124;

const villainEnter = (id: string, x = FOE_X, y = FLOOR): Step[] => [
  { t: 'showSprite', id, character: id, x: x + 60, y, flip: true, ms: 500 },
  { t: 'move', id, x, y, ms: 700, wait: true },
];

/** Entidade descartando um general derrotado (rivalidade e desprezo). */
const discard = (id: string): Step[] => [
  { t: 'flash', color: '#9BFF1A', ms: 260 },
  { t: 'shake', ms: 500, intensity: 3 },
  { t: 'hideSprite', id, ms: 800 },
];

export const CUTSCENES: Record<string, Cutscene> = {
  opening: {
    id: 'opening',
    steps: [
      { t: 'background', bg: 'black' },
      { t: 'fade', to: 'black', ms: 0 },
      { t: 'background', bg: 'core' },
      { t: 'fade', to: 'clear', ms: 900 },
      { t: 'narrate', text: 'Antes de existir reino, existia o Core.' },
      { t: 'narrate', text: 'Um coração de luz que pulsava em linguagem. Cada ponte, cada colheita, cada porta do reino era escrita em código.' },
      { t: 'narrate', text: 'Quem sabia ler o Core sabia fazer o reino funcionar.' },
      { t: 'flash', color: '#9BFF1A', ms: 220 },
      { t: 'shake', ms: 600, intensity: 4 },
      { t: 'fade', to: 'black', ms: 400 },
      { t: 'background', bg: 'kingdom' },
      { t: 'fade', to: 'clear', ms: 600 },
      { t: 'narrate', text: 'Até a noite em que algo sem nome atravessou a muralha.' },
      { t: 'showSprite', id: 'entity', character: 'entity', x: 160, y: 132, flip: true, ms: 900 },
      { t: 'flash', color: '#9BFF1A', ms: 200 },
      { t: 'narrate', text: 'A Entidade. Coroa partida, máscara rachada, um halo de runas e quatro braços para segurar o que não é seu.' },
      { t: 'say', speaker: 'entity', text: 'Este coração agora bate para mim.' },
      { t: 'narrate', text: 'Ela corrompeu o Core. A linguagem do reino virou ruído verde. E o reino virou refém.' },
      { t: 'hideSprite', id: 'entity', ms: 500 },
      { t: 'narrate', text: 'Três guardiões abriram as portas para ela. Ninguém os obrigou.' },
      { t: 'showSprite', id: 'aldric', character: 'aldric', x: 70, y: 130, flip: true },
      { t: 'say', speaker: 'aldric', text: 'A força nunca precisou pedir permissão.' },
      { t: 'showSprite', id: 'veyr', character: 'veyr', x: 160, y: 130, flip: true },
      { t: 'say', speaker: 'veyr', text: 'Eu só segui o cheiro do medo. Ele leva sempre ao mais forte.' },
      { t: 'showSprite', id: 'seraphine', character: 'seraphine', x: 250, y: 130, flip: true },
      { t: 'say', speaker: 'seraphine', text: 'Conhecimento proibido não existe. Existe gente com medo de saber.' },
      { t: 'fade', to: 'black', ms: 700 },
      { t: 'hideSprite', id: 'aldric', ms: 0 },
      { t: 'hideSprite', id: 'veyr', ms: 0 },
      { t: 'hideSprite', id: 'seraphine', ms: 0 },
      { t: 'background', bg: 'archive' },
      { t: 'showSprite', id: 'orwin', character: 'orwin', x: 160, y: FLOOR, anim: 'idle' },
      { t: 'fade', to: 'clear', ms: 700 },
      { t: 'say', speaker: 'orwin', text: 'Ah. Você acordou. Ótimo, eu estava ficando sem chá.' },
      { t: 'say', speaker: 'orwin', text: 'Sou Orwin, arquivista. Guardo o que sobrou da linguagem do Core: pergaminhos, regras, exemplos. E poeira. Muita poeira.' },
      { t: 'say', speaker: 'orwin', text: 'A Entidade levou o reino, mas não levou o que está escrito aqui. Cada linha de código correta abre uma rachadura na corrupção dela.' },
      { t: 'say', speaker: 'orwin', text: 'Simples assim. Bom, simples não é. Mas é possível.' },
      { t: 'say', speaker: 'orwin', text: 'Antes de qualquer coisa... quem é você?' },
      { t: 'fade', to: 'black', ms: 500 },
    ],
  },

  arrival: {
    id: 'arrival',
    steps: [
      { t: 'background', bg: 'village' },
      { t: 'showSprite', id: 'orwin', character: 'orwin', x: 200, y: 140 },
      { t: 'showSprite', id: 'hero', character: 'hero', x: 100, y: 140 },
      { t: 'fade', to: 'clear', ms: 700 },
      { t: 'say', speaker: 'orwin', text: '{nome}, {classe}. Combina com você.' },
      { t: 'say', speaker: 'orwin', text: 'Seu grimório é o {linguagem}. Escreva com cuidado: o Core entende exatamente o que você escreve, nem uma vírgula a mais.' },
      { t: 'say', speaker: 'orwin', text: 'Esta é a Vila do Portão, a última que a corrupção não engoliu.' },
      { t: 'say', speaker: 'orwin', text: 'Converse com todo mundo. Garrick vende roupas para heróis vaidosos, Maren anota quem é bom, Isolde guarda seu progresso, Torvan grita muito e Elowen tem tarefas.' },
      { t: 'say', speaker: 'orwin', text: 'Ao norte fica o Portão do Reino. Aldric guarda a primeira muralha.' },
      { t: 'say', speaker: 'orwin', text: 'Mas treine comigo antes. Eu não entrego respostas. Entrego perguntas melhores.' },
      { t: 'narrate', text: 'Ande com as setas ou WASD. Fale com Enter, Espaço ou um clique. Esc abre o menu.' },
      { t: 'setFlag', flag: 'intro_done', value: true },
      { t: 'fade', to: 'black', ms: 400 },
    ],
  },

  aldric_intro: {
    id: 'aldric_intro',
    steps: [
      { t: 'background', bg: 'battle_aldric' },
      { t: 'showSprite', id: 'hero', character: 'hero', x: HERO_X, y: FLOOR },
      { t: 'fade', to: 'clear', ms: 500 },
      ...villainEnter('aldric'),
      { t: 'say', speaker: 'aldric', text: 'Alto. Esta muralha não se abre para aprendizes.' },
      { t: 'say', speaker: 'aldric', text: 'Comandei a guarda deste reino por vinte anos. Aprendi que regras só servem para quem é fraco.' },
      { t: 'say', speaker: 'aldric', text: 'A Entidade me deu poder de verdade. Tudo o que pediu em troca foi a chave do portão.' },
      { t: 'say', speaker: 'hero', text: 'Você vendeu o reino.' },
      { t: 'say', speaker: 'aldric', text: 'Eu escolhi o lado que vence. Defesa ou ataque: leia a minha postura, se for capaz.' },
      { t: 'anim', id: 'aldric', anim: 'attack' },
      { t: 'shake', ms: 300, intensity: 2 },
      { t: 'say', speaker: 'aldric', text: 'Veyr apostou que você não passaria do primeiro golpe. Não me faça dar razão àquele rato.' },
      { t: 'startBattle', villain: 'aldric' },
    ],
  },

  aldric_defeat: {
    id: 'aldric_defeat',
    steps: [
      { t: 'background', bg: 'battle_aldric' },
      { t: 'showSprite', id: 'hero', character: 'hero', x: HERO_X, y: FLOOR, anim: 'victory' },
      { t: 'showSprite', id: 'aldric', character: 'aldric', x: FOE_X, y: FLOOR, flip: true, anim: 'hurt' },
      { t: 'fade', to: 'clear', ms: 400 },
      { t: 'say', speaker: 'aldric', text: 'Impossível... minhas condições eram perfeitas...' },
      { t: 'say', speaker: 'entity', text: 'Perfeitas e inúteis. Você era um portão, Aldric. Portões quebram.' },
      { t: 'say', speaker: 'aldric', text: 'Senhora, espere! Eu ainda posso...' },
      { t: 'say', speaker: 'entity', text: 'Silêncio.' },
      { t: 'anim', id: 'aldric', anim: 'defeat', wait: true },
      ...discard('aldric'),
      { t: 'narrate', text: 'A armadura de Aldric se desfaz em fumaça verde. A primeira muralha cai.' },
      { t: 'narrate', text: 'Lá longe, uma rachadura dourada atravessa o Core.' },
      { t: 'fade', to: 'black', ms: 500 },
    ],
  },

  veyr_intro: {
    id: 'veyr_intro',
    steps: [
      { t: 'background', bg: 'battle_veyr' },
      { t: 'showSprite', id: 'hero', character: 'hero', x: HERO_X, y: FLOOR },
      { t: 'fade', to: 'clear', ms: 500 },
      ...villainEnter('veyr'),
      { t: 'say', speaker: 'veyr', text: 'Hehe. Então foi você que derrubou o grandalhão.' },
      { t: 'say', speaker: 'veyr', text: 'Aldric sempre foi lento. Eu não sou. Ataco três vezes. Depois cinco. Depois oito.' },
      { t: 'say', speaker: 'veyr', text: 'Eu era batedor. Ia na frente, sozinho, no escuro, e ninguém agradecia. A Entidade agradece.' },
      { t: 'say', speaker: 'hero', text: 'Ela agradeceu o Aldric também. Com fumaça.' },
      { t: 'say', speaker: 'veyr', text: 'Aldric era fraco. Eu sei a hora de parar. E você, sabe?' },
      { t: 'anim', id: 'veyr', anim: 'attack' },
      { t: 'startBattle', villain: 'veyr' },
    ],
  },

  veyr_defeat: {
    id: 'veyr_defeat',
    steps: [
      { t: 'background', bg: 'battle_veyr' },
      { t: 'showSprite', id: 'hero', character: 'hero', x: HERO_X, y: FLOOR, anim: 'victory' },
      { t: 'showSprite', id: 'veyr', character: 'veyr', x: FOE_X, y: FLOOR, flip: true, anim: 'hurt' },
      { t: 'fade', to: 'clear', ms: 400 },
      { t: 'say', speaker: 'veyr', text: 'Não... eu contei cada golpe... onde foi que eu errei a conta?' },
      { t: 'say', speaker: 'entity', text: 'Você confundiu crueldade com competência, batedor.' },
      { t: 'say', speaker: 'veyr', text: 'Eu fiz tudo o que a senhora mandou!' },
      { t: 'say', speaker: 'entity', text: 'Por isso mesmo você era substituível.' },
      { t: 'anim', id: 'veyr', anim: 'defeat', wait: true },
      ...discard('veyr'),
      { t: 'narrate', text: 'Veyr some nas sombras que ele tanto amava. A segunda muralha cai.' },
      { t: 'fade', to: 'black', ms: 500 },
    ],
  },

  seraphine_intro: {
    id: 'seraphine_intro',
    steps: [
      { t: 'background', bg: 'battle_seraphine' },
      { t: 'showSprite', id: 'hero', character: 'hero', x: HERO_X, y: FLOOR },
      { t: 'fade', to: 'clear', ms: 500 },
      ...villainEnter('seraphine'),
      { t: 'say', speaker: 'seraphine', text: 'Então este é o aprendiz que derrubou dois generais. Que decepção.' },
      { t: 'say', speaker: 'seraphine', text: 'Guardei a biblioteca do Core a vida inteira. Li tudo o que me deixaram ler.' },
      { t: 'say', speaker: 'seraphine', text: 'O resto eu fui ler sozinha. Fui eu que abri o Core. Fui eu que deixei a Entidade entrar.' },
      { t: 'say', speaker: 'hero', text: 'Por quê?' },
      { t: 'say', speaker: 'seraphine', text: 'Porque eu queria saber. E saber vale qualquer preço. Até o seu reino.' },
      { t: 'say', speaker: 'seraphine', text: 'Aldric era força sem cérebro. Veyr, cérebro sem paciência. Eu sou o que eles nunca foram.' },
      { t: 'say', speaker: 'seraphine', text: 'Cada cópia minha é menor que a anterior. Encontre o caso-base, ou afunde para sempre.' },
      { t: 'startBattle', villain: 'seraphine' },
    ],
  },

  seraphine_defeat: {
    id: 'seraphine_defeat',
    steps: [
      { t: 'background', bg: 'battle_seraphine' },
      { t: 'showSprite', id: 'hero', character: 'hero', x: HERO_X, y: FLOOR, anim: 'victory' },
      { t: 'showSprite', id: 'seraphine', character: 'seraphine', x: FOE_X, y: FLOOR, flip: true, anim: 'hurt' },
      { t: 'fade', to: 'clear', ms: 400 },
      { t: 'say', speaker: 'seraphine', text: 'Uma função que termina... eu tinha esquecido que tudo precisa terminar.' },
      { t: 'say', speaker: 'entity', text: 'Você leu todos os livros, Seraphine, e não entendeu nenhum.' },
      { t: 'say', speaker: 'seraphine', text: 'Eu te dei o Core! Eu te dei TUDO!' },
      { t: 'say', speaker: 'entity', text: 'E eu aceitei. Agora não preciso mais de você.' },
      { t: 'anim', id: 'seraphine', anim: 'defeat', wait: true },
      ...discard('seraphine'),
      { t: 'narrate', text: 'A biblioteca se apaga. Só resta o vazio, e aquilo que mora nele.' },
      { t: 'fade', to: 'black', ms: 500 },
    ],
  },

  entity_intro: {
    id: 'entity_intro',
    steps: [
      { t: 'background', bg: 'battle_entity' },
      { t: 'showSprite', id: 'hero', character: 'hero', x: HERO_X - 10, y: FLOOR },
      { t: 'fade', to: 'clear', ms: 800 },
      { t: 'flash', color: '#9BFF1A', ms: 300 },
      { t: 'showSprite', id: 'entity', character: 'entity', x: FOE_X, y: FLOOR + 4, flip: true, ms: 600 },
      { t: 'shake', ms: 600, intensity: 3 },
      { t: 'say', speaker: 'entity', text: 'Pequeno {classe}. Você derrubou meu portão, meu cão de caça e minha bibliotecária.' },
      { t: 'say', speaker: 'entity', text: 'Eram ferramentas. Ferramentas quebram. Eu não.' },
      { t: 'say', speaker: 'hero', text: 'Devolva o Core.' },
      { t: 'say', speaker: 'entity', text: 'O Core é linguagem. E a linguagem obedece a quem fala mais alto.' },
      { t: 'say', speaker: 'entity', text: 'Vou lançar contra você tudo o que eles lançaram. E exceções que você nunca viu.' },
      { t: 'narrate', text: 'A voz de Orwin ecoa na sua lembrança: "Quando algo pode dar errado, tente. E trate o que falhar."' },
      { t: 'startBattle', villain: 'entity' },
    ],
  },

  entity_defeat: {
    id: 'entity_defeat',
    steps: [
      { t: 'background', bg: 'battle_entity' },
      { t: 'showSprite', id: 'hero', character: 'hero', x: HERO_X, y: FLOOR, anim: 'victory' },
      { t: 'showSprite', id: 'entity', character: 'entity', x: FOE_X, y: FLOOR + 4, flip: true, anim: 'hurt' },
      { t: 'fade', to: 'clear', ms: 400 },
      { t: 'say', speaker: 'entity', text: 'Isto... é uma exceção... que eu não previ.' },
      { t: 'say', speaker: 'entity', text: 'Não há... tratamento...' },
      { t: 'anim', id: 'entity', anim: 'defeat', wait: true },
      { t: 'flash', color: '#FFFFFF', ms: 500 },
      { t: 'shake', ms: 900, intensity: 4 },
      { t: 'hideSprite', id: 'entity', ms: 900 },
      { t: 'fade', to: 'white', ms: 800 },
      { t: 'hideSprite', id: 'hero', ms: 0 },
      { t: 'background', bg: 'core' },
      { t: 'fade', to: 'clear', ms: 900 },
      { t: 'narrate', text: 'O verde se desfaz. O Core volta a brilhar em dourado, e a linguagem do reino volta a fazer sentido.' },
      { t: 'fade', to: 'black', ms: 600 },
    ],
  },

  epilogue: {
    id: 'epilogue',
    steps: [
      { t: 'background', bg: 'village' },
      { t: 'showSprite', id: 'hero', character: 'hero', x: 160, y: 142 },
      { t: 'showSprite', id: 'orwin', character: 'orwin', x: 90, y: 138 },
      { t: 'showSprite', id: 'garrick', character: 'garrick', x: 232, y: 138, flip: true },
      { t: 'showSprite', id: 'isolde', character: 'isolde', x: 284, y: 136, flip: true },
      { t: 'showSprite', id: 'elowen', character: 'elowen', x: 36, y: 136 },
      { t: 'fade', to: 'clear', ms: 800 },
      { t: 'anim', id: 'hero', anim: 'victory' },
      { t: 'say', speaker: 'orwin', text: 'Pois é. Você conseguiu. Eu nunca duvidei. Bom, duvidei uma vez. Duas, no máximo.' },
      { t: 'say', speaker: 'orwin', text: 'O reino vai precisar de gente que entende o Core. Gente que lê, testa e corrige.' },
      { t: 'say', speaker: 'orwin', text: 'Lá fora isso tem um nome, sabia? Programação. Dizem que é uma profissão e tanto.' },
      { t: 'say', speaker: 'garrick', text: 'Coroa nova por conta da casa! ...Brincadeira. Mas faço um desconto.' },
      { t: 'say', speaker: 'isolde', text: 'Seu quarto continua reservado, herói. Para sempre.' },
      { t: 'say', speaker: 'elowen', text: 'E amanhã tem desafio novo no quadro. Não vá se acomodar.' },
      { t: 'narrate', text: 'FIM... por enquanto. O Core agora fala a sua língua.' },
      { t: 'narrate', text: 'Obrigado por jogar DevCore! Continue treinando, suba no Pergaminho e desafie Torvan na arena.' },
      { t: 'setFlag', flag: 'game_complete', value: true },
      { t: 'fade', to: 'black', ms: 600 },
    ],
  },

  defeat_consolation: {
    id: 'defeat_consolation',
    steps: [
      { t: 'background', bg: 'archive' },
      { t: 'showSprite', id: 'orwin', character: 'orwin', x: 190, y: FLOOR },
      { t: 'showSprite', id: 'hero', character: 'hero', x: 110, y: FLOOR, anim: 'hurt' },
      { t: 'fade', to: 'clear', ms: 600 },
      { t: 'say', speaker: 'orwin', text: 'Ei. Calma. Respira. Toma um chá.' },
      { t: 'say', speaker: 'orwin', text: 'Errar faz parte. Um teste vermelho é só o Core dizendo "ainda não".' },
      { t: 'say', speaker: 'orwin', text: 'Nada do que você aprendeu se perdeu. Leia a mensagem de erro com carinho: ela quer te ajudar.' },
      { t: 'say', speaker: 'orwin', text: 'Treine mais um pouco comigo e volte. A muralha não vai fugir.' },
      { t: 'fade', to: 'black', ms: 400 },
    ],
  },
};

export function getCutscene(id: string): Cutscene {
  const c = CUTSCENES[id];
  if (!c) throw new Error(`Cutscene desconhecida: ${id}`);
  return c;
}
