# Interactive 3D Product Catalog

A Next.js and TypeScript commerce prototype exploring how 3D product inspection can make online shopping more useful for people.

Traditional product pages often reduce physical products to flat images, text specs, and price. This demo asks a simple question: what if a storefront let shoppers inspect form, scale, materials, and product details directly in the browser?

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

## LinkedIn Positioning

Suggested featured title:

```text
Interactive 3D Product Catalog | Next.js + TypeScript
```

Suggested short description:

```text
A browser-based commerce prototype that renders GLB product assets with Next.js, model-viewer, responsive product cards, zoomable detail views, material swatches, and anchored hotspots for richer human product inspection.
```

## LinkedIn Draft

```text
I’ve been thinking about where web interfaces should go as AI changes how software is built.

AI can generate content quickly: text, images, layouts, and even product assets. But for human-facing software, speed is not the whole story. People still need interfaces that help them inspect, understand, compare, and trust what they are seeing.

That idea led me to build this prototype: an interactive 3D product catalog for ecommerce.

Instead of only showing flat product images and text specs, this demo renders GLB product models directly in the browser. Users can rotate, zoom, inspect product shape, compare materials, and open detail views with hotspots anchored to specific parts of the model.

The hotspot layer is the part I’m most interested in. It turns product information into spatial context: surface finish, edge profile, seating spacing, joinery, scale, support frame, and other details can be explained exactly where the user is looking.

For physical products, I think this kind of interaction can communicate shape, depth, scale, texture, and construction better than a traditional 2D product grid.

Tech used:
Next.js, React, TypeScript, Styled Components, @google/model-viewer, GLB/glTF assets.

This is still a prototype, but I’m excited by the direction: modern commerce pages should feel more visual, spatial, and interactive, especially as AI makes content generation easier.

Curious how others see this: do you think 3D product inspection will become a normal part of ecommerce UX?

#NextJS #ReactJS #TypeScript #FrontendDevelopment #WebDevelopment #Ecommerce #UXDesign #ProductDesign #ThreeD
```

## Recording Plan

Use a short 20-35 second screen recording for the LinkedIn post, then use the best frame as the Featured thumbnail.

Suggested recording flow:

- Start on the landing page with the large 3D model visible.
- Scroll slowly to show the camera and parallax motion.
- Open the product catalog.
- Hover a product card to show model movement.
- Open a product detail modal.
- Rotate or zoom the model while the hotspot labels are visible.

Suggested overlay text:

```text
Interactive 3D Product Catalog
Rotate, Zoom, Inspect
Built with Next.js + TypeScript + GLB
```
