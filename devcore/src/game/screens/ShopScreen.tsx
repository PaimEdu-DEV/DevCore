import { useState } from 'react';
import { COSMETICS, CATEGORY_LABEL, RARITY_LABEL, type Cosmetic, type CosmeticCategory } from '../data/cosmetics';
import { EARNED_TITLES } from '../state/progression';
import { game, useGame, type Route } from '../state/store';
import { spendCoins } from '../state/rewards';
import { audio } from '../audio/AudioManager';
import { assetUrl } from '../assets/sprites';
import { SpritePreview } from '../ui/SpritePreview';
import { NameTag } from '../ui/NameTag';
import { DialogBox } from '../ui/DialogBox';
import { isCancel, useKeys } from '../ui/hooks';
import type { SaveData } from '../state/save';
import './panels.css';
import './shop.css';

const CATS: CosmeticCategory[] = ['hat', 'aura', 'spell', 'nameFrame', 'title'];

const SLOT: Record<CosmeticCategory, keyof SaveData['cosmetics']['equipped']> = {
  hat: 'hat',
  aura: 'aura',
  spell: 'spell',
  nameFrame: 'nameFrame',
  title: 'title',
};

export function CosmeticPreview({ item, save }: { item: Cosmetic; save: SaveData }) {
  const base = { gender: save.player.gender, heroClass: save.player.heroClass };
  switch (item.category) {
    case 'hat':
      return <SpritePreview hero={{ ...base, hat: item.id }} scale={2} headroom={10} label={`Prévia: ${item.name}`} />;
    case 'aura':
      return <SpritePreview hero={{ ...base, aura: item.id }} scale={2} headroom={10} label={`Prévia: ${item.name}`} />;
    case 'spell':
      return (
        <span className="spell-swatch" aria-label={`Cores: ${item.name}`}>
          {item.colors.map((c, i) => (
            <span key={i} className={`spell-dot spell-${item.particle}`} style={{ background: c, animationDelay: `${i * 0.2}s` }} />
          ))}
        </span>
      );
    case 'nameFrame':
      return <NameTag name={save.player.name} frameId={item.id} size="sm" />;
    case 'title':
      return <span className="title-preview">« {item.text} »</span>;
  }
}

export function equip(item: Cosmetic | { id: string; category: 'title' }, on: boolean) {
  game.update((d) => {
    d.cosmetics.equipped[SLOT[item.category]] = on ? item.id : null;
  });
  audio.play(on ? 'confirm' : 'cancel');
}

