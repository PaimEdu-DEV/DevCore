# Backlog: o que ficou de fora

Ordenado mais ou menos por impacto.

## Online e segurança

- **Duelo 1x1 online.** A interface `DuelService` existe (`src/services/backend`) e o Torvan já anuncia "Em breve". Falta matchmaking (Firestore ou Realtime Database), a sala com o mesmo desafio para os dois jogadores, o placar ao vivo e a revanche.
- **Anti-trapaça.** Hoje a pontuação é calculada no cliente. Plano: uma Cloud Function `submitRun` recebe o código, roda os testes ocultos num sandbox (Pyodide/Node com `vm` isolado ou um serviço como Judge0) e só ela grava XP e recordes. As regras do Firestore passam a negar escrita direta em `xp`/`lightning`. Ver `DECISIONS.md`.
- **Conta permanente.** Vincular o login anônimo a Google/e-mail (`linkWithCredential`) para manter o progresso entre aparelhos.
- **Save na nuvem.** Hoje o save fica no localStorage, com exportação e importação em JSON. Sincronizar o save completo no Firestore depois que houver conta permanente.

## Conteúdo

- Mais desafios por conceito (listas, dicionários, strings, orientação a objetos) e uma segunda temporada de vilões.
- Desafios com `print`/stdout avaliado, além do retorno da função.
- Modo "explicar o erro": o Orwin mostra a linha do traceback e pede que o jogador encontre o problema.
- Tradução do jogo para outros idiomas (os textos já estão concentrados em `data/`, `cutscenes/` e `village/`).

## Arte e som

- Trocar todos os placeholders procedurais por arte feita à mão (lista completa em `ASSETS.md`).
- Folhas próprias do Mago (hoje é um recolor do Alquimista com chapéu).
- Vistas de frente e de costas dos heróis para andar na vila (hoje só existe a lateral).
- Retratos maiores e com expressões (feliz, bravo, surpreso).
- **Música.** O `AudioManager.playMusic()` já existe como gancho, mas não toca nada. Faltam trilhas para título, vila, batalha e Entidade, com crossfade.

## Experiência

- Tutorial interativo na primeira lição (setas apontando para Executar, Testes, Terminal).
- Interiores das casas (arquivo do Orwin, forja, estalagem).
- Conquistas visuais (álbum) e mais títulos.
- PWA (instalar no celular, funcionar offline depois da primeira visita, com Pyodide em cache).
- Interromper o Python sem recriar o worker (exige `SharedArrayBuffer`, ou seja, cabeçalhos COOP/COEP no Vercel).
- Acessibilidade: leitor de tela narrando a batalha com mais detalhe e modo de alto contraste.

## Engenharia

- Separar o CodeMirror em um chunk menor (hoje ~560 kB, carregado só nas telas com editor).
- CI no GitHub Actions rodando `typecheck`, `test` e `e2e` em cada PR.
- Testes de regressão visual com as screenshots do Playwright.
