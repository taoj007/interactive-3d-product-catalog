'use client';

import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import {
  forwardRef,
  useEffect,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import { designTokens } from '@/lib/design-tokens';
import type { ModelViewerElement } from '@/types/model-viewer';

const Fallback = styled.div<{ $transparentBackground?: boolean }>`
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  border-radius: 20px;
  overflow: hidden;
  background: ${({ $transparentBackground }) =>
    $transparentBackground ? 'transparent' : designTokens.background.viewer};
  color: ${designTokens.color.muted};
  font-size: 0.95rem;
`;

const MODEL_PRESETS = {
  card: {
    cameraControls: true,
    touchAction: 'pan-y',
    interactionPrompt: 'none',
    disablePan: true,
    disableZoom: true,
    disableTap: false,
    loading: 'lazy',
    reveal: 'auto',
    environmentImage: 'neutral',
    shadowIntensity: 0.3,
    exposure: 0.92,
    autoRotate: false,
    ar: false,
  },
  detail: {
    cameraControls: true,
    touchAction: 'none',
    interactionPrompt: 'auto',
    disablePan: false,
    disableZoom: false,
    disableTap: false,
    loading: 'eager',
    reveal: 'auto',
    environmentImage: 'neutral',
    shadowIntensity: 0.45,
    exposure: 1,
    autoRotate: false,
    ar: true,
  },
} as const;

let modelViewerLoader: Promise<unknown> | undefined;

type ModelMode = keyof typeof MODEL_PRESETS;
type ModelViewerEventHandler = (
  event: Event,
  element: ModelViewerElement
) => void;
type NativeModelViewerProps = Omit<
  HTMLAttributes<ModelViewerElement>,
  'children' | 'onLoad' | 'onError' | 'onProgress'
>;

interface ViewerBaseProps extends NativeModelViewerProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface ProductModelProps extends NativeModelViewerProps {
  src: string;
  alt: string;
  mode?: ModelMode;
  className?: string;
  style?: CSSProperties;
  transparentBackground?: boolean;
  fallback?: ReactNode;
  children?: ReactNode;
  poster?: string;
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
  zoomEnabled?: boolean;
  ar?: boolean;
  variantName?: string;
  config?: Record<string, unknown>;
  onReady?: (element: ModelViewerElement) => void;
  onProgress?: ModelViewerEventHandler;
  onLoad?: ModelViewerEventHandler;
  onError?: ModelViewerEventHandler;
  onCameraChange?: ModelViewerEventHandler;
  onVariantApplied?: ModelViewerEventHandler;
}

export type ProductModelSettings = Pick<
  ProductModelProps,
  | 'mode'
  | 'style'
  | 'transparentBackground'
  | 'cameraOrbit'
  | 'cameraTarget'
  | 'fieldOfView'
  | 'scale'
  | 'shadowIntensity'
  | 'exposure'
  | 'autoRotate'
  | 'autoRotateDelay'
  | 'rotationPerSecond'
  | 'zoomEnabled'
>;

function attachEvent(
  element: ModelViewerElement,
  eventName: string,
  handler?: ModelViewerEventHandler
) {
  if (!handler) {
    return () => {};
  }

  const listener = (event: Event) => {
    handler(event, element);
  };

  element.addEventListener(eventName, listener);

  return () => {
    element.removeEventListener(eventName, listener);
  };
}

function mergeDefined(
  baseProps: Record<string, unknown>,
  overrideProps: Record<string, unknown>
) {
  const nextProps = { ...baseProps };

  Object.entries(overrideProps).forEach(([key, value]) => {
    if (value !== undefined) {
      nextProps[key] = value;
    }
  });

  return nextProps;
}

const ViewerBase = forwardRef<ModelViewerElement, ViewerBaseProps>(
  function ViewerBase({ children, ...props }, ref) {
    return (
      <model-viewer ref={ref} {...props}>
        {children}
      </model-viewer>
    );
  }
);

const Viewer = styled(ViewerBase)<{ $transparentBackground?: boolean }>`
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 20px;
  overflow: hidden;
  contain: layout paint style;
  background: ${({ $transparentBackground }) =>
    $transparentBackground ? 'transparent' : designTokens.background.viewer};
`;

const ProductModel = forwardRef<ModelViewerElement, ProductModelProps>(
  function ProductModel(
    {
      src,
      alt,
      mode = 'card',
      className,
      style,
      transparentBackground = false,
      fallback = 'Loading 3D preview...',
      children,
      poster,
      loading,
      cameraOrbit,
      cameraTarget,
      fieldOfView,
      scale,
      shadowIntensity,
      exposure,
      autoRotate,
      autoRotateDelay,
      rotationPerSecond,
      zoomEnabled,
      ar,
      variantName,
      config = {},
      onReady,
      onProgress,
      onLoad,
      onError,
      onCameraChange,
      onVariantApplied,
      ...rest
    },
    forwardedRef
  ) {
    const [isReady, setIsReady] = useState(false);
    const elementRef = useRef<ModelViewerElement | null>(null);

    useEffect(() => {
      if (!forwardedRef) {
        return;
      }

      if (typeof forwardedRef === 'function') {
        forwardedRef(elementRef.current);
        return;
      }

      forwardedRef.current = elementRef.current;
    });

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
        return undefined;
      }

      const detachHandlers = [
        attachEvent(element, 'progress', onProgress),
        attachEvent(element, 'load', onLoad),
        attachEvent(element, 'error', onError),
        attachEvent(element, 'camera-change', onCameraChange),
        attachEvent(element, 'variant-applied', onVariantApplied),
      ];

      return () => {
        detachHandlers.forEach((detach) => detach());
      };
    }, [
      isReady,
      onProgress,
      onLoad,
      onError,
      onCameraChange,
      onVariantApplied,
    ]);

    useEffect(() => {
      const element = elementRef.current;

      if (!isReady || !element) {
        return;
      }

      onReady?.(element);
    }, [isReady, onReady]);

    useEffect(() => {
      const element = elementRef.current;

      if (!isReady || !element) {
        return;
      }

      const preset = MODEL_PRESETS[mode] ?? MODEL_PRESETS.card;
      const viewerProps = mergeDefined({ ...preset, ...config }, {
        src,
        alt,
        poster,
        loading,
        cameraOrbit,
        cameraTarget,
        fieldOfView,
        scale,
        shadowIntensity,
        exposure,
        autoRotate,
        autoRotateDelay,
        rotationPerSecond,
        disableZoom: zoomEnabled === undefined ? undefined : !zoomEnabled,
        ar,
        variantName,
      });

      Object.entries(viewerProps).forEach(([key, value]) => {
        (element as unknown as Record<string, unknown>)[key] = value;
      });
    }, [
      isReady,
      src,
      alt,
      mode,
      poster,
      loading,
      cameraOrbit,
      cameraTarget,
      fieldOfView,
      scale,
      shadowIntensity,
      exposure,
      autoRotate,
      autoRotateDelay,
      rotationPerSecond,
      zoomEnabled,
      ar,
      variantName,
      config,
    ]);

    if (!isReady) {
      return (
        <Fallback $transparentBackground={transparentBackground} style={style}>
          {fallback}
        </Fallback>
      );
    }

    return (
      <Viewer
        ref={elementRef}
        className={className}
        style={style}
        $transparentBackground={transparentBackground}
        {...rest}
      >
        {children}
      </Viewer>
    );
  }
);

export default ProductModel;
