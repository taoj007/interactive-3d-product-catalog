'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type FocusEvent } from 'react';
import styled from 'styled-components';
import {
  LandingClosingCard,
  LandingDesignPanel,
  LandingHeroCard,
  LandingMaterialsPanel,
  LandingMetricsCard,
  LandingProcessPanel,
} from '@/components/landing/landing-sections';
import ProductModel from '@/components/product-model';
import { designTokens } from '@/lib/design-tokens';
import type { ModelViewerElement } from '@/types/model-viewer';

// Small math helpers used to derive camera motion from scroll progress.
function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function wrapAngle(value: number) {
  const normalized = ((value + 180) % 360 + 360) % 360;
  return normalized - 180;
}

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

function easeInOutCubic(value: number) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

// Landing scene tuning. Phase 1 grows the scene layer from 50% to 100%.
// Phase 2 keeps that size and rotates the camera around the model.
const SCENE_CAMERA_RADIUS = 148;
const SCENE_FIELD_OF_VIEW = 32;
const SCENE_MODEL_SCALE = '1 1 1';
const SCENE_CONTAINER_SCALE_RANGE = { start: 0.5, end: 1 } as const;
const SCENE_SCALE_PHASE_END = 0.42;
const SCENE_MODEL_CONFIG = {
  disablePan: true,
  // disableZoom: true,
  disableTap: true,
  interactionPrompt: 'none',
  touchAction: 'none',
} as const;

interface SceneState {
  progress: number;
  cameraOrbit: string;
  fieldOfView: string;
  containerScale: number;
  glowOneY: number;
  glowTwoY: number;
  beamY: number;
  meshY: number;
  meshX: number;
  markerY: number;
}

function syncSceneModel(model: ModelViewerElement, sceneState: SceneState) {
  model.fieldOfView = sceneState.fieldOfView;
  model.cameraOrbit = sceneState.cameraOrbit;
  model.scale = SCENE_MODEL_SCALE;
  model.jumpCameraToGoal?.();
}

// Converts the sticky scene's scroll travel into a normalized 0..1 progress value.
function getSceneProgress(scene: HTMLElement) {
  const rect = scene.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const sceneTravel = Math.max(scene.offsetHeight - viewportHeight, 1);
  const sceneOffset = clamp(-rect.top, 0, sceneTravel);

  return sceneOffset / sceneTravel;
}

// Derives every animated scene value from one scroll progress number.
// Phase 1 only changes the DOM container scale. Phase 2 only rotates the camera.
function getSceneState(progress: number): SceneState {
  const clampedProgress = clamp(progress, 0, 1);
  const scaleProgress = easeInOutCubic(
    clamp(clampedProgress / SCENE_SCALE_PHASE_END, 0, 1)
  );
  const rotateProgress = easeInOutCubic(
    clamp(
      (clampedProgress - SCENE_SCALE_PHASE_END) / (1 - SCENE_SCALE_PHASE_END),
      0,
      1
    )
  );
  const orbitAngle = wrapAngle(-22 + rotateProgress * 224);
  const polarAngle = 74 - rotateProgress * 12;
  const containerScale = lerp(
    SCENE_CONTAINER_SCALE_RANGE.start,
    SCENE_CONTAINER_SCALE_RANGE.end,
    scaleProgress
  );

  return {
    progress: clampedProgress,
    fieldOfView: `${SCENE_FIELD_OF_VIEW.toFixed(2)}deg`,
    cameraOrbit: `${orbitAngle.toFixed(2)}deg ${polarAngle.toFixed(2)}deg ${SCENE_CAMERA_RADIUS.toFixed(2)}%`,
    containerScale,
    glowOneY: Math.round(clampedProgress * -110),
    glowTwoY: Math.round(clampedProgress * 132),
    beamY: Math.round(clampedProgress * 168),
    meshY: Math.round(clampedProgress * -156),
    meshX: Math.round(clampedProgress * 62),
    markerY: Math.round(clampedProgress * 22),
  };
}

const INITIAL_SCENE_STATE = getSceneState(0);

const PageShell = styled.main`
  position: relative;
  overflow: clip;
`;

