# Decisões de projeto

Registro das decisões tomadas sem consulta durante o desenvolvimento, com o motivo de cada uma.

## Jornada (modo feira)

O jogo vai rodar num estande de feira: quem passa precisa entender e jogar em poucos minutos.

- **O portão leva à Jornada, não à seleção de chefes.** É um caminho em rolagem lateral com quatro áreas (Estrada do Portão, Floresta Sombria, Ruínas de Cristal, O Núcleo). Em cada área há dois capangas ("bugs") e depois o chefe. Vencer o chefe libera a próxima área; perder ou fugir volta para a Jornada. O progresso fica em `save.journey`.
- **Desafios de uma linha.** Os capangas pedem uma única ideia: área 1 soma, área 2 if/else com número par, área 3 juntar textos, área 4 média e um if. As fases dos chefes foram reescritas no mesmo nível (dobro, subtração, esquiva com if, maior de dois, contar cópias, juntar textos, soma de três, corrigir negativos e um laço com uma linha a completar). O código inicial já traz a estrutura (o `if`, o `for`) e o jogador completa só o que falta. Ficam em `data/challenges/journey.ts`, com os mesmos ids de fase de antes. As lições do Orwin continuam no Treino.
- **Bugs sem perda de vida.** Errar contra um capanga só mostra o esperado e o recebido; as dicas são grátis. A tensão fica para os chefes.
- **Sem cutscene antes do chefe na Jornada.** Vai direto para a luta, para não travar a fila do estande.
- **Cenários desenhados por código.** Não havia arte de cenário nos originais, então `journey/scenery.ts` gera em pixel art as camadas de parallax (céu, fundo, meio, chão, primeiro plano) com uma paleta por área, e os bugs. Sem imagens novas para baixar.
- **Câmera mais aberta.** A vila passou de 320x180 para 448x252 e a Jornada usa 448x252, com escala fracionária para ocupar a tela. Assim os personagens ficam menores e aparece mais cenário. As batalhas continuam em 320x180.
- **Teclas de código.** Acima de todo editor há uma barra com os parâmetros da função, operadores, números, `true`/`false`, parênteses e apagar. No celular dá para resolver os desafios sem abrir o teclado do aparelho. Os botões ◀ ▶ de andar aparecem em telas de toque ou estreitas.

## Estrutura e deploy

- **App em `devcore/`, `vercel.json` dentro de `devcore/`.** O projeto no Vercel foi criado com *Root Directory* = `devcore` (preset Vite, Node 24), então o build já roda dentro dessa pasta; o antigo `vercel.json` da raiz fazia `cd devcore` e quebrava todos os deploys. Agora o `devcore/vercel.json` instala, compila, publica `dist` e faz o rewrite de SPA.
- **TypeScript 7 (`tsc` nativo).** Era a versão estável no momento; `npm run typecheck` e `npm run build` passam com ele.
- **Originais dos sprites copiados para `art/source/` com nomes legíveis.** O script de processamento lê dali (ou de `SPRITES_SRC`). Assim o processo é reproduzível em qualquer máquina, e a pasta Downloads nunca é usada em runtime.

## Sprites

- **Identificação pelo conteúdo** (os nomes dos arquivos eram aleatórios):
  - `Gemini_..._rto74...` = Alquimista masculino; `..._n1wxj...` = Alquimista feminina (4x4).
  - `..._cf5f9...` = Orwin; `..._ke22...` = Garrick; `..._944ce...` = Maren; `..._ad020...` = Isolde; `..._n7s1...` = Torvan; `..._e13t4...` = Elowen (4x2).
  - `AldrickGeneral.png`, `Veyr.png`, `Seraphine.jpg` e `Entidade.jpg` são os vilões (4x3).
