import type { Metadata } from 'next';
import styled from 'styled-components';
import ProductCard from '@/components/product-card';
import { getCatalogProducts, getFeaturedCatalogProduct } from '@/lib/catalog-products';
import { designTokens } from '@/lib/design-tokens';

export const metadata: Metadata = {
  title: 'Collection | Hearth & Grain',
  description:
    'Browse made-to-order hardwood tables, chairs, and outdoor pieces from Hearth & Grain.',
};

const PageShell = styled.main`
  width: min(1280px, calc(100% - 32px));
  margin: 0 auto;
  padding: 56px 0 72px;

  @media (max-width: 720px) {
    width: min(100% - 20px, 1280px);
    padding: 32px 0 48px;
  }
`;

const Hero = styled.section`
  padding: 24px min(10rem, 20vw) 38px 0;

  @media (max-width: 720px) {
    padding: 8px 0 32px;
  }
`;

const Eyebrow = styled.p`
  margin: 0 0 12px;
  color: ${designTokens.color.accentDeep};
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
`;

const HeroTitle = styled.h1`
  max-width: 22ch;
  margin: 0;
  font-size: clamp(2.35rem, 5.8vw, 4.9rem);
  line-height: 0.94;
  letter-spacing: -0.05em;
`;

const HeroCopy = styled.p`
  max-width: 42rem;
  margin: 14px 0 0;
  color: ${designTokens.color.muted};
  font-size: 0.98rem;
  line-height: 1.72;

  @media (max-width: 720px) {
    font-size: 1rem;
  }
`;

const GridSection = styled.section`
  padding-top: 8px;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 22px;
`;

export default async function ProductListPage() {
  const [products, featuredProduct] = await Promise.all([
    getCatalogProducts(),
    getFeaturedCatalogProduct(),
  ]);
  const remainingProducts = featuredProduct
    ? products.filter((product) => product.modelSrc !== featuredProduct.modelSrc)
    : products;

  return (
    <PageShell>
      <Hero>
        <Eyebrow>Collection</Eyebrow>
        <HeroTitle>Made-to-order hardwood furniture.</HeroTitle>
        <HeroCopy>
          Choose a base piece, adjust the dimensions and details, then select
          white oak, red oak, walnut, ash, cherry, or maple before the workshop
          build begins.
        </HeroCopy>
      </Hero>

      <GridSection aria-label="Product catalog">
        <ProductGrid>
          {featuredProduct ? (
            <ProductCard key={featuredProduct.id} product={featuredProduct} />
          ) : null}
          {remainingProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ProductGrid>
      </GridSection>
    </PageShell>
  );
}
