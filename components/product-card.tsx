'use client';

import { useMemo, useState } from 'react';
import styled from 'styled-components';
import ProductModel from '@/components/product-model';
import ProductPreviewDialog from '@/components/product-preview-dialog';
import { designTokens } from '@/lib/design-tokens';
import {
  formatProductPrice,
  type ProductCardProduct,
} from '@/types/catalog';

const Card = styled.article`
  display: flex;
  flex-direction: column;
  min-height: 420px;
  overflow: hidden;
  border: 1px solid ${designTokens.color.line};
  border-radius: 28px;
  background: ${designTokens.color.surface};
  box-shadow: ${designTokens.shadow.card};
  backdrop-filter: blur(14px);

  @media (max-width: 720px) {
    min-height: 390px;
  }
`;

const Media = styled.div`
  position: relative;
  height: 260px;
  padding: 18px;
  border-bottom: 1px solid rgba(35, 28, 20, 0.08);
  background: ${designTokens.background.cardMedia};

  @media (max-width: 720px) {
    height: 220px;
  }
`;

const ModelFrame = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  isolation: isolate;
  overflow: hidden;
  border-radius: 20px;
  background: ${designTokens.background.viewerWood};
  background-position: center;
  background-size: cover;

  &::before {
    position: absolute;
    inset: 0;
    z-index: -1;
    content: '';
    background:
      radial-gradient(circle at center, rgba(255, 255, 255, 0.34), transparent 58%),
      linear-gradient(
        120deg,
        transparent 0%,
        rgba(255, 255, 255, 0.2) 42%,
        transparent 64%
      );
    pointer-events: none;
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 1;
  padding: 8px 12px;
  border-radius: 999px;
  background: ${designTokens.background.badge};
  border: 1px solid rgba(140, 71, 24, 0.12);
  color: ${designTokens.color.accentDeep};
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.04em;
`;

const Body = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  gap: 20px;
  padding: 22px;
`;

const Meta = styled.div``;

const Title = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  line-height: 1.05;
`;

const Subtitle = styled.p`
  margin: 10px 0 0;
  color: ${designTokens.color.muted};
  line-height: 1.6;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 720px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

const Price = styled.strong`
  font-size: 1.2rem;
`;

const ActionButton = styled.button`
  padding: 12px 18px;
  border: 0;
  border-radius: 999px;
  background: ${designTokens.color.accent};
  color: white;
  cursor: pointer;
  transition: transform 140ms ease, background 140ms ease;

  &:hover {
    transform: translateY(-1px);
    background: ${designTokens.color.accentDeep};
  }

  @media (max-width: 720px) {
    width: 100%;
  }
`;

interface ProductCardProps {
  product: ProductCardProduct;
  primaryActionLabel?: string;
  onPrimaryAction?: (product: ProductCardProduct) => void;
  detailsActionLabel?: string;
}

export default function ProductCard({
  product,
  primaryActionLabel,
  onPrimaryAction,
  detailsActionLabel = 'View Details',
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const viewerSettings = useMemo(
    () => ({
      ...product.modelSettings,
      autoRotate: product.modelSettings.autoRotate ? isHovered : false,
    }),
    [isHovered, product.modelSettings]
  );

  return (
    <>
      <Card
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
      >
        <Media>
          <Badge>{product.accent}</Badge>
          <ModelFrame>
            <ProductModel src={product.modelSrc} alt={product.name} {...viewerSettings} />
          </ModelFrame>
        </Media>

        <Body>
          <Meta>
            <Title>{product.name}</Title>
            <Subtitle>{product.subtitle}</Subtitle>
          </Meta>

          <Footer>
            <Price>{formatProductPrice(product.priceCents)}</Price>
            {onPrimaryAction ? (
              <ActionButton type="button" onClick={() => onPrimaryAction(product)}>
                {primaryActionLabel ?? 'Add To Cart'}
              </ActionButton>
            ) : null}
            <ActionButton type="button" onClick={() => setIsPreviewOpen(true)}>
              {detailsActionLabel}
            </ActionButton>
          </Footer>
        </Body>
      </Card>

      <ProductPreviewDialog
        isOpen={isPreviewOpen}
        name={product.name}
        subtitle={product.subtitle}
        price={formatProductPrice(product.priceCents)}
        modelSrc={product.modelSrc}
        cameraOrbit={product.modelSettings.cameraOrbit}
        cameraTarget={product.modelSettings.cameraTarget}
        fieldOfView={product.modelSettings.fieldOfView}
        shadowIntensity={product.modelSettings.shadowIntensity}
        exposure={product.modelSettings.exposure}
        modelStyle={product.modelSettings.style}
        transparentBackground={product.modelSettings.transparentBackground}
        hotspots={product.previewHotspots}
        enableHotspotPicker={product.enableHotspotPicker}
        onClose={() => setIsPreviewOpen(false)}
      />
    </>
  );
}
