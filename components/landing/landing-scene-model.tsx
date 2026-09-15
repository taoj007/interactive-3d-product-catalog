'use client';

import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { ModelViewerElement } from '@/types/model-viewer';

let modelViewerLoader: Promise<unknown> | undefined;

const viewerStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'block',
  pointerEvents: 'none',
  background: 'transparent',
  borderRadius: 0,
  filter: 'brightness(0.76) contrast(1.02) saturate(0.94)',
};

const fallbackStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  background: 'transparent',
};

interface LandingSceneModelProps {
  src: string;
  alt: string;
  cameraOrbit: string;
  fieldOfView: string;
  scale: string;
}

export default function LandingSceneModel({
  src,
  alt,
  cameraOrbit,
  fieldOfView,
  scale,
}: LandingSceneModelProps) {
  const elementRef = useRef<ModelViewerElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!modelViewerLoader) {
      modelViewerLoader = import('@google/model-viewer');
    }

    modelViewerLoader.then(() => {
      if (isMounted) {
        setIsReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const element = elementRef.current;

    if (!isReady || !element) {
      return;
    }

    const viewer = element as unknown as Record<string, unknown>;

    viewer.src = src;
    viewer.alt = alt;
    viewer.cameraControls = true;
    viewer.loading = 'eager';
    viewer.reveal = 'auto';
    viewer.environmentImage = 'neutral';
    viewer.shadowIntensity = 1.4;
    viewer.exposure = 0.24;
    viewer.ar = false;
    viewer.disablePan = true;
    viewer.disableZoom = true;
    viewer.disableTap = true;
    viewer.interactionPrompt = 'none';
    viewer.touchAction = 'none';
    viewer.cameraOrbit = cameraOrbit;
    viewer.fieldOfView = fieldOfView;
    viewer.scale = scale;
    element.jumpCameraToGoal?.();
  }, [isReady, src, alt, cameraOrbit, fieldOfView, scale]);

  if (!isReady) {
    return <div aria-hidden="true" style={fallbackStyle} />;
  }

  return <model-viewer ref={elementRef} style={viewerStyle} />;
}
