# DevCore

RPG medieval em pixel art em que você aprende a programar em **Python** ou **JavaScript** derrotando vilões com código de verdade.

Projeto de Engenharia de Software, feito para atrair pessoas para a área de tecnologia. Tudo roda no navegador: não há backend obrigatório.

## Como rodar

Requisitos: Node 20+ (testado com Node 22).

```bash
cd devcore
npm install
npm run dev          # http://localhost:5173
```

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | typecheck + build de produção em `dist/` |
| `npm run typecheck` | só o TypeScript (strict) |
| `npm test` | testes unitários (Vitest): avaliador, normalizador, tradutor de erros, save, ranking e as soluções de todos os desafios em JS |
| `npm run e2e` | testes de ponta a ponta (Playwright) com screenshots; usa o Edge instalado (`PW_CHANNEL=chromium` para usar o Chromium do Playwright) |
| `npm run sprites` | reprocessa as folhas de sprite de `art/source/` |
| `npm run assets` | regenera os assets procedurais e o `docs/ASSETS.md` |

Atalhos úteis no navegador:

- `/debug/sprites`: toca todas as animações de todos os personagens (com âncoras, espelhamento e cosméticos);
- `/?licao=aldric-l1`: abre direto uma lição; `/?batalha=aldric` abre uma luta; `/?rota=vila` abre a vila. Os três precisam de um save existente.

## Como jogar

1. **Novo Jogo**: o Orwin apresenta o reino; você escolhe nome, gênero e classe (**Alquimista = Python**, **Mago = JavaScript**).
2. **Vila**: ande com setas/WASD (ou clique/toque no chão, ou use o D-pad no celular). Fale com Enter/Espaço/clique. O menu abre no Esc.
3. **Orwin** dá o treino (lições por conceito), o tutorial e dicas. **Garrick** vende cosméticos. **Maren** mostra o Pergaminho (ranking). **Isolde** salva, mostra o perfil e dá um bônus diário. **Torvan** comanda o Desafio Relâmpago. **Elowen** tem o desafio diário e as missões.
4. **Portão do Reino** (norte da vila): lute contra Aldric → Veyr → Seraphine → A Entidade. Código correto vira dano; erro gera contra-ataque. Se seu herói cair, o Orwin te consola e você volta à vila sem perder nada.

## Estrutura

```
devcore/
├─ art/source/              originais dos sprites (só leitura; nunca usados em runtime)
├─ scripts/                 process-sprites.mjs, generate-assets.mjs e ferramentas de conferência
├─ public/assets/           PNGs servidos (sprites, retratos, tiles, fundos, UI, ícones, efeitos, cosméticos)
├─ src/
│  ├─ App.tsx               roteamento entre telas
│  ├─ debug/                página /debug/sprites
│  ├─ ide/                  editor (CodeMirror 6, tema Dark+), painel de IDE, enunciado
│  ├─ runner/               motor de execução: JS em worker, Python (Pyodide) em worker, comparação, tradutor de erros
│  ├─ services/backend/     BackendService: LocalBackend (padrão) e FirebaseBackend (import dinâmico)
│  └─ game/
│     ├─ assets/            sprite-manifest.json, tileset.json, carregamento de imagens
│     ├─ engine/            palco 320x180, desenho de personagens, efeitos, fonte bitmap
│     ├─ cutscenes/         motor de cutscene + roteiros (scripts.ts)
│     ├─ data/              desafios, cosméticos, personagens, missões, filtro de nomes
│     ├─ battle/            falas de batalha
│     ├─ village/           mapa da vila e conversas dos NPCs
│     ├─ state/             save (versão e migração), store, progressão, recompensas
│     ├─ audio/             AudioManager (Web Audio, sem arquivos)
│     ├─ screens/           todas as telas
│     └─ ui/                caixa de diálogo, menus, prévias
├─ e2e/                     testes Playwright
├─ docs/                    ASSETS.md, DECISIONS.md, BACKLOG.md, FIREBASE_SETUP.md
├─ firestore.rules, firestore.indexes.json, firebase.json, .env.example
```

## Como adicionar...

### Um desafio

