'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styled from 'styled-components';
import { designTokens } from '@/lib/design-tokens';

const HeaderShell = styled.div`
  position: absolute;
  top: 88px;
  right: 0;
  left: 0;
  z-index: 20;
  pointer-events: none;

  @media (max-width: 720px) {
    top: 28px;
  }
`;

const HeaderInner = styled.div`
  display: flex;
  justify-content: flex-end;
  width: min(1280px, calc(100% - 32px));
  margin: 0 auto;

  @media (max-width: 720px) {
    width: min(100% - 20px, 1280px);
  }
`;

const HomeLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid rgba(255, 251, 245, 0.34);
  border-radius: 999px;
  background: linear-gradient(
    180deg,
    rgba(250, 245, 237, 0.52),
    rgba(250, 245, 237, 0.34)
  );
  box-shadow: 0 16px 32px rgba(42, 27, 16, 0.1);
  color: inherit;
  text-decoration: none;
  backdrop-filter: blur(22px) saturate(140%);
  -webkit-backdrop-filter: blur(22px) saturate(140%);
  pointer-events: auto;
  transition: transform 180ms ease, opacity 180ms ease;

  &:hover {
    transform: translateY(-1px);
    opacity: 0.92;
  }
`;

const HomeLabel = styled.span`
  color: ${designTokens.color.text};
  font-size: 0.94rem;
  font-weight: 600;
`;

export default function SiteHeader() {
  const pathname = usePathname() ?? '';

  if (pathname === '/') {
    return null;
  }

  return (
    <HeaderShell>
      <HeaderInner>
        <HomeLink href="/" aria-label="Home">
          <HomeLabel>Home</HomeLabel>
        </HomeLink>
      </HeaderInner>
    </HeaderShell>
  );
}
