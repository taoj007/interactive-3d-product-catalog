import Link from 'next/link';
import { css } from 'styled-components';
import styled from 'styled-components';
import { designTokens } from '@/lib/design-tokens';

export type LandingCardAlign = 'left' | 'right' | 'center';
export type LandingCardWidth = 'medium' | 'wide' | 'hero';

function getCardWidth(width: LandingCardWidth = 'medium') {
  if (width === 'hero') {
    return 'min(41rem, 100%)';
  }

  if (width === 'wide') {
    return 'min(58rem, 100%)';
  }

  return 'min(32rem, 100%)';
}

export const landingCardSurface = css`
  border: 1px solid rgba(255, 251, 245, 0.34);
  border-radius: 30px;
  background: linear-gradient(
    180deg,
    rgba(250, 245, 237, 0.58),
    rgba(250, 245, 237, 0.36)
  );
  box-shadow: 0 24px 48px rgba(24, 16, 10, 0.14);
  backdrop-filter: blur(14px) saturate(135%);
  -webkit-backdrop-filter: blur(14px) saturate(135%);
`;

export const LandingCard = styled.article<{
  $align?: LandingCardAlign;
  $width?: LandingCardWidth;
}>`
  width: ${({ $width }) => getCardWidth($width)};
  padding: 24px 22px 26px;
  ${landingCardSurface}
  ${({ $align }) =>
    $align === 'right'
      ? 'margin-left: auto;'
      : $align === 'center'
        ? 'margin-left: auto; margin-right: auto;'
        : ''}

  @media (max-width: 720px) {
    width: 100%;
    margin-left: 0;
    margin-right: 0;
    padding: 24px 20px;
  }
`;

export const LandingEyebrow = styled.p`
  margin: 0 0 12px;
  color: ${designTokens.color.accentDeep};
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
`;

export const LandingTitle = styled.h2`
  margin: 0;
  font-size: clamp(1.55rem, 3vw, 2.2rem);
  line-height: 1.02;
  letter-spacing: -0.04em;
`;

export const LandingCopy = styled.p`
  margin: 16px 0 0;
  color: ${designTokens.color.muted};
  font-size: 1rem;
  line-height: 1.76;
`;

export const LandingHeroTitle = styled.h1`
  max-width: 11ch;
  margin: 0;
  font-size: clamp(2.35rem, 5.8vw, 4.9rem);
  line-height: 0.94;
  letter-spacing: -0.05em;
`;

export const LandingHeroCopy = styled.p`
  max-width: 35rem;
  margin: 14px 0 0;
  color: ${designTokens.color.muted};
  font-size: 0.98rem;
  line-height: 1.72;
`;

export const LandingActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 22px;
`;

export const LandingPrimaryAction = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 54px;
  padding: 0 24px;
  border-radius: 999px;
  background: linear-gradient(180deg, #d88343 0%, #b46228 100%);
  color: #fff9f1;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 18px 34px rgba(140, 71, 24, 0.18);
  transition: transform 180ms ease, box-shadow 180ms ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 22px 40px rgba(140, 71, 24, 0.22);
  }
`;

export const LandingSecondaryAction = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 54px;
  padding: 0 24px;
  border: 1px solid rgba(35, 28, 20, 0.1);
  border-radius: 999px;
  background: rgba(255, 252, 247, 0.7);
  color: ${designTokens.color.text};
  font-size: 1rem;
  text-decoration: none;
  backdrop-filter: blur(14px);
  transition: transform 180ms ease, border-color 180ms ease;

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(140, 71, 24, 0.18);
  }
`;
