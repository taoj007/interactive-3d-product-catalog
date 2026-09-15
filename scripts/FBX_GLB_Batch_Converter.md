# FBX to GLB Batch Converter

## Prerequisites

- `sharp` installed in this project:
  - `npm install sharp`
- `blender` available on `PATH`
- `gltf-transform` CLI installed for the optimization stage:
  - `npm install -D @gltf-transform/cli`
- Optional but recommended: `7z` or `unar` available on `PATH` for `textures.rar`

## Input Layout

Each model should live under `input/<model-name>/`:

```text
input/
  table_90x90/
    any-name.fbx
    any-name.rar
```

The converter uses:

- the first `.fbx` file it finds in the model folder
- the first `.rar` file it finds in the same folder
- the folder name as the output name

So this becomes:

```text
input/
  table_90x90/
    dining_export_final.fbx
    wood_textures_bundle.rar
```

and outputs:

```text
public/models/
  table_90x90.glb
```

If you do not have `7z` or `unar`, you can extract the textures manually and keep
them inside the same model folder. The converter will fall back to unpacked
texture files when no archive extractor is installed.

## Commands

Convert every model folder:

```bash
npm run convert
```

Convert one model:

```bash
npm run convert -- --model table_90x90
```

Optional flags:

```text
--resolution 1024
--keep-work
```

## Outputs

- GLBs: `public/models/<model-name>.glb`
- Per-model logs: `logs/<model-name>.json`
- Latest summary: `logs/latest-summary.txt`

If a file with the same folder-derived name already exists in `public/models/`,
the converter replaces it automatically.

## Optimization Stage

After Blender exports the raw GLB, the script runs:

```text
gltf-transform optimize <raw.glb> <output.glb> --compress draco --texture-compress webp
```

That stage handles post-export geometry and texture optimization for smaller web delivery.