1. Abra o arquivo do vilão em `src/game/data/challenges/` (ou `extras.ts` para o diário e o Relâmpago).
2. Adicione um objeto `Challenge`: `id`, `concept`, `villain`, `kind` (`lesson`, `boss` com `phase`, ou `extra`), `title`, `statement`, `starter` e `functionName` por linguagem, `tests` (com `hidden: true` nos ocultos), três `hints`, `mentor` e `xp`/`coins`.
   - Textos podem ser iguais nas duas linguagens ou `{ python: '...', javascript: '...' }`.
   - Use `{fn}` para o nome da função e `{True}`/`{False}`/`{None}`, que viram a sintaxe de cada linguagem.
3. Coloque a solução de referência em `solutions.ts`. O `npm test` garante que ela passa em JS e que o código inicial **não** passa; o `npm run e2e` (content.spec) roda a versão Python no Pyodide.

### Uma cutscene

1. Em `src/game/cutscenes/scripts.ts`, adicione uma entrada em `CUTSCENES` com uma lista de passos (`say`, `narrate`, `background`, `showSprite`, `hideSprite`, `anim`, `move`, `fade`, `flash`, `shake`, `wait`, `choice`, `label`, `goto`, `ifFlag`, `setFlag`, `giveItem`, `startBattle`).
2. Toque com `game.navigate({ name: 'cutscene', id: 'minha_cena', next: { name: 'village' } })`.
3. Textos aceitam `{nome}`, `{classe}` e `{linguagem}`.

### Um cosmético

1. Adicione o item em `src/game/data/cosmetics.ts` (categoria, preço, raridade).
2. Chapéus e auras usam um PNG em `public/assets/cosmetics/`; molduras de nome, um 9-slice 24x24 em `public/assets/ui/`. Efeitos de magia são só cores e tipo de partícula; títulos são só texto.
3. Para chapéus, ajuste `anchorY` (quantos px abaixo do topo da cabeça a base do chapéu encosta) e confira em `/debug/sprites`.

### Um sprite

1. Coloque a folha (fundo magenta `#FF00FF`) em `art/source/` e registre em `CHARACTERS` no `scripts/process-sprites.mjs` (layout `villain` 4x3, `hero` 4x4 ou `npc` 4x2, e o tamanho do quadro).
2. Rode `npm run sprites`. O script gera `public/assets/sprites/<id>.png`, o retrato e as entradas do `sprite-manifest.json` (animações, fps, âncora dos pés e da cabeça).
3. Confira em `/debug/sprites`. Para trocar só a arte de um PNG existente, substitua o arquivo mantendo o tamanho; nenhum código muda (ver `docs/ASSETS.md`).

## Ranking online (Firebase)

Desativado por padrão. Para ativar, siga `docs/FIREBASE_SETUP.md`: crie o projeto, ative o login anônimo e o Firestore, publique `firestore.rules` e `firestore.indexes.json` e preencha as variáveis `VITE_FIREBASE_*` (há um modelo em `.env.example`). Com as variáveis presentes, o jogo troca sozinho do `LocalBackend` para o `FirebaseBackend`.

## Deploy no Vercel

O `vercel.json` fica em **`devcore/`**: instala, compila, publica `dist` e faz o rewrite de SPA (rotas como `/debug/sprites` funcionam).

1. No Vercel: **Add New → Project** → importe o repositório.
2. Defina o **Root Directory** como `devcore`. *Framework Preset*: Vite. Node.js 24.x.
3. (Opcional) Adicione as variáveis `VITE_FIREBASE_*` em Settings → Environment Variables.
4. Deploy. Cada push na `main` publica sozinho.

O Python (Pyodide) é baixado do CDN jsDelivr na primeira vez que um Alquimista abre o editor (~10 MB, depois fica em cache).

## Documentos

- `docs/ASSETS.md`: todo asset gerado (placeholders procedurais para trocar por arte feita à mão).
- `docs/DECISIONS.md`: decisões tomadas e limitações conhecidas.
- `docs/BACKLOG.md`: o que ficou de fora.
- `docs/FIREBASE_SETUP.md`: passo a passo do Firebase.
