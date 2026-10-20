import manifestJson from './sprite-manifest.json';

export interface Point {
  x: number;
  y: number;
}

export interface AnimationDef {
  row: number;
  frames: number;
  fps: number;
  loop: boolean;
  /** Topo da cabeça em cada quadro (âncora dos cosméticos de cabeça). */
  head: Point[];
}

export interface CharacterSprite {
  id: string;
  kind: 'villain' | 'hero' | 'npc';
  placeholder: string | null;
  image: string;
  frameW: number;
  frameH: number;
  /** Ponto de apoio dos pés dentro do quadro. */
  feet: Point;
  animations: Record<string, AnimationDef>;
  portrait: string;
}

interface Manifest {
  version: number;
  characters: Record<string, CharacterSprite>;
}

export const spriteManifest = manifestJson as unknown as Manifest;

export type CharacterId = keyof typeof manifestJson.characters;

export function getCharacter(id: string): CharacterSprite {
  const c = spriteManifest.characters[id];
  if (!c) throw new Error(`Sprite desconhecido: ${id}`);
  return c;
}

/** Caminho público de um asset, respeitando o base do Vite. */
export function assetUrl(p: string): string {
  return `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`;
}

const cache = new Map<string, HTMLImageElement>();
const pending = new Map<string, Promise<HTMLImageElement>>();

export function loadImage(path: string): Promise<HTMLImageElement> {
  const url = assetUrl(path);
  const hit = cache.get(url);
  if (hit) return Promise.resolve(hit);
  const inflight = pending.get(url);
  if (inflight) return inflight;
  const p = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      cache.set(url, img);
      pending.delete(url);
      resolve(img);
    };
    img.onerror = () => {
      pending.delete(url);
      reject(new Error(`Falha ao carregar ${url}`));
    };
    img.src = url;
  });
  pending.set(url, p);
  return p;
}

/** Imagem já carregada (ou null). Dispara o carregamento se ainda não começou. */
export function getImage(path: string): HTMLImageElement | null {
  const url = assetUrl(path);
  const hit = cache.get(url);
  if (hit) return hit;
  void loadImage(path).catch(() => undefined);
  return null;
}

export function preloadImages(paths: string[]): Promise<unknown> {
  return Promise.allSettled(paths.map(loadImage));
}

export function heroSpriteId(gender: 'm' | 'f', heroClass: 'alchemist' | 'mage'): string {
  return `hero_${heroClass}_${gender}`;
}