// Fixed floating navigation that sits above the full-bleed scene.
const FloatingNavShell = styled.div`
  position: fixed;
  top: 20px;
  right: max(20px, calc(50vw - 640px));
  z-index: 60;
  display: grid;
  justify-items: end;
  gap: 10px;
  padding-bottom: 14px;

  @media (min-width: 1024px) {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-bottom: 0;
  }

  @media (max-width: 720px) {
    top: 52px;
    right: 20px;
    left: 20px;
    justify-items: end;
  }
`;

const FloatingNavButton = styled.button<{ $open?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 44px;
  padding: 0;
  border: 1px solid
    ${({ $open }) =>
      $open ? 'rgba(255, 248, 240, 0.5)' : 'rgba(255, 251, 245, 0.3)'};
  border-radius: 14px;
  background:
    linear-gradient(
      180deg,
      rgba(252, 247, 240, 0.72),
      rgba(250, 245, 237, 0.38)
    ),
    rgba(255, 255, 255, 0.08);
  color: ${designTokens.color.text};
  box-shadow:
    0 20px 44px rgba(42, 27, 16, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.34);
  cursor: pointer;
  backdrop-filter: blur(24px) saturate(140%);
  -webkit-backdrop-filter: blur(24px) saturate(140%);
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease,
    background 180ms ease;

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(255, 248, 240, 0.46);
    background:
      linear-gradient(
        180deg,
        rgba(252, 247, 240, 0.8),
        rgba(250, 245, 237, 0.44)
      ),
      rgba(255, 255, 255, 0.1);
    box-shadow:
      0 24px 48px rgba(42, 27, 16, 0.16),
      inset 0 1px 0 rgba(255, 255, 255, 0.38);
  }

  @media (min-width: 1024px) {
    display: none;
  }
`;

const FloatingNavIcon = styled.span<{ $open?: boolean }>`
  position: relative;
  width: 18px;
  height: 14px;

  &::before,
  &::after,
  span {
    content: '';
    position: absolute;
    left: 0;
    width: 18px;
    height: 2px;
    border-radius: 999px;
    background: ${designTokens.color.text};
    transition:
      transform 180ms ease,
      opacity 180ms ease,
      top 180ms ease;
  }

  &::before {
    top: ${({ $open }) => ($open ? '5px' : '0')};
    transform: ${({ $open }) => ($open ? 'rotate(45deg)' : 'none')};
  }

  &::after {
    top: ${({ $open }) => ($open ? '5px' : '10px')};
    transform: ${({ $open }) => ($open ? 'rotate(-45deg)' : 'none')};
  }

  span {
    top: 5px;
    opacity: ${({ $open }) => ($open ? 0 : 1)};
  }
`;

const FloatingNavMenu = styled.nav<{ $open?: boolean }>`
  position: absolute;
  top: calc(100% + 2px);
  right: 0;
  gap: 10px;
  min-width: 216px;
  padding: 0;
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  visibility: ${({ $open }) => ($open ? 'visible' : 'hidden')};
  pointer-events: ${({ $open }) => ($open ? 'auto' : 'none')};
  transform: ${({ $open }) =>
    $open
      ? 'translate3d(0, 0, 0) scale(1)'
      : 'translate3d(0, -12px, 0) scale(0.985)'};
  transform-origin: top right;
  transition:
    opacity 320ms cubic-bezier(0.22, 1, 0.36, 1)
      ${({ $open }) => ($open ? '80ms' : '0ms')},
    transform 420ms cubic-bezier(0.16, 1, 0.3, 1)
      ${({ $open }) => ($open ? '80ms' : '0ms')},
    visibility 0s linear ${({ $open }) => ($open ? '0s' : '420ms')};

  display: grid;

  @media (min-width: 1024px) {
    position: static;
    display: inline-flex;
    align-items: center;
    min-width: 0;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transform: none;
    transition: none;
  }

  @media (max-width: 720px) {
    width: min(280px, calc(100vw - 40px));
  }
