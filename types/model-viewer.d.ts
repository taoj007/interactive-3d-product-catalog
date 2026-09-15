import type * as React from 'react';

export interface ModelViewerVector2 {
  u: number;
  v: number;
}

export interface ModelViewerVector3 {
  x: number;
  y: number;
  z: number;
}

export interface ModelViewerElement extends HTMLElement {
  src: string | null;
  alt: string | null;
  poster?: string | null;
  loading?: 'lazy' | 'eager' | 'auto';
  cameraOrbit?: string;
  cameraTarget?: string;
  fieldOfView?: string;
  scale?: string;
  shadowIntensity?: number;
  exposure?: number;
  autoRotate?: boolean;
  autoRotateDelay?: number;
  rotationPerSecond?: string;
  ar?: boolean;
  variantName?: string | null;
  play?: () => void;
  pause?: () => void;
  dismissPoster?: () => void;
  activateAR?: () => Promise<void>;
  getCameraOrbit?: () => unknown;
  jumpCameraToGoal?: () => void;
  positionAndNormalFromPoint?: (
    pixelX: number,
    pixelY: number
  ) => {
    position: ModelViewerVector3;
    normal: ModelViewerVector3;
    uv: ModelViewerVector2 | null;
  } | null;
  surfaceFromPoint?: (pixelX: number, pixelY: number) => string | null;
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<ModelViewerElement>,
        ModelViewerElement
      >;
    }
  }
}
