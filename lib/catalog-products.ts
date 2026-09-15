import { readdir } from 'node:fs/promises';
import path from 'node:path';
import type { ProductCardProduct } from '@/types/catalog';

const MODELS_DIR = path.join(process.cwd(), 'public', 'models');
const enablePreviewHotspotPicker = false;

const squareTableHotspots: ProductCardProduct['previewHotspots'] = [
  {
    id: 'tabletop-finish',
    label: 'Tabletop Finish',
    text: 'Inspect the surface grain, finish tone, and tabletop proportion in 3D.',
    position: '0m 74.9m 18m',
    normal: '0m 1m 0m',
  },
  {
    id: 'edge-profile',
    label: 'Edge Profile',
    text: 'Detail callouts can explain dimensions and edge treatment in context.',
    position: '45m 72m 0m',
    normal: '1m 0m 0m',
  },
  {
    id: 'base-joinery',
    label: 'Base Joinery',
    text: 'Construction notes stay anchored to the exact part being inspected.',
    position: '-22m 34m -22m',
    normal: '-1m 0m -1m',
  },
];

const picnicTableHotspots: ProductCardProduct['previewHotspots'] = [
  {
    id: 'shared-surface',
    label: 'Shared Surface',
    text: 'A 3D view makes seating, spacing, and outdoor use easier to judge.',
    position: '0m 0.78m 0m',
    normal: '0m 1m 0m',
  },
  {
    id: 'bench-spacing',
    label: 'Bench Spacing',
    text: 'Hotspots can explain clearance and layout directly on the model.',
    position: '0.75m 0.45m 0.45m',
    normal: '1m 0m 0m',
  },
];

const trestleTableHotspots: ProductCardProduct['previewHotspots'] = [
  {
    id: 'tabletop-scale',
    label: 'Tabletop Scale',
    text: 'Large surfaces communicate proportion and room fit better in 3D.',
    position: '0m 4.14m 0m',
    normal: '0m 1m 0m',
  },
  {
    id: 'support-frame',
    label: 'Support Frame',
    text: 'Structural details can be explained without leaving the viewer.',
    position: '2.2m 2.4m 0m',
    normal: '1m 0m 0m',
  },
];

const rockingChairHotspots: ProductCardProduct['previewHotspots'] = [
  {
    id: 'rounded-seat',
    label: 'Rounded Seat',
    text: 'The close view helps inspect comfort, edges, and child-safe proportions.',
    position: '0m 0.11m 0.12m',
    normal: '0m 1m 0m',
  },
  {
    id: 'rocker-rail',
    label: 'Rocker Rail',
    text: 'Motion-critical parts can be explained exactly where they affect use.',
    position: '0.05m 0.03m 0.15m',
    normal: '1m 0m 0m',
  },
];

const classicChairHotspots: ProductCardProduct['previewHotspots'] = [
  {
    id: 'back-support',
    label: 'Back Support',
    text: '3D inspection makes the back angle and support profile easier to read.',
    position: '0m 0.86m -0.18m',
    normal: '0m 0m -1m',
  },
  {
    id: 'seat-height',
    label: 'Seat Height',
    text: 'A callout can connect dimensions to the visible seating surface.',
    position: '0.12m 0.46m 0m',
    normal: '1m 0m 0m',
  },
];

const pedestalBaseHotspots: ProductCardProduct['previewHotspots'] = [
  {
    id: 'top-mount',
    label: 'Top Mount',
    text: 'Support and attachment areas can be inspected before choosing a tabletop.',
    position: '0m 1.78m 0m',
    normal: '0m 1m 0m',
  },
  {
    id: 'base-silhouette',
    label: 'Base Silhouette',
    text: '3D rotation helps customers understand weight, stance, and balance.',
    position: '0.5m 0.8m 0.3m',
    normal: '1m 0m 0m',
  },
];

const rectangularTableHotspots: ProductCardProduct['previewHotspots'] = [
  {
    id: 'long-surface',
    label: 'Long Surface',
    text: 'A rectangular table benefits from spatial inspection of length and depth.',
    position: '0m 0.76m 0m',
    normal: '0m 1m 0m',
  },
  {
    id: 'corner-detail',
    label: 'Corner Detail',
    text: 'Users can rotate to compare the corner, leg position, and edge treatment.',
    position: '0.34m 0.36m 0.54m',
    normal: '1m 0m 1m',
  },
];