`;

const FloatingNavLink = styled(Link)<{ $open?: boolean; $index: number; $primary?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid
    ${({ $primary }) =>
      $primary ? 'rgba(81, 48, 24, 0.34)' : 'rgba(255, 251, 245, 0.28)'};
  border-radius: 999px;
  background: ${({ $primary }) =>
    $primary
      ? 'linear-gradient(180deg, rgba(77, 46, 25, 0.96), rgba(52, 31, 18, 0.94))'
      : 'linear-gradient(180deg, rgba(250, 245, 237, 0.54), rgba(250, 245, 237, 0.32))'};
  color: ${({ $primary }) => ($primary ? '#fff6ec' : designTokens.color.text)};
  font-size: 0.94rem;
  text-decoration: none;
  box-shadow: ${({ $primary }) =>
    $primary
      ? '0 16px 32px rgba(42, 27, 16, 0.18)'
      : '0 14px 28px rgba(42, 27, 16, 0.1)'};
  backdrop-filter: blur(22px) saturate(140%);
  -webkit-backdrop-filter: blur(22px) saturate(140%);
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  transform: ${({ $open }) =>
    $open ? 'translate3d(0, 0, 0)' : 'translate3d(0, -18px, 0)'};
  transition:
    opacity 280ms cubic-bezier(0.22, 1, 0.36, 1)
      ${({ $open, $index }) => ($open ? `${150 + $index * 95}ms` : '0ms')},
    transform 440ms cubic-bezier(0.16, 1, 0.3, 1)
      ${({ $open, $index }) => ($open ? `${150 + $index * 95}ms` : '0ms')},
    border-color 180ms ease,
    background 180ms ease;

  &:hover {
    transform: translateY(-1px);
    border-color: ${({ $primary }) =>
      $primary ? 'rgba(81, 48, 24, 0.48)' : 'rgba(255, 248, 240, 0.42)'};
    background: ${({ $primary }) =>
      $primary
        ? 'linear-gradient(180deg, rgba(93, 57, 31, 0.98), rgba(58, 35, 20, 0.96))'
        : 'linear-gradient(180deg, rgba(250, 245, 237, 0.62), rgba(250, 245, 237, 0.4))'};
  }

  @media (min-width: 1024px) {
    min-height: 42px;
    padding: 0 18px;
    border-color: ${({ $primary }) =>
      $primary ? 'rgba(81, 48, 24, 0.34)' : 'rgba(255, 248, 240, 0.22)'};
    background: ${({ $primary }) =>
      $primary
        ? 'linear-gradient(180deg, rgba(77, 46, 25, 0.96), rgba(52, 31, 18, 0.94))'
        : 'linear-gradient(180deg, rgba(250, 245, 237, 0.48), rgba(250, 245, 237, 0.28))'};
    opacity: 1;
    transform: none;
    transition:
      transform 180ms ease,
      border-color 180ms ease,
      background 180ms ease;
  }
`;

const SceneShell = styled.section`
  position: relative;
  min-height: 660vh;
  margin: 0 calc(50% - 50vw);

  @media (max-width: 980px) {
    min-height: 620vh;
  }

  @media (max-width: 720px) {
    min-height: 560vh;
  }
`;

// Sticky viewport keeps the background scene fixed while content cards scroll through it.
const StickyViewport = styled.div`
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
`;

// Base painted backdrop for the whole landing scene.
const SceneSurface = styled.div`
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 18%, rgba(242, 188, 129, 0.28), transparent 28%),
    radial-gradient(circle at 82% 24%, rgba(144, 108, 68, 0.18), transparent 32%),
    linear-gradient(180deg, #efe3d2 0%, #dfc9ab 52%, #d3bb9d 100%);
`;

// Soft blurred orb. We render two of these and move them at different rates for depth.
const SceneGlow = styled.div`
  position: absolute;
  border-radius: 999px;
  filter: blur(24px);
  opacity: 0.82;
`;

// Vertical light streak that makes the scene feel less flat.
const SceneBeam = styled.div`
  position: absolute;
  inset: 4% auto auto 52%;
  width: min(34vw, 460px);
  height: min(96vh, 980px);
  border-radius: 999px;
  background: linear-gradient(
    180deg,
    rgba(255, 235, 210, 0.28),
    rgba(183, 127, 74, 0.08)
  );
  filter: blur(18px);
  opacity: 0.74;
`;

