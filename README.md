# Puffer — real GLB collection

React 19, TypeScript, React Three Fiber, Three.js and Vite.

## Run

```sh
npm install
npm run dev
```

`npm run build` type-checks and creates `dist`. Models and render previews are bundled locally. No API keys or remote decoder services are needed.

## Included models and matching palettes

| Original file | Collection | Background |
|---|---|---|
| extracted_model (2).glb | Glacier, ice blue | Slate blue #455f70 |
| extracted_model.glb | Onyx, black | Warm charcoal #484d45 |
| extracted_model (1).glb | Ember, orange | Burnt amber #724631 |
| extracted_model (3).glb | Volt, navy/lime | Muted olive #414b38 |

`src/models.tsx` maps each variant to its own optimized GLB. The original texture colors, UVs, normal and roughness maps are retained. Geometry is centered, turned toward camera and normalized to the same height. Materials use a satin clearcoat, limited metallic response, a roughness floor, and softened normal strength. A warm key, cool rim, broad environment softboxes, ACES tone mapping and contact shadows shape the real-time WebGL scene.

The persistent R3F groups preserve the vertical carousel, scale transitions, idle float and miniature preview. Scroll, arrow keys and swatches select a jacket. Space toggles autoplay. Motion Studio adjusts playback and can preview a replacement GLB locally.

## Optimization

See `optimization-report.json` for exact per-file measurements. The four originals total 227,445,548 bytes; optimized GLBs total 3,786,196 bytes (98.3% smaller). Each jacket has about 86k–89k triangles, down from about 1.9m–2.0m. Weld, mesh simplification, pruning, texture resizing, WebP compression, quantization and Meshopt compression are applied. Base-color textures are capped at 2048px; normal and ORM maps at 1024px. Meshopt decoding is bundled with Three.js.

To repeat optimization with the original filenames in a folder:

```sh
cd tools/optimizer
npm install
cd ../..
node tools/optimizer/optimize.mjs /absolute/path/to/original-models ./public/models
```

Original 227 MB source models are not duplicated in this download. The optimized collection is in `public/models`.

## Verification and limits

- TypeScript and Vite production build pass.
- All four optimized files decoded and were rendered for geometry, texture and front-orientation checks.
- Browser selection controls and background updates checked.
- Available browser does not support a WebGL context. Live R3F shading and animation could not be visually verified there. On such devices the site shows real-model rendered previews, rather than procedural substitute jackets. These poster images use separate offline lighting and are not a screenshot of the real-time WebGL shading.
- The supplied textures contain baked highlights; added lights do not remove them.
- This is a visual storefront prototype; payments are not connected.
