# Ativando o ranking online (Firebase)

O DevCore funciona 100% offline: sem configuração, o Pergaminho mostra só o seu registro local, com o aviso "Ranking online em breve". Quando você criar um projeto Firebase e configurar as variáveis abaixo, o jogo passa a usar o Firebase **automaticamente**, sem mudar nenhuma linha de código.

O que o jogo usa:

- **Authentication**, com login **anônimo** (o jogador não precisa de conta);
- **Cloud Firestore**, com a coleção `players` (um documento por jogador).

## 1. Criar o projeto

1. Acesse <https://console.firebase.google.com> e clique em **Adicionar projeto**.
2. Dê um nome (ex.: `devcore`). O Google Analytics é opcional; pode desativar.
3. Aguarde a criação e abra o projeto.

## 2. Registrar o app web

1. Na página inicial do projeto, clique no ícone **Web** (`</>`).
2. Dê um apelido (ex.: `devcore-web`). **Não** precisa marcar o Firebase Hosting, porque o deploy é no Vercel.
3. O console mostra um objeto `firebaseConfig`. Guarde os valores de `apiKey`, `authDomain`, `projectId`, `appId`, `storageBucket` e `messagingSenderId`.

> A `apiKey` do Firebase Web não é secreta: ela identifica o projeto, e quem protege os dados são as regras do Firestore. Mesmo assim, mantenha os valores em `.env.local` e nas variáveis do Vercel, não no código.

## 3. Ativar o login anônimo

1. Menu **Build → Authentication → Começar**.
2. Aba **Sign-in method** → **Anônimo** → **Ativar** → **Salvar**.
3. Em **Settings → Authorized domains**, adicione o domínio do Vercel (ex.: `devcore.vercel.app`). `localhost` já vem autorizado.

## 4. Criar o Firestore

1. Menu **Build → Firestore Database → Criar banco de dados**.
2. Escolha uma região próxima (ex.: `southamerica-east1`, São Paulo).
3. Comece no **modo de produção**. As regras do projeto, que você publica no passo 5, liberam só o necessário.

## 5. Publicar as regras e os índices

**Opção A, pelo console (mais simples):**

1. Firestore → aba **Regras** → cole o conteúdo de `devcore/firestore.rules` → **Publicar**.
2. Firestore → aba **Índices** → **Criar índice**, um para cada entrada de `devcore/firestore.indexes.json`:
   - coleção `players`: `heroClass` crescente + `xp` decrescente;
   - coleção `players`: `heroClass` crescente + `xp` crescente.

   Se você esquecer um índice, o console do navegador mostra um link pronto para criá-lo na primeira consulta.

**Opção B, pela linha de comando:**

```bash
npm install -g firebase-tools
firebase login
cd devcore
firebase use --add            # escolha o projeto criado
firebase deploy --only firestore:rules,firestore:indexes
```

## 6. Configurar as variáveis

**Localmente:** copie `devcore/.env.example` para `devcore/.env.local` e preencha:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_APP_ID=1:123...:web:abc...
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123...
```

Rode `npm run dev`, jogue uma lição e abra o Pergaminho: o aviso "Ranking online em breve" some e o documento aparece no Firestore, em `players/{uid}`.

**No Vercel:** Project → **Settings → Environment Variables** → adicione as mesmas variáveis (Production e Preview) → faça um novo deploy (Deployments → ⋯ → **Redeploy**).

## 7. Conferir

- Abra o jogo, conclua uma lição e fale com a Maren: ela anuncia sua posição.
- No console do Firestore, a coleção `players` deve ter um documento com `name`, `heroClass`, `xp`, `level`, `lightning`, `bossesDefeated`, `title` e `updatedAt`.
- Se algo falhar, o jogo volta sozinho para o ranking local e escreve um aviso no console do navegador (`[DevCore] Firebase indisponível...`).

## Modelo de dados

`players/{uid}`, em que `uid` é o id do login anônimo:

| Campo | Tipo | Regra |
|---|---|---|
| uid | string | igual ao `uid` autenticado |
| name | string | de 2 a 16 caracteres |
| heroClass | string | `alchemist` ou `mage` |
| xp | int | só cresce; no máximo +1500 por escrita |
| level | int | de 1 a 1000 |
| lightning | int | só cresce; no máximo +3000 por escrita |
| bossesDefeated | int | de 0 a 4; só cresce |
| title | string ou null | até 40 caracteres |
| updatedAt | timestamp | hora do servidor (`request.time`) |

## Segurança: limitação conhecida

A pontuação é calculada no navegador. As regras impedem escrever no documento de outra pessoa, diminuir o XP e saltos absurdos, mas um jogador técnico ainda consegue inflar a própria pontuação dentro desses limites. O plano de evolução, com revalidação das soluções numa Cloud Function, está em `docs/DECISIONS.md`.

## Modo demonstração

Para apresentações sem Firebase, defina `VITE_DEMO_RANKING=true`. O Pergaminho mostra alguns registros **fictícios**, rotulados como "exemplo".