// Decorative grid texture that adds structure behind the model.
const SceneMesh = styled.div`
  position: absolute;
  right: -8vw;
  top: 6vh;
  width: min(54vw, 760px);
  height: min(86vh, 900px);
  border-radius: 48px;
  background-image:
    linear-gradient(180deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.02)),
    repeating-linear-gradient(
      135deg,
      rgba(255, 246, 233, 0.12) 0,
      rgba(255, 246, 233, 0.12) 1px,
      transparent 1px,
      transparent 26px
    ),
    repeating-linear-gradient(
      45deg,
      rgba(105, 72, 43, 0.08) 0,
      rgba(105, 72, 43, 0.08) 1px,
      transparent 1px,
      transparent 28px
    );
  mask-image: radial-gradient(circle at center, black 24%, transparent 76%);
  opacity: 0.56;
`;

// Full-screen 3D model layer. ProductModel handles the actual model-viewer setup.
const SceneModel = styled(ProductModel)`
  width: 100%;
  height: 100%;
  pointer-events: none;
  border-radius: 0;
  background: transparent;
  filter: brightness(0.76) contrast(1.02) saturate(0.94);
`;

// Dark vignette and top/bottom shading so text and the model read against the bright backdrop.
const SceneShade = styled.div`
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      180deg,
      rgba(18, 12, 8, 0.18),
      rgba(18, 12, 8, 0.06) 24%,
      rgba(18, 12, 8, 0.24)
    ),
    radial-gradient(circle at center, transparent 26%, rgba(18, 12, 8, 0.18) 100%);
`;

// Small explanatory label in the top-left of the scene.
const SceneMarker = styled.div`
  position: absolute;
  top: 24px;
  left: max(24px, calc(50vw - 620px));
  z-index: 1;
  display: grid;
  gap: 6px;
  max-width: 21rem;

  @media (max-width: 720px) {
    top: 52px;
    left: 20px;
    right: 20px;
  }
`;

const SceneMarkerEyebrow = styled.p`
  margin: 0;
  color: rgba(255, 244, 230, 0.92);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
`;

const SceneMarkerCopy = styled.p`
  margin: 0;
  color: rgba(255, 239, 221, 0.82);
  font-size: 0.9rem;
  line-height: 1.62;
`;

const SceneBadgeDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #f1b37a;
`;

// Bottom-left material / craft badge that stays pinned to the scene.
const SceneFooterPill = styled.div`
  position: absolute;
  left: max(24px, calc(50vw - 620px));
  bottom: 30px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid rgba(255, 247, 236, 0.18);
  border-radius: 999px;
  background: rgba(31, 21, 14, 0.42);
  color: rgba(255, 240, 223, 0.88);
  font-size: 0.9rem;
  z-index: 1;
  backdrop-filter: blur(16px);

  @media (max-width: 720px) {
    left: 20px;
    bottom: 24px;
    right: 20px;
    justify-content: center;
  }
`;

// Foreground content rail. These cards scroll over the sticky background scene.
const ForegroundRail = styled.div`
  position: relative;
  z-index: 2;
  width: min(1280px, calc(100% - 32px));
  margin: 0 auto;
  padding: 14vh 0 34vh;
  display: grid;
  gap: 24vh;

  @media (max-width: 720px) {
    width: min(100% - 20px, 1280px);
    padding: 14vh 0 28vh;
    gap: 17vh;
  }
`;

// Slight lateral offsets break the rail out of a perfectly straight stack.
const ForegroundItem = styled.div<{ $offsetX?: number }>`
  position: relative;
  scroll-margin-top: 112px;
  transform: translate3d(${({ $offsetX = 0 }) => `${$offsetX}px`}, 0, 0);

  @media (max-width: 980px) {
    transform: translate3d(
      ${({ $offsetX = 0 }) => `${Math.round($offsetX * 0.45)}px`},
      0,
      0
    );
  }

  @media (max-width: 720px) {
    transform: none;
  }
`;

const ClosingForegroundItem = styled(ForegroundItem)`
  margin-top: 145vh;

  @media (max-width: 720px) {
    margin-top: 130vh;
  }
