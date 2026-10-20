# Assets do DevCore

Este arquivo é gerado por `npm run assets` (scripts/generate-assets.mjs). Não edite à mão.

## Como trocar um asset

- **PNG procedural**: substitua o arquivo em `public/assets/...` mantendo o mesmo nome e as mesmas dimensões. Nada no código muda.
- **Sprite de personagem**: coloque a folha nova em `art/source/` e rode `npm run sprites`, ou edite direto o PNG em `public/assets/sprites/` e ajuste `src/game/assets/sprite-manifest.json` (quadros, fps, âncoras dos pés e da cabeça).
- **Tileset**: a ordem dos tiles está em `src/game/assets/tileset.json`; mantenha a grade de 24x24.

## Sprites de personagens (processados de art/source)

| Personagem | Arquivo | Quadro | Animações | Origem |
|---|---|---|---|---|
| aldric | public/assets/sprites/aldric.png | 96x96 | idle, attack, hurt, defeat | arte original fatiada por scripts/process-sprites.mjs |
| veyr | public/assets/sprites/veyr.png | 96x96 | idle, attack, hurt, defeat | arte original fatiada por scripts/process-sprites.mjs |
| seraphine | public/assets/sprites/seraphine.png | 96x96 | idle, attack, hurt, defeat | arte original fatiada por scripts/process-sprites.mjs |
| entity | public/assets/sprites/entity.png | 128x128 | idle, attack, hurt, defeat | arte original fatiada por scripts/process-sprites.mjs |
| hero_alchemist_m | public/assets/sprites/hero_alchemist_m.png | 48x48 | idle, walk, attack, hurt, victory | arte original fatiada por scripts/process-sprites.mjs |
| hero_alchemist_f | public/assets/sprites/hero_alchemist_f.png | 48x48 | idle, walk, attack, hurt, victory | arte original fatiada por scripts/process-sprites.mjs |
| hero_mage_m | public/assets/sprites/hero_mage_m.png | 48x48 | idle, walk, attack, hurt, victory | **placeholder procedural, substituir por arte feita à mão** (Recolorido a partir do Alquimista; chapéu de mago desenhado em tempo de execução) |
| hero_mage_f | public/assets/sprites/hero_mage_f.png | 48x48 | idle, walk, attack, hurt, victory | **placeholder procedural, substituir por arte feita à mão** (Recolorido a partir da Alquimista; chapéu de mago desenhado em tempo de execução) |
| orwin | public/assets/sprites/orwin.png | 48x48 | idle, talk | arte original fatiada por scripts/process-sprites.mjs |
| garrick | public/assets/sprites/garrick.png | 48x48 | idle, talk | arte original fatiada por scripts/process-sprites.mjs |
| maren | public/assets/sprites/maren.png | 48x48 | idle, talk | arte original fatiada por scripts/process-sprites.mjs |
| isolde | public/assets/sprites/isolde.png | 48x48 | idle, talk | arte original fatiada por scripts/process-sprites.mjs |
| torvan | public/assets/sprites/torvan.png | 48x48 | idle, talk | arte original fatiada por scripts/process-sprites.mjs |
| elowen | public/assets/sprites/elowen.png | 48x48 | idle, talk | arte original fatiada por scripts/process-sprites.mjs |

Retratos de diálogo (48x48) em `public/assets/portraits/`, recortados do primeiro quadro idle de cada folha.

## Assets gerados proceduralmente