const gardenSetHotspots: ProductCardProduct['previewHotspots'] = [
  {
    id: 'set-layout',
    label: 'Set Layout',
    text: 'A grouped product is easier to evaluate when spacing and arrangement are visible.',
    position: '0m 749m 0m',
    normal: '0m 1m 0m',
  },
  {
    id: 'seating-zone',
    label: 'Seating Zone',
    text: 'Hotspots can explain how individual seats relate to the shared table.',
    position: '420m 360m 280m',
    normal: '1m 0m 0m',
  },
  {
    id: 'material-consistency',
    label: 'Material Consistency',
    text: 'Material notes can be attached across multi-piece product sets.',
    position: '-280m 500m -200m',
    normal: '-1m 0m -1m',
  },
];

const PRODUCT_COPY_BY_FILE: Record<
  string,
  Pick<ProductCardProduct, 'name' | 'subtitle' | 'accent'>
> = {
  '10089_Table-90x90.glb': {
    name: 'Square Hardwood Dining Table',
    subtitle:
      'A compact four-seat table for kitchens, breakfast rooms, and smaller dining spaces.',
    accent: 'Dining',
  },
  '10089_Table-90x90_textured.glb': {
    name: 'Square Table, Finished Sample',
    subtitle:
      'A finished version of the square dining table, suited for comparing surface tone and grain.',
    accent: 'Finish Sample',
  },
  'Kid_Rocking_Chair.glb': {
    name: 'Child Rocking Chair',
    subtitle:
      'A scaled hardwood rocker with rounded edges, made for a nursery, reading corner, or playroom.',
    accent: 'Seating',
  },
  'base_basic_shaded.glb': {
    name: 'Pedestal Base Study',
    subtitle:
      'A simple pedestal form used for side tables, display stands, and custom support details.',
    accent: 'Base Design',
  },
  'old_wooden_chair.glb': {
    name: 'Classic Wooden Chair',
    subtitle:
      'A traditional chair profile that can be adapted for dining, desk, or occasional seating.',
    accent: 'Seating',
  },
  'picnic_table.glb': {
    name: 'Outdoor Picnic Table',
    subtitle:
      'A bench-and-table set for patios, gardens, and shared outdoor meals.',
    accent: 'Outdoor',
  },
  'table-test-texture.glb': {
    name: 'Hardwood Finish Test Table',
    subtitle:
      'A table sample used to review wood color, sheen, and surface character before production.',
    accent: 'Finish Sample',
  },
  'table2.glb': {
    name: 'Rectangular Hardwood Table',
    subtitle:
      'A clean rectangular table that can be sized for dining rooms, studios, or daily work.',
    accent: 'Custom Table',
  },
  'table_5.glb': {
    name: 'Trestle Dining Table',
    subtitle:
      'A substantial dining table with a grounded base and room for family meals or larger gatherings.',
    accent: 'Dining',
  },
  'wooden_table_set.glb': {
    name: 'Garden Furniture Set',
    subtitle:
      'A coordinated table and seating set built for outdoor rooms, patios, and backyard dining.',
    accent: 'Outdoor Set',
  },
};

const sharedCatalogSettings: ProductCardProduct['modelSettings'] = {
  mode: 'card',
  cameraOrbit: '40deg 74deg 118%',
  autoRotate: true,
  autoRotateDelay: 500,
  rotationPerSecond: '10deg',
  zoomEnabled: true,
};

const chairCatalogSettings: ProductCardProduct['modelSettings'] = {
  ...sharedCatalogSettings,
  cameraOrbit: '28deg 78deg 132%',
  fieldOfView: '24deg',
  shadowIntensity: 0.42,
  exposure: 0.98,
};

const setCatalogSettings: ProductCardProduct['modelSettings'] = {
  ...sharedCatalogSettings,
  cameraOrbit: '34deg 72deg 126%',
  fieldOfView: '26deg',
  shadowIntensity: 0.36,
  exposure: 0.94,
};

const outdoorSetCatalogSettings: ProductCardProduct['modelSettings'] = {
  ...setCatalogSettings,
  transparentBackground: true,
  shadowIntensity: 0.68,
  exposure: 0.58,
  style: {
    filter: 'brightness(0.68) contrast(1.34) saturate(0.96)',
  },
};

const compactCatalogSettings: ProductCardProduct['modelSettings'] = {
  ...sharedCatalogSettings,
  cameraOrbit: '30deg 76deg 104%',
  fieldOfView: '30deg',
  shadowIntensity: 0.35,
  exposure: 0.96,
};

const FEATURED_PREFERRED_MODELS = [
  '/models/picnic_table.glb',
  '/models/table_5.glb',
  '/models/wooden_table_set.glb',
] as const;