`;

const BackToTopButton = styled.button<{ $visible?: boolean }>`
  position: fixed;
  right: max(20px, calc(50vw - 640px));
  bottom: 24px;
  z-index: 60;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  padding: 0;
  border: 1px solid rgba(81, 48, 24, 0.32);
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(77, 46, 25, 0.96), rgba(52, 31, 18, 0.94));
  color: #fff6ec;
  font-size: 1.35rem;
  line-height: 1;
  box-shadow: 0 18px 36px rgba(42, 27, 16, 0.2);
  cursor: pointer;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};
  transform: ${({ $visible }) =>
    $visible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 14px, 0)'};
  transition:
    opacity 180ms ease,
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;

  &:hover {
    transform: ${({ $visible }) =>
      $visible ? 'translate3d(0, -2px, 0)' : 'translate3d(0, 14px, 0)'};
    border-color: rgba(81, 48, 24, 0.48);
    box-shadow: 0 22px 42px rgba(42, 27, 16, 0.24);
  }

  @media (max-width: 720px) {
    right: 20px;
    bottom: 20px;
    width: 48px;
    height: 48px;
  }
`;

export default function HomePage() {
  const sceneModelRef = useRef<ModelViewerElement | null>(null);
  const sceneRef = useRef<HTMLElement | null>(null);
  const navCloseTimerRef = useRef<number | null>(null);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [sceneProgress, setSceneProgress] = useState(INITIAL_SCENE_STATE.progress);
  const sceneState = getSceneState(sceneProgress);

  // When scroll-derived scene values change, push them directly into model-viewer.
  useEffect(() => {
    const model = sceneModelRef.current;

    if (model) {
      syncSceneModel(model, sceneState);
    }
  }, [sceneState]);

  const handleSceneModelReady = useCallback(
    (element: ModelViewerElement) => {
      sceneModelRef.current = element;
      syncSceneModel(element, sceneState);
    },
    [sceneState]
  );

  const openNav = useCallback(() => {
    if (navCloseTimerRef.current) {
      window.clearTimeout(navCloseTimerRef.current);
      navCloseTimerRef.current = null;
    }

    setIsNavOpen(true);
  }, []);

  const closeNav = useCallback(() => {
    if (navCloseTimerRef.current) {
      window.clearTimeout(navCloseTimerRef.current);
    }

    navCloseTimerRef.current = window.setTimeout(() => {
      setIsNavOpen(false);
      navCloseTimerRef.current = null;
    }, 220);
  }, []);

  const handleNavBlur = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
        return;
      }

      closeNav();
    },
    [closeNav]
  );

  const handleBackToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  // One rAF-driven scroll listener updates the normalized scene progress.
  useEffect(() => {
    return () => {
      if (navCloseTimerRef.current) {
        window.clearTimeout(navCloseTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let frameId = 0;

    const updateSceneProgress = () => {
      frameId = 0;
      const scene = sceneRef.current;

      if (!scene) {
        return;
      }

      const nextProgress = getSceneProgress(scene);

      setSceneProgress(nextProgress);
      setShowBackToTop((visible) => {
        const nextVisible = nextProgress > 0.68;

        return visible === nextVisible ? visible : nextVisible;
      });
    };

    const requestUpdate = () => {
      if (frameId) {
        return;
      }

      frameId = window.requestAnimationFrame(updateSceneProgress);
    };

    requestUpdate();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, []);

  return (
    <PageShell>
      <FloatingNavShell onMouseEnter={openNav} onMouseLeave={closeNav} onFocus={openNav} onBlur={handleNavBlur}>
        <FloatingNavButton
          type="button"
          aria-expanded={isNavOpen}
          aria-controls="landing-nav"
          aria-label="Open navigation menu"
          $open={isNavOpen}
        >
          <FloatingNavIcon $open={isNavOpen}>
            <span />
          </FloatingNavIcon>
        </FloatingNavButton>

        <FloatingNavMenu id="landing-nav" aria-label="Landing navigation" $open={isNavOpen}>
          <FloatingNavLink
            href="/product-list"
            onClick={closeNav}
            $open={isNavOpen}
            $index={0}
            $primary
          >
            Collection
          </FloatingNavLink>
          <FloatingNavLink href="#custom-design" onClick={closeNav} $open={isNavOpen} $index={1}>
            Custom Design
          </FloatingNavLink>
          <FloatingNavLink href="#hardwood-options" onClick={closeNav} $open={isNavOpen} $index={2}>
            Hardwood Options
          </FloatingNavLink>
          <FloatingNavLink href="#build-steps" onClick={closeNav} $open={isNavOpen} $index={3}>
            Build Steps
          </FloatingNavLink>
        </FloatingNavMenu>
      </FloatingNavShell>

      <BackToTopButton
        type="button"
        aria-label="Move to top"
        onClick={handleBackToTop}
        $visible={showBackToTop}
      >
        ↑
      </BackToTopButton>

      <SceneShell ref={sceneRef}>
        <StickyViewport>
          <SceneSurface />

          {/* Two floating glow orbs create warm depth behind the model. */}
          <SceneGlow
            style={{
              top: '-12vh',
              left: '-10vw',
              width: '34rem',
              height: '34rem',
              background:
                'radial-gradient(circle at center, rgba(233, 177, 117, 0.56), rgba(233, 177, 117, 0))',
              transform: `translate3d(0, ${sceneState.glowOneY}px, 0)`,
            }}
          />
          <SceneGlow
            style={{
              right: '-8vw',
              top: '34vh',
              width: '32rem',
              height: '32rem',
              background:
                'radial-gradient(circle at center, rgba(122, 90, 57, 0.34), rgba(122, 90, 57, 0))',
              transform: `translate3d(0, ${sceneState.glowTwoY}px, 0)`,
            }}
          />
          {/* Beam = soft directional light. Mesh = subtle texture plane. */}
          <SceneBeam
            style={{
              transform: `translate3d(0, ${sceneState.beamY}px, 0) rotate(12deg)`,
            }}
          />
          <SceneMesh
            style={{
              transform: `translate3d(${sceneState.meshX}px, ${sceneState.meshY}px, 0) rotate(-10deg)`,
            }}
          />

          {/* The actual 3D model layer. All camera motion comes from sceneState. */}
          <SceneModel
            ref={sceneModelRef}
            src="/models/10089_Table-90x90_textured.glb"
            alt="Textured 90 by 90 hardwood table rotating through a full-page parallax showroom"
            mode="detail"
            style={{
              transform: `scale(${sceneState.containerScale})`,
              transformOrigin: 'center center',
            }}
            cameraOrbit={INITIAL_SCENE_STATE.cameraOrbit}
            fieldOfView={INITIAL_SCENE_STATE.fieldOfView}
            transparentBackground
            shadowIntensity={1.4}
            exposure={0.24}
            ar={false}
            onReady={handleSceneModelReady}
            config={SCENE_MODEL_CONFIG}
            scale={SCENE_MODEL_SCALE}
          />

          <SceneShade />

          {/* Lightweight scene UI pinned over the background layer. */}
          <SceneMarker
            style={{
              transform: `translate3d(0, ${sceneState.markerY}px, 0)`,
            }}
          >
            <SceneMarkerEyebrow>Made To Order</SceneMarkerEyebrow>
            <SceneMarkerCopy>Custom hardwood furniture.</SceneMarkerCopy>
          </SceneMarker>
        </StickyViewport>

        <ForegroundRail>
          <ForegroundItem $offsetX={-18}>
            <LandingHeroCard />
          </ForegroundItem>
          <ForegroundItem $offsetX={58}>
            <LandingMetricsCard />
          </ForegroundItem>
          <ForegroundItem id="custom-design" $offsetX={-42}>
            <LandingDesignPanel />
          </ForegroundItem>
          <ForegroundItem id="hardwood-options" $offsetX={64}>
            <LandingMaterialsPanel />
          </ForegroundItem>
          <ForegroundItem id="build-steps" $offsetX={18}>
            <LandingProcessPanel />
          </ForegroundItem>
          <ClosingForegroundItem $offsetX={0}>
            <LandingClosingCard />
          </ClosingForegroundItem>
        </ForegroundRail>
      </SceneShell>
    </PageShell>
  );
}