| Arquivo | Descrição | Status |
|---|---|---|
| public/assets/tiles/village.png | Tileset da vila 24x24 (grass, grass2, flowers, path, water, water2, tree, bush, fence, roof, eave, wall, window, door, stonewall, gate, bridge, sign, well, plaza, crate, lamp, gatetop, pathgrass) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/backgrounds/battle_aldric.png | Fundo de batalha de Aldric (salão da guarda corrompido) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/backgrounds/battle_veyr.png | Fundo de batalha de Veyr (telhados à noite) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/backgrounds/battle_seraphine.png | Fundo de batalha de Seraphine (biblioteca proibida) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/backgrounds/battle_entity.png | Fundo de batalha da Entidade (o vazio do Core) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/backgrounds/scene_kingdom.png | Cena: o reino e o castelo corrompido | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/backgrounds/scene_core.png | Cena: o Core, coração do reino | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/backgrounds/scene_archive.png | Cena: o Arquivo de Orwin (interior aconchegante) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/backgrounds/scene_village.png | Cena: a vila ao entardecer | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/backgrounds/title.png | Fundo da tela de título | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/ui/frame_dialog.png | Moldura 9-slice da caixa de diálogo (24x24, borda 8px) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/ui/frame_panel.png | Moldura 9-slice de painel escuro (24x24, borda 8px) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/ui/frame_parchment.png | Corpo 9-slice do pergaminho (ranking) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/ui/scroll_roll.png | Rolo do pergaminho (topo/base) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/ui/arrow_down.png | Seta ▼ da caixa de diálogo | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/ui/cursor.png | Cursor ► dos menus | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/ui/frame_wood.png | Moldura de nome (cosmético) frame_wood | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/ui/frame_silver.png | Moldura de nome (cosmético) frame_silver | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/ui/frame_gold.png | Moldura de nome (cosmético) frame_gold | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/ui/frame_ember.png | Moldura de nome (cosmético) frame_ember | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/ui/frame_star.png | Moldura de nome (cosmético) frame_star | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/ui/logo.png | Logo "DevCore" em pixel | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/icons/coin.png | Ícone coin (16x16) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/icons/heart.png | Ícone heart (16x16) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/icons/xp.png | Ícone xp (16x16) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/icons/scroll.png | Ícone scroll (16x16) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/icons/sword.png | Ícone sword (16x16) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/icons/shield.png | Ícone shield (16x16) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/icons/flask.png | Ícone flask (16x16) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/icons/bolt.png | Ícone bolt (16x16) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/icons/lock.png | Ícone lock (16x16) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/icons/check.png | Ícone check (16x16) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/icons/cross.png | Ícone cross (16x16) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/icons/medal_gold.png | Ícone medal_gold (16x16) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/icons/medal_silver.png | Ícone medal_silver (16x16) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/icons/medal_bronze.png | Ícone medal_bronze (16x16) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/icons/star.png | Ícone star (16x16) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/icons/chest.png | Ícone chest (16x16) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/icons/daily.png | Ícone daily (16x16) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/fx/impact.png | Efeito de impacto (4 quadros 32x32) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/fx/magic_python.png | Magia do Alquimista (Python): orbes teal e dourado (4 quadros) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/fx/magic_js.png | Magia do Mago (JavaScript): raios âmbar (4 quadros) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/fx/corruption.png | Partículas de corrupção verde-limão dos vilões (4 quadros) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/fx/heal.png | Brilho de cura/vitória dourado (4 quadros) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/cosmetics/hat_mage.png | Cosmético de cabeça hat_mage (âncora: centro-inferior na cabeça) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/cosmetics/hat_feather.png | Cosmético de cabeça hat_feather (âncora: centro-inferior na cabeça) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/cosmetics/hat_hood.png | Cosmético de cabeça hat_hood (âncora: centro-inferior na cabeça) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/cosmetics/hat_crown.png | Cosmético de cabeça hat_crown (âncora: centro-inferior na cabeça) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/cosmetics/hat_glasses.png | Cosmético de cabeça hat_glasses (âncora: centro-inferior na cabeça) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/cosmetics/hat_laurel.png | Cosmético de cabeça hat_laurel (âncora: centro-inferior na cabeça) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/cosmetics/aura_ember.png | Aura aura_ember (64x64, desenhada atrás do herói) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/cosmetics/aura_starlight.png | Aura aura_starlight (64x64, desenhada atrás do herói) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/cosmetics/aura_golden.png | Aura aura_golden (64x64, desenhada atrás do herói) | **placeholder procedural, substituir por arte feita à mão** |
| public/assets/cosmetics/aura_tide.png | Aura aura_tide (64x64, desenhada atrás do herói) | **placeholder procedural, substituir por arte feita à mão** |
