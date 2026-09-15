# Interactive 3D Product Catalog

A Next.js and TypeScript commerce prototype exploring how 3D product inspection can make online shopping more useful for people.

Traditional product pages often reduce physical products to flat images, text specs, and price. This demo asks a simple question: what if a storefront let shoppers inspect form, scale, materials, and product details directly in the browser?

## Project Info

- Live demo: https://interactive-3d-product-catalog.vercel.app/
- Repository: https://github.com/taoj007/interactive-3d-product-catalog
- Last updated: September 15, 2026
- License: MIT

## Highlights

- Full-page 3D landing scene with scroll-driven camera movement.
- Responsive product catalog rendered from local GLB model assets.
- Reusable `<ProductModel />` wrapper around `@google/model-viewer`.
- Product detail modal with rotate, zoom, AR-ready settings, and anchored hotspots.
- Demo hotspot callouts across tables, chairs, bases, and outdoor furniture sets.
- Hardwood material swatches for texture and finish comparison.
- Development hotspot picker for capturing model positions and normals.

## Why I Built This

As AI automates more interface production, I wanted to explore a part of the web where human judgment still matters deeply: perception, inspection, and trust.

An ecommerce page serves people first. For physical products, shoppers need to understand shape, depth, proportion, texture, and construction. A richer 3D interface can make that decision process more visual and interactive than a traditional 2D product grid.

This project uses generated and prepared GLB assets, renders them in a Next.js application, and demonstrates how explanatory hotspots can connect product information to the exact area a shopper is inspecting.

## Hotspot Demo Update

The catalog now includes example product-detail hotspots across multiple model families, so users can immediately see the interaction concept after opening a product detail modal.

Current demo callouts include:

- Square tables: tabletop finish, edge profile, and base joinery.
- Picnic table: shared surface and bench spacing.
- Trestle table: tabletop scale and support frame.
- Rocking chair: rounded seat and rocker rail.
- Classic chair: back support and seat height.
- Pedestal base: top mount and base silhouette.
- Rectangular table: long surface and corner detail.
- Garden furniture set: set layout, seating zone, and material consistency.

These are prototype annotations intended to demonstrate how an ecommerce interface can explain product details in the same place users visually inspect them.

## Tech Stack

- Next.js
- React
- TypeScript
- Styled Components
- `@google/model-viewer`
- GLB / glTF assets

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and visit `/product-list` to inspect the catalog.

## Useful Scripts

```bash
npm run dev
npm run build
npm run lint
npm run convert
```

## Project Structure

- `app/page.tsx`: scroll-driven 3D landing experience.
- `app/product-list/page.tsx`: catalog view.
- `components/product-model.tsx`: reusable model-viewer integration.
- `components/product-preview-dialog.tsx`: interactive product detail modal and hotspot picker.
- `lib/catalog-products.ts`: product metadata, GLB selection, camera settings, and hotspots.
- `public/models`: local GLB product assets.
- `public/materials/hardwood`: material swatch assets.
