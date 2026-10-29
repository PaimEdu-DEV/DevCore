# DevCore visual direction v2

## Why the first pass was replaced
The earlier Canvas houses and zombie had broad flat rectangles and insufficient material detail relative to the existing hero artwork. Village tiles also embedded opaque grass under props, roads exposed the tile grid, and foreground trees obscured actors.

## Implemented architecture
React/TypeScript/Vite remains unchanged. Village and Journey render through PixelStage, a 448x252 nearest-neighbor Canvas with responsive DOM UI. Village retains 24px navigation cells, BFS, save coordinates and NPC interactions. Buildings are independent RGBA sprites sorted with actors at their foundation row. Ground is a cached world-space surface with connected paths, staggered cobbles, grass clusters and a stone shoreline. Fences, lamps, crates, signs and brambles have transparent procedural silhouettes. No rectangular grass backing remains on props.

The top camera limit now admits 72px of roof headroom; pointer conversion uses the same limit. Village actors use a common 0.75 scale (approximately 30px visible height), with approximately 27px doorway clearance under the three-quarter perspective. House images retain their native aspect ratios and foundation anchors. Side-view Journey heroes remain at original scale; zombie height is 42px with feet fixed at GROUND_Y+2. The new distant valley is a separate mirrored-repeat parallax layer for Estrada do Portao only. Other area themes retain their independent backgrounds.

## Art production and files
Built-in imagegen produced seven separate source assets, preserved in `art/world-v2/*-source.png`. Runtime assets are in `public/assets/world-v2/`. No complete playable scene was flattened into an image. Original sprites and tiles remain available.

`node scripts/prepare-world-v2.mjs` trims transparent margins, resizes with nearest-neighbor sampling and records dimensions/alpha in `art/world-v2/inventory.json`. Runtime sizes: house 120x128, forge 120x106, oak 60x78, well 32x45, gate 168x133, zombie 38x42, valley 512x341. Six isolated objects have verified transparent pixels; the valley is intentionally opaque.

Prompt specifications used (built-in imagegen):
- House: isolated complete medieval timber/stone apothecary, three-quarter top-down, blue slate roof, deep eaves, plaster, stone footing, oak door, leaded amber windows, ivy, upper-left light; no ground rectangle, people or text.
- Forge: isolated broad medieval workshop, same camera/light, terracotta roof, stone chimney, integrated furnace, iron brackets, arched door and stone foundation; no disconnected props or scenery.
- Oak: isolated ancient oak with irregular layered moss/olive canopy, twisting textured trunk and exposed roots, three-quarter top-down; no ground tile or labels.
- Well: round stone rim, dark visible water, oak posts, rope/bucket and reddish pitched canopy; transparent, same camera/light.
- Gate: pointed oak double gate between crenellated stone towers, moss, dark green banners, sparse lime rune at keystone; transparent, same camera/light.
- Zombie: side-view left-facing green/black humanoid, hunched, torn medieval tunic, claws, separate legs, decayed face and small lime eyes; isolated transparent single pose, intended 42px height.
- Valley: background layer only, misty slate mountains, muted blue-grey sky/clouds, sage foothills and distant forest, no playable ground, characters or UI.

Lighting is consistently upper-left. Natural materials use restrained olive, slate, stone and terracotta; lime is reserved for corruption. Zombie animation is a subtle torso sway and existing death fade/collapse, not a newly invented AI or spritesheet. Existing encounters, solutions, damage, rewards and save logic are unchanged.

## Verification
Production build and all 125 unit tests passed. Browser workflows cover village movement/conversation/shop/menu, journey fights through Aldric, all area transitions, and mobile controls. Added `e2e/world-v2.spec.ts` verifies new asset loading, gate interaction, page errors and desktop/mobile captures. Screenshots reviewed at native game presentation; foreground occlusion and actor scale were corrected after review.

## Known limits
Generated high-resolution art is reduced for the existing pixel grid, so it is not a hand-authored limited-palette tileset. Village actors use fractional downsampling with smoothing disabled; responsive CSS scaling is preserved. The two northern homes share one architectural asset. Zombie has one illustrated pose with procedural animation, not independently painted attack/walk frames. Navigation topology stays compatible with existing saves; a larger settlement or more interiors would be separate gameplay work.
