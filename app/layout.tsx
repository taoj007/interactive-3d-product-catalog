import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { createGlobalStyle } from 'styled-components';
import SiteHeader from '@/components/site-header';
import StyledComponentsRegistry from '@/lib/styled-components-registry';
import { designTokens } from '@/lib/design-tokens';

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html {
    background: ${designTokens.background.page};
    overscroll-behavior: none;
    scroll-behavior: smooth;
    scroll-padding-top: 108px;
  }

  body {
    margin: 0;
    min-height: 100vh;
    background: ${designTokens.background.page};
    color: ${designTokens.color.text};
    font-family: Georgia, 'Times New Roman', serif;
    overscroll-behavior: none;
  }

  button,
  input,
  textarea,
  select {
    font: inherit;
  }

  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }
  }
`;

export const metadata: Metadata = {
  title: 'Hearth & Grain | Custom Hardwood Furniture',
  description:
    'Modern classic hardwood furniture made to order, hand finished, and tailored to your home.',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>
          <GlobalStyle />
          <SiteHeader />
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
