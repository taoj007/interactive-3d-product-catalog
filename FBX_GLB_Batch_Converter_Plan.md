# FBX → GLB Batch Converter (Final Plan)

## Goal

Build a **Node.js CLI tool** to batch convert hardwood furniture models
from:

    input/<model-name>/
    ├── model.fbx
    └── textures.rar

into:

    output/<model-name>.glb

The output GLB should:

-   Embed textures
-   Resize textures to **1K**
-   Convert Glossiness → Roughness
-   Be optimized for web viewing
-   Target **\<10 MB** whenever practical

------------------------------------------------------------------------

# Scope

## Supported

-   Static hardwood furniture
-   FBX models
-   One texture package (`textures.rar`)
-   Existing UV mapping
-   Standard image textures (PNG/JPG/TGA)

Examples:

-   Dining tables
-   Coffee tables
-   Chairs
-   Benches
-   Shelves
-   Cabinets
-   Desks

## Out of Scope (Version 1)

-   Animation
-   Glass
-   Metal
-   Fabric
-   Plastic
-   Procedural materials
-   Missing UV repair
-   Geometry repair

Models outside this scope should be reported with warnings instead of
being repaired automatically.

------------------------------------------------------------------------

# Project Structure

    fbx-glb-converter/

    input/
        table_90x90/
            model.fbx
            textures.rar

        chair_oak/
            model.fbx
            textures.rar

    output/

    work/

    logs/

    src/
        index.js
        scanModels.js
        extractTextures.js
        processTextures.js
        convertFbx.js
        optimizeGlb.js
        validateOutput.js

    package.json
    README.md

------------------------------------------------------------------------

# Workflow

    Scan input folders
            ↓
    Extract textures.rar
            ↓
    Detect texture maps
            ↓
    Resize textures to 1K
            ↓
    Convert Glossiness → Roughness
            ↓
    Convert FBX → GLB
            ↓
    Embed textures
            ↓
    Optimize GLB
            ↓
    Validate output
            ↓
    Save GLB + logs

------------------------------------------------------------------------

# Naming Convention

Each model uses its own folder.

Example:

    input/
        table_90x90/
            model.fbx
            textures.rar

Output:

    output/
        table_90x90.glb

The folder name is the model identifier.

------------------------------------------------------------------------

# Texture Detection

Automatically recognize common naming patterns.

Base Color

-   diffuse
-   color
-   albedo
-   basecolor

Normal

-   normal
-   nrm

Glossiness

-   gloss
-   glossiness

Roughness

-   rough
-   roughness

Specular

-   spec
-   specular

If Roughness is missing:

    roughness = invert(glossiness)

------------------------------------------------------------------------

# Material Strategy

Assumption:

All visible meshes are hardwood.

Version 1:

-   Apply one detected wood material set to all mesh materials.
-   Preserve existing UV mapping.
-   Embed textures into the GLB.

------------------------------------------------------------------------

# Optimization

-   Resize textures to 1024 px
-   Remove unused assets
-   Embed textures
-   Optimize GLB for web delivery
-   Target output smaller than 10 MB

------------------------------------------------------------------------

# Validation

For each model, verify:

-   FBX exists
-   textures.rar exists
-   Texture maps detected
-   GLB exported
-   Embedded textures
-   Output size
-   Any warnings

Example summary:

    table_90x90   SUCCESS
    chair_oak     SUCCESS
    desk_large    WARNING: missing roughness map (generated from glossiness)

------------------------------------------------------------------------

# CLI

Convert all:

``` bash
npm run convert
```

Convert one model:

``` bash
npm run convert -- --model table_90x90
```

Optional future flags:

``` text
--resolution 1024
--overwrite
--keep-work
```

------------------------------------------------------------------------

# Future Versions

## Version 1

-   Hardwood only
-   One texture set
-   1K textures
-   Batch conversion
-   Optimized GLB

## Version 2

-   Multiple wood materials
-   Better texture matching
-   Preview image generation
-   Parallel processing

## Version 3

-   Local web UI
-   Drag-and-drop model folders
-   Progress dashboard
-   Batch preview

------------------------------------------------------------------------

# Design Principles

-   Node.js-first project
-   Simple folder-based workflow
-   One folder = one model
-   Fully automated batch processing
-   No manual editing required for supported models
-   Clear warnings for unsupported or problematic models
