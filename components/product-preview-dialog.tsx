'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';
import ProductModel from '@/components/product-model';
import { designTokens } from '@/lib/design-tokens';
import type {
  ModelViewerElement,
  ModelViewerVector3,
} from '@/types/model-viewer';
import type { ProductPreviewHotspot } from '@/types/catalog';
const hintFade = keyframes`
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(-6px);
  }

  12%,
  68% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }

  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-8px);
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(26, 18, 12, 0.62);
  backdrop-filter: blur(10px);

  @media (max-width: 720px) {
    padding: 16px;
  }
`;

const Dialog = styled.div`
  width: min(1040px, 100%);
  max-height: min(92vh, 900px);
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(280px, 0.8fr);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 32px;
  background: rgba(254, 250, 244, 0.96);
  box-shadow: 0 34px 90px rgba(24, 16, 11, 0.28);

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
    max-height: 92vh;
  }
`;

const ViewerPanel = styled.div`
  position: relative;
  display: grid;
  min-height: 520px;
  padding: 28px;
  background:
    radial-gradient(circle at top, rgba(200, 111, 49, 0.12), transparent 42%),
    linear-gradient(180deg, rgba(255, 249, 240, 0.98), rgba(245, 234, 216, 0.88));

  @media (max-width: 860px) {
    min-height: 420px;
    padding: 18px 18px 10px;
  }

  @media (max-width: 560px) {
    min-height: 360px;
  }
`;

const ViewerFrame = styled.div`
  position: relative;
  isolation: isolate;
  min-height: 464px;
  overflow: hidden;
  border: 1px solid rgba(35, 28, 20, 0.08);
  border-radius: 24px;
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

  @media (max-width: 860px) {
    min-height: 392px;
    border-radius: 22px;
  }

  @media (max-width: 560px) {
    min-height: 332px;
  }
`;

const ViewerHint = styled.div`
  position: absolute;
  top: 24px;
  left: 50%;
  z-index: 1;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(35, 28, 20, 0.08);
  background: rgba(255, 252, 247, 0.72);
  color: ${designTokens.color.muted};
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  pointer-events: none;
  backdrop-filter: blur(6px);
  animation: ${hintFade} 2.8s ease forwards;

  @media (max-width: 860px) {
    top: 16px;
  }
`;

const Hotspot = styled.div`
  display: grid;
  gap: 6px;
  max-width: 180px;
  pointer-events: none;
  transform: translateY(-6px);
`;

const HotspotDot = styled.span`
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.96);
  border-radius: 999px;
  background: ${designTokens.color.accent};
  box-shadow: 0 0 0 6px rgba(200, 111, 49, 0.16);
`;

const HotspotCard = styled.div`
  padding: 10px 12px;
  border: 1px solid rgba(35, 28, 20, 0.08);
  border-radius: 16px;
  background: rgba(255, 252, 247, 0.84);
  box-shadow: 0 12px 24px rgba(24, 16, 11, 0.12);
  backdrop-filter: blur(10px);
`;

const HotspotLabel = styled.div`
  color: ${designTokens.color.text};
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.2;
`;

const HotspotText = styled.div`
  margin-top: 4px;
  color: ${designTokens.color.muted};
  font-size: 0.72rem;
  line-height: 1.45;
`;

const DetailsPanel = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 28px;
  padding: 28px 28px 24px;
  background: rgba(255, 252, 247, 0.94);

  @media (max-width: 860px) {
    gap: 20px;
    padding: 0 18px 18px;
  }
`;

const DevPanel = styled.div`
  display: grid;
  gap: 12px;
  padding: 16px 18px;
  border: 1px solid rgba(35, 28, 20, 0.08);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.66);
`;

const DevHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const DevTitle = styled.div`
  color: ${designTokens.color.text};
  font-size: 0.92rem;
  font-weight: 700;
`;

const DevActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const DevButton = styled.button<{ $active?: boolean }>`
  padding: 10px 12px;
  border: 1px solid
    ${({ $active }) =>
      $active ? designTokens.color.accentDeep : 'rgba(35, 28, 20, 0.1)'};
  border-radius: 999px;
  background: ${({ $active }) =>
    $active ? 'rgba(200, 111, 49, 0.12)' : 'rgba(255, 252, 247, 0.92)'};
  color: ${({ $active }) =>
    $active ? designTokens.color.accentDeep : designTokens.color.text};
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 700;
  transition: background 140ms ease, border-color 140ms ease;
