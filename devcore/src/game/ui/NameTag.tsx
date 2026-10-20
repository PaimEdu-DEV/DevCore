import { assetUrl } from '../assets/sprites';
import { getCosmetic } from '../data/cosmetics';

/** Nome do jogador dentro da moldura de nome equipada (cosmético de UI). */
export function NameTag({ name, frameId, title, size = 'md' }: { name: string; frameId: string | null | undefined; title?: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const frame = getCosmetic(frameId);
  const style: React.CSSProperties =
    frame && frame.category === 'nameFrame'
      ? { borderImage: `url('${assetUrl(frame.image)}') 8 fill / 1 stretch`, color: frame.textColor }
      : {};
  return (
    <span className={`name-tag name-tag-${size} ${frame ? 'framed' : ''}`} style={style}>
      <span className="name-tag-name">{name}</span>
      {title ? <span className="name-tag-title">{title}</span> : null}
    </span>
  );
}
