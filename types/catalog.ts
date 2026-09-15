import type { ProductModelSettings } from '@/components/product-model';

export interface ProductPreviewHotspot {
  id: string;
  label: string;
  text?: string;
  position?: string;
  normal?: string;
  surface?: string;
}

export interface CatalogProductBase {
  id: string;
  name: string;
  subtitle: string;
  accent: string;
  modelSrc: string;
  priceCents: number;
  previewHotspots?: ProductPreviewHotspot[];
  enableHotspotPicker?: boolean;
}

export interface ProductCardProduct extends CatalogProductBase {
  modelSettings: ProductModelSettings;
}

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export function formatProductPrice(priceCents: number) {
  return priceFormatter.format(priceCents / 100);
}
