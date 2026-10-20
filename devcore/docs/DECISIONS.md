# Decisões de projeto

Registro das decisões tomadas sem consulta durante o desenvolvimento, com o motivo de cada uma.

## Estrutura e deploy

- **App em `devcore/`, `vercel.json` na raiz do repositório.** O `vercel.json` da raiz instala e compila dentro de `devcore/` e publica `devcore/dist`. No Vercel, o *Root Directory* deve continuar na raiz do repositório.
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