/** Loja do Garrick. */
export function ShopScreen() {
  const save = useGame((s) => s.save);
  const [cat, setCat] = useState<CosmeticCategory>('hat');
  const [line, setLine] = useState('Tudo feito à mão, com o melhor aço que sobrou do reino. Bom, quase tudo.');
  useKeys((e, type) => {
    if (type === 'down' && isCancel(e) && e.key !== 'Backspace') game.navigate({ name: 'village' });
  });
  if (!save) return null;

  const buy = (item: Cosmetic) => {
    if (save.cosmetics.owned.includes(item.id)) return;
    if (!spendCoins(item.price)) {
      audio.play('error');
      setLine(`Faltam ${item.price - save.stats.coins} moedas para esse aí. Treine um pouco e volte, a bigorna não foge.`);
      return;
    }
    game.update((d) => void d.cosmetics.owned.push(item.id));
    equip(item, true);
    setLine(item.rarity === 'legendary' ? 'LENDÁRIO! Até a Entidade vai ficar com inveja.' : item.rarity === 'rare' ? 'Peça rara! Tem bom gosto, hein.' : 'Ótima escolha. Simples e honesta.');
    game.toast(`Comprou: ${item.name}`, 'reward');
  };

  return (
    <main className="screen panel-screen">
      <div className="panel-wrap frame-panel">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h1 className="panel-title">Forja do Garrick</h1>
          <span className="row" style={{ fontSize: 26 }}>
            <img src={assetUrl('assets/icons/coin.png')} alt="Moedas" className="icon px" /> {save.stats.coins}
          </span>
        </div>
        <div style={{ marginBottom: 16 }}>
          <DialogBox variant="panel" speaker="Garrick" portrait="assets/portraits/garrick.png" text={line} active={false} />
        </div>
        <div className="tabs" role="tablist" aria-label="Categorias">
          {CATS.map((c) => (
            <button key={c} role="tab" aria-selected={cat === c} onClick={() => setCat(c)}>
              {CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>
        <div className="card-grid" role="tabpanel">
          {COSMETICS.filter((c) => c.category === cat).map((item) => {
            const owned = save.cosmetics.owned.includes(item.id);
            const equipped = save.cosmetics.equipped[SLOT[item.category]] === item.id;
            return (
              <div key={item.id} className={`item-card shop-card ${equipped ? 'equipped' : ''}`}>
                <div className="shop-preview">
                  <CosmeticPreview item={item} save={save} />
                </div>
                <strong>{item.name}</strong>
                <span className={`badge rarity-${item.rarity}`}>{RARITY_LABEL[item.rarity]}</span>
                <span className="desc">{item.description}</span>
                <div className="row" style={{ marginTop: 'auto', justifyContent: 'space-between' }}>
                  {owned ? (
                    <>
                      <span className="muted">Comprado</span>
                      <button className={`btn small ${equipped ? '' : 'primary'}`} onClick={() => equip(item, !equipped)}>
                        {equipped ? 'Tirar' : 'Equipar'}
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="row">
                        <img src={assetUrl('assets/icons/coin.png')} alt="" className="icon sm px" /> {item.price}
                      </span>
                      <button className="btn small primary" onClick={() => buy(item)} disabled={save.stats.coins < item.price} aria-label={`Comprar ${item.name} por ${item.price} moedas`}>
                        Comprar
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="btn" onClick={() => game.navigate({ name: 'village' })}>Voltar à vila</button>
        </div>
      </div>
    </main>
  );
}

/** Cosméticos do jogador (menu): equipa e desequipa o que já tem. */
export function CosmeticsScreen({ back }: { back: Route }) {
  const save = useGame((s) => s.save);
  useKeys((e, type) => {
    if (type === 'down' && isCancel(e) && e.key !== 'Backspace') game.navigate(back);
  });
  if (!save) return null;
  const owned = COSMETICS.filter((c) => save.cosmetics.owned.includes(c.id));
  return (
    <main className="screen panel-screen">
      <div className="panel-wrap frame-panel">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h1 className="panel-title">Cosméticos</h1>
          <button className="btn small" onClick={() => game.navigate(back)}>Voltar</button>
        </div>
        <div className="row" style={{ gap: 20, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 12 }}>
          <SpritePreview hero={{ gender: save.player.gender, heroClass: save.player.heroClass, hat: save.cosmetics.equipped.hat, aura: save.cosmetics.equipped.aura }} scale={3} headroom={10} anim="victory" />
          <NameTag name={save.player.name} frameId={save.cosmetics.equipped.nameFrame} title={null} size="lg" />
        </div>
        {CATS.map((cat) => {
          const items = owned.filter((c) => c.category === cat);
          const earned = cat === 'title' ? save.titles.filter((t) => EARNED_TITLES[t]) : [];
          return (
            <section key={cat}>
              <h2 className="panel-sub">{CATEGORY_LABEL[cat]}</h2>
              {items.length === 0 && earned.length === 0 ? <p className="text-body muted">Nada ainda. O Garrick vende alguns na forja.</p> : null}
              <div className="card-grid">
                {items.map((item) => {
                  const equipped = save.cosmetics.equipped[SLOT[item.category]] === item.id;
                  return (
                    <button key={item.id} className={`item-card ${equipped ? 'equipped' : ''}`} onClick={() => equip(item, !equipped)} aria-pressed={equipped}>
                      <strong>{item.name}</strong>
                      <span className="desc">{equipped ? '✓ Equipado (clique para tirar)' : 'Clique para equipar'}</span>
                    </button>
                  );
                })}
                {earned.map((id) => {
                  const equipped = save.cosmetics.equipped.title === id;
                  return (
                    <button key={id} className={`item-card ${equipped ? 'equipped' : ''}`} onClick={() => equip({ id, category: 'title' }, !equipped)} aria-pressed={equipped}>
                      <strong>« {EARNED_TITLES[id]} »</strong>
                      <span className="desc">Conquistado · {equipped ? '✓ Equipado' : 'Clique para equipar'}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
