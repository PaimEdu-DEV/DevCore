# Visual reconstruction — implementation audit

React/TypeScript/Vite; both environments render through Canvas PixelStage at 448x252. Village uses 24px navigation cells and BFS; Journey uses horizontal camera and cached parallax canvases. Character sprites use manifest feet anchors; hero frames are 48x48 with feet at (24,46), approximately 41px visible height. Native pixels use nearest-neighbor rendering; responsive presentation can use fractional CSS scaling.

Original defects: architecture assembled from roof/eave/wall tiles; static props always behind actors; insect silhouette generated in scenery.ts (no enemy image). Terrain tiles live in public/assets/tiles/village.png, characters in public/assets/sprites with frame metadata in sprite-manifest.json. Original PNGs remain untouched.

Implementation: architecture.ts supplies three complete transparent Canvas buildings over existing blocked footprints, 72/96px wide. Roof has a shaded return and overhang, timber facade, inset windows and door, stone footing. Lighting comes from upper left. Buildings and props participate in foot-row depth sorting. Door clearance is approximately 45px. Houses retain collision footprints; roof overhang is visual only. The original map, NPCs, BFS and interaction targets remain intact.

Journey retains independent side-view rules and GROUND_Y=214, with actor feet at 216. Zombie is 36px tall, outlined in near-black with rotten green skin, torn tunic, uneven legs, claws and small lime eyes. Idle sway and death collapse/fade use existing elapsed-time renderer. Enemies remain stationary encounter blockers: no invented walking AI or unused animation sheets. Existing combat recoil is retained. Background trees now have overlapping canopy clusters; meadow sky uses restrained colors. No AI generation is needed for these code-native Canvas assets.

Validation: production build and 125 unit tests passed. Playwright village and journey integration workflows run separately; see test results for browser outcomes.

Remaining art work: gate/well/tree/fence tiles still use the original atlas; roads retain the original grid layout. Full hand-authored landscape reconstruction, richer zombie attack articulation and matching the detailed player sprite shading require another art pass. This is an implemented foundation, not completion of all requested art direction.