function titleFromFilename(fileName: string) {
  return fileName
    .replace(/\.glb$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function subtitleFromFilename(fileName: string) {
  const baseName = fileName.replace(/\.glb$/i, '');

  if (/chair|rocking/i.test(baseName)) {
    return 'A hardwood seating design that can be adjusted for height, finish, and room use.';
  }

  if (/textured/i.test(baseName)) {
    return 'A finished sample for comparing surface tone, grain, and sheen.';
  }

  if (/set|picnic/i.test(baseName)) {
    return 'A grouped table-and-seating design for patios, gardens, and shared meals.';
  }

  if (/base/i.test(baseName)) {
    return 'A compact base form for side tables, display pieces, and custom supports.';
  }

  return 'A made-to-order hardwood piece that can be sized, detailed, and finished for the room.';
}

function productCopyForFile(fileName: string) {
  return PRODUCT_COPY_BY_FILE[fileName];
}

function accentFromFilename(fileName: string) {
  const baseName = fileName.replace(/\.glb$/i, '');

  if (/chair|rocking/i.test(baseName)) {
    return 'Seating';
  }

  if (/set|picnic/i.test(baseName)) {
    return 'Outdoor';
  }

  if (/textured|texture/i.test(baseName)) {
    return 'Finish Sample';
  }

  if (/base/i.test(baseName)) {
    return 'Base Design';
  }

  return 'Custom Table';
}

function modelSettingsForFile(fileName: string): ProductCardProduct['modelSettings'] {
  if (/wooden_table_set/i.test(fileName)) {
    return outdoorSetCatalogSettings;
  }

  if (/chair|rocking/i.test(fileName)) {
    return chairCatalogSettings;
  }

  if (/set|picnic/i.test(fileName)) {
    return setCatalogSettings;
  }

  if (/base|90x90/i.test(fileName)) {
    return compactCatalogSettings;
  }

  return sharedCatalogSettings;
}

function previewHotspotsForFile(fileName: string): ProductCardProduct['previewHotspots'] {
  if (/Kid_Rocking_Chair/i.test(fileName)) {
    return rockingChairHotspots;
  }

  if (/old_wooden_chair/i.test(fileName)) {
    return classicChairHotspots;
  }

  if (/base_basic_shaded/i.test(fileName)) {
    return pedestalBaseHotspots;
  }

  if (/10089_Table-90x90|table-test-texture/i.test(fileName)) {
    return squareTableHotspots;
  }

  if (/picnic_table/i.test(fileName)) {
    return picnicTableHotspots;
  }

  if (/table_5/i.test(fileName)) {
    return trestleTableHotspots;
  }

  if (/table2/i.test(fileName)) {
    return rectangularTableHotspots;
  }

  if (/wooden_table_set/i.test(fileName)) {
    return gardenSetHotspots;
  }

  return squareTableHotspots;
}

function priceForIndex(index: number) {
  return 42900 + index * 2500;
}

export async function getCatalogProducts(): Promise<ProductCardProduct[]> {
  const modelFiles = await readdir(MODELS_DIR);

  return modelFiles
    .filter((fileName) => fileName.toLowerCase().endsWith('.glb'))
    .sort((left, right) => left.localeCompare(right))
    .map((fileName, index) => {
      const productCopy = productCopyForFile(fileName);

      return {
        id: fileName.replace(/\.glb$/i, '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: productCopy?.name ?? titleFromFilename(fileName),
        subtitle: productCopy?.subtitle ?? subtitleFromFilename(fileName),
        priceCents: priceForIndex(index),
        accent: productCopy?.accent ?? accentFromFilename(fileName),
        modelSrc: `/models/${fileName}`,
        modelSettings: modelSettingsForFile(fileName),
        previewHotspots: previewHotspotsForFile(fileName),
        enableHotspotPicker: enablePreviewHotspotPicker,
      };
    });
}

export async function getFeaturedCatalogProduct(): Promise<ProductCardProduct | null> {
  const products = await getCatalogProducts();
  const candidate =
    FEATURED_PREFERRED_MODELS
      .map((modelSrc) => products.find((product) => product.modelSrc === modelSrc))
      .find(Boolean) ??
    products.find((product) => /picnic|table_5|wooden_table_set/i.test(product.modelSrc)) ??
    products[0];

  if (!candidate) {
    return null;
  }

  return {
    ...candidate,
    id: `${candidate.id}-featured`,
    accent: 'Featured Build',
  };
}