- **Não existem folhas do Mago (JavaScript).** Os Magos masculino e feminino são gerados recolorindo as folhas do Alquimista: o casaco marrom vira azul-marinho e os frascos teal viram âmbar. Um chapéu de mago é desenhado em tempo de execução na âncora da cabeça. Estão marcados como placeholder no manifest e em `docs/ASSETS.md`.
- **Reamostragem.** As folhas são JPEG com artefatos e grade de pixel não inteira. Cada pixel de destino olha o bloco de origem correspondente, decide transparência por maioria e pega a **mediana** das cores do miolo do bloco. É um "vizinho mais próximo" robusto: não mistura cores entre pixels de arte e remove o ruído do JPEG. Depois, duas passadas de *despill* removem a franja magenta das bordas.
- **Linhas de grade** desenhadas pela IA (inclusive as que cortam a folha da Entidade no meio de uma célula) são detectadas por linhas e colunas quase totalmente sem magenta e repintadas com os vizinhos.
- **Alinhamento.** Pés na penúltima linha do quadro. O centro horizontal é a mediana das colunas do corpo (pernas e tronco, mesclada com o corpo todo), para que armas e efeitos não desloquem o personagem.
- **Tamanhos de quadro:** heróis e NPCs 48x48, vilões 96x96. A Entidade ficou com **128x128** em vez de 160, porque 160 ocuparia quase toda a altura da tela de 180 px e não sobraria espaço para HUD e texto.
- **Vila com tiles de 24 px e personagens de 48 px** (em vez de tiles de 16 px). As folhas dos NPCs incluem objetos de cena (bigorna, quadro de avisos, pergaminho), e reduzir para 32 px deixava tudo ilegível. Com 24 px por tile, a proporção personagem/tile fica parecida com a do Pokémon de GBA.
- **Heróis têm só a vista lateral.** Na vila, andar para cima e para baixo usa a animação lateral, virada para o último lado horizontal.
- **Vilões olham para a direita nas folhas originais** e são espelhados na batalha (ficam à direita, olhando para a esquerda).

## Interface

- **Texto da interface** em VT323 (pixel legível), títulos em Press Start 2P e editor/enunciado/terminal em JetBrains Mono. Os textos ficam no DOM, sobre o canvas, para continuarem nítidos em qualquer escala.
- **Números de dano e rótulos curtos dentro do canvas** usam uma fonte bitmap 3x5 própria (`src/game/engine/pixelFont.ts`).
- **Palco 320x180 com escala inteira.** Quando nem 1x cabe, a escala vira fracionária, só para não cortar a tela. A camada DOM por cima usa `var(--px)` para medir em "pixels virtuais".
- **Ligaduras desligadas** no editor e nos enunciados: a JetBrains Mono transforma `!=` em `≠`, o que confunde quem nunca programou.
- **Caixa de diálogo**: Enter/Espaço/clique completa o texto; segurar acelera; um novo toque avança. Segurar não pula falas, para ninguém perder diálogo sem querer.
- **Cutscenes podem ser puladas** (Esc ou botão "Pular"). Ao pular, os passos sem efeito visual (`setFlag`, `giveItem`, `startBattle`) ainda são executados.
- **A apresentação de cada vilão** toca só na primeira vez. Nas revanches, a luta abre direto na tela de versus.

## Motor de execução

- **JavaScript**: `new Function` com `"use strict"` dentro de um Web Worker de módulo. `fetch`, `XMLHttpRequest`, `importScripts`, `WebSocket` e afins são removidos do escopo global do worker e também sombreados como parâmetros da função. O timeout é de 2,5 s, com `terminate()`, e o próximo run cria um worker novo.
- **Linha do erro em JS**: erros de sintaxe são localizados pelo parser `acorn`, porque o V8 não informa a linha em `new Function`. Erros em tempo de execução usam a pilha (`<anonymous>:L:C`) menos o deslocamento do cabeçalho, medido na inicialização.
- **Python**: Pyodide v314.0.7 pelo CDN jsDelivr, importado dinamicamente (`pyodide.mjs`) dentro de um worker de módulo. O download começa assim que o jogador escolhe Alquimista. O timeout é de 5 s: o Pyodide não pode ser interrompido sem `SharedArrayBuffer` (que exigiria cabeçalhos COOP/COEP), então o worker é encerrado e recriado em segundo plano.
- **`input()`** foi substituído por uma função que explica que os valores chegam pelos parâmetros.
- **Comparação**: igualdade profunda de valores JSON, com tolerância de 1e-9 em números. `undefined` é preservado para o Orwin detectar "faltou o return".
- **Testes ocultos** aparecem como "teste oculto #N", só com ✓/✗, sem esperado nem recebido.
- **Soluções de referência** ficam em `solutions.ts`, que o jogo não importa. O Vitest valida todas em JS e o Playwright, todas em Python (Pyodide real).

## Regras de jogo