`;

const DevCopyButton = styled(DevButton)`
  color: ${designTokens.color.muted};
`;

const DevText = styled.p`
  margin: 0;
  color: ${designTokens.color.muted};
  font-size: 0.82rem;
  line-height: 1.55;
`;

const DevStatus = styled.p`
  margin: 0;
  color: ${designTokens.color.accentDeep};
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const DevCode = styled.pre`
  margin: 0;
  padding: 12px 14px;
  overflow: auto;
  border-radius: 16px;
  background: rgba(33, 26, 18, 0.92);
  color: rgba(255, 250, 242, 0.96);
  font-size: 0.76rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
`;

const TitleBlock = styled.div`
  min-width: 0;
`;

const Eyebrow = styled.span`
  display: inline-block;
  margin-bottom: 12px;
  color: ${designTokens.color.accentDeep};
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
`;

const Title = styled.h2`
  margin: 0;
  font-size: clamp(2rem, 4vw, 2.8rem);
  line-height: 0.98;
  letter-spacing: -0.04em;
`;

const Subtitle = styled.p`
  margin: 14px 0 0;
  color: ${designTokens.color.muted};
  line-height: 1.7;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 560px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Price = styled.strong`
  font-size: 1.4rem;
`;

const DoneButton = styled.button`
  padding: 14px 18px;
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
`;

interface HotspotPickResult {
  position: string;
  normal: string;
  surface: string | null;
  snippet: string;
}

interface ProductPreviewDialogProps {
  isOpen: boolean;
  name: string;
  subtitle: string;
  price: string;
  modelSrc: string;
  cameraOrbit?: string;
  cameraTarget?: string;
  fieldOfView?: string;
  shadowIntensity?: number;
  exposure?: number;
  modelStyle?: CSSProperties;
  transparentBackground?: boolean;
  hotspots?: ProductPreviewHotspot[];
  enableHotspotPicker?: boolean;
  onClose: () => void;
}

export default function ProductPreviewDialog({
  isOpen,
  name,
  subtitle,
  price,
  modelSrc,
  cameraOrbit,
  cameraTarget,
  fieldOfView,
  shadowIntensity,
  exposure,
  modelStyle,
  transparentBackground,
  hotspots = [],
  enableHotspotPicker = false,
  onClose,
}: ProductPreviewDialogProps) {
  const showHotspotPicker =
    process.env.NODE_ENV !== 'production' && enableHotspotPicker;
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<ModelViewerElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const [pickerArmed, setPickerArmed] = useState(false);
  const [pickResult, setPickResult] = useState<HotspotPickResult | null>(null);
  const [pickMessage, setPickMessage] = useState<string | null>(null);

  const formatMeters = (value: number) => `${value.toFixed(3)}m`;
  const formatVector = (vector: ModelViewerVector3) =>
    `${formatMeters(vector.x)} ${formatMeters(vector.y)} ${formatMeters(vector.z)}`;

  const closePreview = useCallback(() => {
    setPickerArmed(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closePreview();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const dialog = dialogRef.current;

      if (!dialog) {
        return;
      }

      const focusableElements = dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const focusTargets = Array.from(focusableElements).filter(
        (element) => !element.hasAttribute('aria-hidden')
      );

      if (focusTargets.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement = focusTargets[0];
      const lastElement = focusTargets[focusTargets.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [isOpen, closePreview]);

  const handlePickHotspot = () => {
    if (!showHotspotPicker) {
      return;
    }

    const nextArmed = !pickerArmed;
    setPickerArmed(nextArmed);
    setPickMessage(
      nextArmed
        ? 'Click the model once to capture an anchor.'
        : 'Picker canceled.'
    );
  };

  const handleCopyPick = async () => {
    if (!pickResult?.snippet || typeof navigator === 'undefined') {
      return;
    }

    await navigator.clipboard.writeText(pickResult.snippet);
    setPickMessage('Copied hotspot snippet to clipboard.');
  };

  const handleViewerClick = (event: MouseEvent<ModelViewerElement>) => {
    if (!showHotspotPicker || !pickerArmed) {
      return;
    }

    const viewer = viewerRef.current;

    if (!viewer?.positionAndNormalFromPoint) {
      setPickerArmed(false);
      setPickMessage('Picker is unavailable on this viewer instance.');
      return;
    }

    const hit = viewer.positionAndNormalFromPoint(event.clientX, event.clientY);

    if (!hit) {
      setPickMessage('No model surface found. Click directly on the geometry.');
      return;
    }

    const surface = viewer.surfaceFromPoint?.(event.clientX, event.clientY) ?? null;
    const position = formatVector(hit.position);
    const normal = formatVector(hit.normal);
    const snippet = [
      '{',
      "  id: 'new-hotspot',",
      "  label: 'New Detail',",
      "  text: 'Describe the feature here.',",
      `  position: '${position}',`,
      `  normal: '${normal}',`,
      ...(surface ? [`  surface: '${surface}',`] : []),
      '}',
    ].join('\n');

    setPickResult({
      position,
      normal,
      surface,
      snippet,
    });
    setPickerArmed(false);
    setPickMessage('Hotspot captured. Copy the snippet below into your product data.');
  };

  if (typeof document === 'undefined' || !isOpen) {
    return null;
  }

  return createPortal(
    <Overlay
      onMouseDown={(event) =>
        event.target === event.currentTarget && closePreview()
      }
    >
      <Dialog
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <ViewerPanel>
          <ViewerFrame>
            <ProductModel
              ref={viewerRef}
              src={modelSrc}
              alt={name}
              mode="detail"
              cameraOrbit={cameraOrbit}
              cameraTarget={cameraTarget}
              fieldOfView={fieldOfView}
              shadowIntensity={shadowIntensity}
              exposure={exposure}
              transparentBackground={transparentBackground}
              zoomEnabled
              onClick={handleViewerClick}
              style={{
                ...modelStyle,
                cursor: pickerArmed ? 'crosshair' : modelStyle?.cursor,
              }}
            >
              <div slot="progress-bar" />
              {hotspots.map((hotspot) => (
                <Hotspot
                  key={hotspot.id}
                  slot={`hotspot-${hotspot.id}`}
                  data-position={hotspot.position}
                  data-normal={hotspot.normal}
                  data-surface={hotspot.surface}
                  aria-hidden="true"
                >
                  <HotspotDot />
                  <HotspotCard>
                    <HotspotLabel>{hotspot.label}</HotspotLabel>
                    {hotspot.text ? <HotspotText>{hotspot.text}</HotspotText> : null}
                  </HotspotCard>
                </Hotspot>
              ))}
            </ProductModel>
          </ViewerFrame>
          <ViewerHint>Drag And Wheel To Inspect</ViewerHint>
        </ViewerPanel>

        <DetailsPanel>
          <Header>
            <TitleBlock>
              <Eyebrow>Product Preview</Eyebrow>
              <Title id={titleId}>{name}</Title>
              <Subtitle>{subtitle}</Subtitle>
            </TitleBlock>
          </Header>

          {showHotspotPicker ? (
            <DevPanel>
              <DevHeader>
                <DevTitle>Hotspot Picker</DevTitle>
                <DevActions>
                  <DevButton type="button" $active={pickerArmed} onClick={handlePickHotspot}>
                    {pickerArmed ? 'Cancel Pick' : 'Pick Hotspot'}
                  </DevButton>
                  {pickResult ? (
                    <DevCopyButton type="button" onClick={handleCopyPick}>
                      Copy Result
                    </DevCopyButton>
                  ) : null}
                </DevActions>
              </DevHeader>
              <DevText>
                Arm the picker, then click the model once. It captures both
                `position`/`normal` and the surface anchor so you can keep the
                one that fits your workflow.
              </DevText>
              {pickMessage ? <DevStatus>{pickMessage}</DevStatus> : null}
              {pickResult ? <DevCode>{pickResult.snippet}</DevCode> : null}
            </DevPanel>
          ) : null}

          <Footer>
            <Price>{price}</Price>
            <DoneButton ref={closeButtonRef} type="button" onClick={closePreview}>
              Close Detail
            </DoneButton>
          </Footer>
        </DetailsPanel>
      </Dialog>
    </Overlay>,
    document.body
  );
}