- **Dicas** custam 5, 10 e 15 moedas (níveis 1, 2 e 3). O jogador começa com 50 moedas, e lições, missões e o bônus diário rendem mais.
- **Lições**: recompensa cheia na primeira conclusão, +20% de XP sem dicas e sem erros, e 25% ao refazer.
- **Dano na batalha**: cada fase do chefe vale 100 PV (a Entidade tem 3 fases). Código certo tira o resto da fase; sem dicas e sem erros, o golpe é **crítico** (número maior, flash e bônus de XP). Código parcialmente certo causa dano parcial, proporcional aos testes aprovados e limitado para não encerrar a fase. Depois disso vem sempre o contra-ataque.
- **Contra-ataque**: 12 + 4 por fase (+4 da Entidade; +4 do Aldric em postura de ataque). Veyr distribui o mesmo dano em 3, 5 ou 8 golpes. O herói tem 100 PV; se zerar, aparece o consolo do Orwin e o jogador volta à vila sem perder nada.
- **Mecânicas temáticas**: Aldric alterna DEFESA/ATAQUE a cada execução (na defesa, o dano parcial cai pela metade); as cópias de Seraphine diminuem conforme o dano; a Entidade combina tudo. Os testes de cada fase usam os mesmos conceitos (postura, sequência 3/5/8, recursão, try/except).
- **Ordem dos chefes é obrigatória**; o treino é recomendado. Sem as lições concluídas, o Orwin avisa e oferece "Lutar mesmo assim".
- **Revanches** dão 30% da recompensa. A pontuação da luta (`bestScore`) desconta dicas, erros e vida perdida.
- **Salvamento automático**: o save é gravado a cada mudança de progresso (lição, luta, compra), para ninguém perder progresso ao fechar a aba. A Isolde e o menu continuam com "Salvar", que também grava a posição na vila e sincroniza o ranking.
- **Desafio diário** escolhido por hash da data local (AAAA-MM-DD) no pool de 10 extras. Não há sequência de dias (streak) nem punição por faltar.
- **Relâmpago**: 150 segundos, 100 pontos por desafio resolvido e +30 se for de primeira; dá para pular desafios.

## Ranking e backend

- **Interface única `BackendService`**, com `LocalBackend` (padrão) e `FirebaseBackend`. O Firebase só é importado (import dinâmico) quando as variáveis `VITE_FIREBASE_*` existem. Qualquer falha volta para o modo local.
- **Perfil público** em `players/{uid}` (nome, classe, XP, nível, recorde do Relâmpago, chefes vencidos, título). O ranking por classe usa índice composto `heroClass + xp`.
- **Sem backend**, o Pergaminho mostra só o registro local, com o aviso "Ranking online em breve". Os dados fictícios só aparecem com `VITE_DEMO_RANKING=true` e são rotulados como "exemplo".

### Limitação conhecida: a pontuação é calculada no cliente

Todo o cálculo de XP, dano e recordes acontece no navegador. As regras do Firestore impedem escrever no documento de outra pessoa, diminuir valores e saltos maiores que +1500 XP ou +3000 pontos de Relâmpago por escrita, mas não impedem um jogador técnico de forjar pontuações dentro desses limites (ou de ler as soluções no bundle).

**Plano de evolução:**

1. Uma Cloud Function `submitRun({ challengeId, language, code })` roda os testes (incluindo os ocultos, que saem do bundle do cliente) num sandbox: Pyodide no Node para Python e `isolated-vm` para JS.
2. Só a função grava XP, moedas do ranking e recordes, via Admin SDK; as regras passam a negar escrita do cliente nesses campos.
3. Limite de taxa por `uid` e App Check para dificultar automação.
4. Em seguida, o duelo 1x1 usa a mesma função como juiz.

## Áudio

- **Efeitos sintetizados com Web Audio** (osciladores e ruído): blip de texto, seleção, confirmação, acerto, erro, dano, vitória, level-up, moeda e passos. O áudio é destravado no primeiro gesto do usuário. A trilha musical é só um gancho (`playMusic`), ainda sem música.

## Processo

- **Fases 3 e 4 no mesmo commit.** O executor Python ficou pronto junto com o editor e os desafios, e testar o editor sem as duas linguagens não fazia sentido. As fases 5 e 6 também foram juntas, porque o portão da vila leva direto à batalha.
