import styled from 'styled-components';
import { designTokens } from '@/lib/design-tokens';
import {
  LandingActionRow,
  LandingCard,
  LandingCopy,
  LandingEyebrow,
  LandingHeroCopy,
  LandingHeroTitle,
  LandingPrimaryAction,
  LandingTitle,
  landingCardSurface,
  type LandingCardAlign,
  type LandingCardWidth,
} from '@/components/landing/landing-card';

const METRICS = [
  {
    label: 'Custom Design',
    value:
      'Dimensions, use case, and room fit are resolved before production begins.',
  },
  {
    label: 'Hardwood Options',
    value:
      'White oak, red oak, walnut, ash, cherry, and maple are selected for tone, grain, and daily wear.',
  },
  {
    label: 'Workshop Build',
    value:
      'Planned, cut, drilled, sanded, finished, and delivered through a clear sequence.',
  },
] as const;

const MATERIAL_SWATCHES = [
  {
    image: '/materials/hardwood/white-oak.jpg',
    name: 'White Oak',
  },
  {
    image: '/materials/hardwood/red-oak.jpg',
    name: 'Red Oak',
  },
  {
    image: '/materials/hardwood/walnut.jpg',
    name: 'Walnut',
  },
  {
    image: '/materials/hardwood/ash.jpg',
    name: 'Ash',
  },
  {
    image: '/materials/hardwood/cherry.jpg',
    name: 'Cherry',
  },
  {
    image: '/materials/hardwood/maple.jpg',
    name: 'Maple',
  },
] as const;

const DESIGN_DETAILS = [
  {
    label: 'Dimensions',
    value:
      'Length, depth, height, and clearance are resolved around the room.',
  },
  {
    label: 'Use Case',
    value:
      'Dining, entry, display, studio, or daily work needs guide the details.',
  },
  {
    label: 'Room Fit',
    value:
      'The final proportion is checked against nearby furniture and walking paths.',
  },
] as const;

const PROCESS_STEPS = [
  {
    step: '01 Plan',
    title: 'Confirm drawings, dimensions, and material direction.',
    copy:
      'The build starts only after the practical details are locked.',
  },
  {
    step: '02 Cut & Drill',
    title: 'Mill, cut, drill, shape, and prepare each part.',
    copy:
      'Parts are prepared for clean alignment and durable assembly.',
  },
  {
    step: '03 Sand & Finish',
    title: 'Refine the surface and tune the final finish.',
    copy:
      'Edges, grain, color, and sheen are handled with restraint.',
  },
  {
    step: '04 Deliver',
    title: 'Inspect, wrap, transport, and place the finished piece.',
    copy:
      'The piece arrives finished, reviewed, and ready for the room.',
  },
] as const;

const WORKSHOP_SPECS = [
  {
    label: 'Planning',
    value:
      'Production drawings and dimensions are confirmed before cutting begins.',
  },
  {
    label: 'Cutting & Joinery',
    value:
      'Parts are milled and assembled for structural accuracy and clean alignment.',
  },
  {
    label: 'Surface Prep',
    value:
      'Edges are softened and surfaces are sanded for touch, light, and finish quality.',
  },
  {
    label: 'Finish & Delivery',
    value:
      'The final coat, inspection, wrapping, and placement complete the build.',
  },
] as const;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const MetricItem = styled.div`
  padding: 18px 18px 20px;
  border: 1px solid rgba(255, 251, 245, 0.26);
  border-radius: 24px;
  background: rgba(255, 250, 242, 0.12);
  backdrop-filter: blur(10px) saturate(130%);
  -webkit-backdrop-filter: blur(10px) saturate(130%);
`;

const MetricLabel = styled.p`
  margin: 0 0 10px;
  color: ${designTokens.color.accentDeep};
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
`;

const MetricValue = styled.p`
  margin: 0;
  font-size: 1rem;
  line-height: 1.46;
`;

const SplitPanel = styled.section`
  width: min(66rem, 100%);
  margin: 0 auto;
  padding: 26px 24px 28px;
  ${landingCardSurface}
  display: grid;
  gap: 22px;

  @media (max-width: 720px) {
    width: 100%;
    padding: 24px 20px;
  }
`;

const MaterialPanel = styled(SplitPanel)`
  position: relative;
  width: min(74rem, 100%);
  overflow: hidden;

  &::before {
    position: absolute;
    inset: -18% auto auto 42%;
    width: 34rem;
    height: 34rem;
    border-radius: 999px;
    content: '';
    background: radial-gradient(
      circle at center,
      rgba(255, 242, 224, 0.34),
      transparent 68%
    );
    pointer-events: none;
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const DesignPanel = styled(SplitPanel)`
  grid-template-columns: minmax(14rem, 0.7fr) minmax(0, 1.3fr);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const DetailCard = styled.div`
  padding: 18px 18px 20px;
  border: 1px solid rgba(255, 251, 245, 0.26);
  border-radius: 22px;
  background: rgba(255, 250, 242, 0.1);
  box-shadow:
    0 18px 36px rgba(42, 27, 16, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(10px) saturate(130%);
  -webkit-backdrop-filter: blur(10px) saturate(130%);
`;

const DetailLabel = styled.p`
  margin: 0 0 10px;
  color: ${designTokens.color.accentDeep};
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
`;

const DetailValue = styled.p`
  margin: 0;
  color: ${designTokens.color.muted};
  font-size: 0.96rem;
  line-height: 1.62;
`;

const SwatchGrid = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 720px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  @media (max-width: 420px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const SwatchCard = styled.div`
  position: relative;
  isolation: isolate;
  min-height: 126px;
  padding: 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 251, 245, 0.26);
  border-radius: 20px;
  background:
    linear-gradient(150deg, rgba(255, 252, 247, 0.2), rgba(255, 250, 242, 0.06)),
    rgba(255, 250, 242, 0.1);
  box-shadow:
    0 18px 36px rgba(42, 27, 16, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.24);
  backdrop-filter: blur(12px) saturate(138%);
  -webkit-backdrop-filter: blur(12px) saturate(138%);

  &::before {
    position: absolute;
    inset: 0;
    z-index: -1;
    content: '';
    background:
      linear-gradient(
        120deg,
        transparent 0%,
        rgba(255, 255, 255, 0.18) 42%,
        transparent 62%
      );
    opacity: 0.54;
    pointer-events: none;
  }

  @media (max-width: 720px) {
    min-height: 104px;
    padding: 8px;
    border-radius: 16px;
  }
`;

const SwatchTone = styled.div<{ $image: string }>`
  height: 82px;
  border-radius: 12px;
  overflow: hidden;
  background-image:
    linear-gradient(180deg, rgba(255, 255, 255, 0.2), transparent 34%),
    linear-gradient(0deg, rgba(38, 24, 13, 0.12), transparent 48%),
    url(${({ $image }) => $image});
  background-size: cover;
  background-position: center;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.24),
    inset 0 -16px 24px rgba(58, 36, 18, 0.1);

  @media (max-width: 720px) {
    height: 58px;
    border-radius: 10px;
  }

  @media (max-width: 420px) {
    height: 52px;
  }
`;

const SwatchName = styled.p`
  margin: 10px 0 0;
  font-size: 0.9rem;
  font-weight: 600;

  @media (max-width: 720px) {
    margin-top: 8px;
    font-size: 0.82rem;
  }
`;

const ProcessPanel = styled.section`
  width: min(62rem, 100%);
  margin: 0 auto;
  padding: 26px 24px 28px;
  ${landingCardSurface}

  @media (max-width: 720px) {
    width: 100%;
    padding: 24px 20px;
  }
`;

const ProcessHeader = styled.div`
  display: grid;
  gap: 12px;
  max-width: 44rem;
`;

const ProcessGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-top: 24px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const ProcessCard = styled.article`
  padding: 22px 20px 22px;
  border: 1px solid rgba(255, 251, 245, 0.26);
  border-radius: 24px;
  background: rgba(255, 250, 242, 0.1);
  backdrop-filter: blur(10px) saturate(130%);
  -webkit-backdrop-filter: blur(10px) saturate(130%);
`;

const ProcessStep = styled.p`
  margin: 0 0 10px;
  color: ${designTokens.color.accentDeep};
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
`;

const ProcessTitle = styled.h3`
  margin: 0;
  font-size: 1.32rem;
  line-height: 1.1;
  letter-spacing: -0.03em;
`;

const ProcessCopy = styled.p`
  margin: 12px 0 0;
  color: ${designTokens.color.muted};
  font-size: 0.96rem;
  line-height: 1.72;
`;

const WorkshopPanel = styled(SplitPanel)`
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const WorkshopQuote = styled.blockquote`
  margin: 0;
  padding: 0 0 0 18px;
  border-left: 3px solid rgba(200, 111, 49, 0.34);
  font-size: clamp(1.4rem, 2.6vw, 2.1rem);
  line-height: 1.2;
  letter-spacing: -0.04em;
`;

const WorkshopCaption = styled.p`
  margin: 14px 0 0;
  color: ${designTokens.color.muted};
  font-size: 0.96rem;
  line-height: 1.72;
`;

const WorkshopSpecGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const WorkshopSpec = styled.div`
  padding: 18px 18px 20px;
  border: 1px solid rgba(255, 251, 245, 0.26);
  border-radius: 22px;
  background: rgba(255, 250, 242, 0.1);
  backdrop-filter: blur(10px) saturate(130%);
  -webkit-backdrop-filter: blur(10px) saturate(130%);
`;

const WorkshopSpecLabel = styled.p`
  margin: 0 0 8px;
  color: ${designTokens.color.accentDeep};
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
`;

const WorkshopSpecValue = styled.p`
  margin: 0;
  font-size: 0.98rem;
  line-height: 1.66;
  color: ${designTokens.color.muted};
`;

const ClosingCard = styled(LandingCard)`
  width: min(44rem, 100%);
  padding: 22px 22px 24px;
  text-align: center;
`;

const ClosingTitle = styled.h2`
  max-width: 12ch;
  margin: 0 auto;
  font-size: clamp(2rem, 3.8vw, 3.35rem);
  line-height: 0.98;
  letter-spacing: -0.05em;
`;

const ClosingCopy = styled(LandingCopy)`
  max-width: 30rem;
  margin-left: auto;
  margin-right: auto;
`;

const CenteredActionRow = styled(LandingActionRow)`
  justify-content: center;
`;

interface StatementCardProps {
  eyebrow: string;
  title: string;
  copy: string;
  align?: LandingCardAlign;
  width?: LandingCardWidth;
}

function StatementCard({ eyebrow, title, copy, align, width }: StatementCardProps) {
  return (
    <LandingCard $align={align} $width={width}>
      <LandingEyebrow>{eyebrow}</LandingEyebrow>
      <LandingTitle>{title}</LandingTitle>
      <LandingCopy>{copy}</LandingCopy>
    </LandingCard>
  );
}

export function LandingHeroCard() {
  return (
    <LandingCard $width="hero">
      <LandingEyebrow>Custom Hardwood Furniture</LandingEyebrow>
      <LandingHeroTitle>
        Custom hardwood furniture, built to order.
      </LandingHeroTitle>
      <LandingHeroCopy>
        Start with a base design, adjust dimensions and details, choose the
        hardwood, and move into production with the build steps defined before
        work begins.
      </LandingHeroCopy>
      <LandingActionRow>
        <LandingPrimaryAction href="/product-list">
          Shop The Collection
        </LandingPrimaryAction>
      </LandingActionRow>
    </LandingCard>
  );
}

export function LandingMetricsCard() {
  return (
    <LandingCard $align="center" $width="wide">
      <MetricGrid>
        {METRICS.map((metric) => (
          <MetricItem key={metric.label}>
            <MetricLabel>{metric.label}</MetricLabel>
            <MetricValue>{metric.value}</MetricValue>
          </MetricItem>
        ))}
      </MetricGrid>
    </LandingCard>
  );
}

export function LandingDesignPanel() {
  return (
    <DesignPanel>
      <div>
        <LandingEyebrow>Custom Design</LandingEyebrow>
        <LandingTitle>
          Dimensions, use case, and room fit come first.
        </LandingTitle>
        <LandingCopy>
          The design is resolved before material selection or production begins.
        </LandingCopy>
      </div>

      <DetailGrid>
        {DESIGN_DETAILS.map((detail) => (
          <DetailCard key={detail.label}>
            <DetailLabel>{detail.label}</DetailLabel>
            <DetailValue>{detail.value}</DetailValue>
          </DetailCard>
        ))}
      </DetailGrid>
    </DesignPanel>
  );
}

export function LandingMaterialsPanel() {
  return (
    <MaterialPanel>
      <LandingEyebrow>Hardwood Options</LandingEyebrow>
      <SwatchGrid>
        {MATERIAL_SWATCHES.map((swatch) => (
          <SwatchCard key={swatch.name}>
            <SwatchTone
              $image={swatch.image}
              aria-label={`${swatch.name} wood grain`}
              role="img"
            />
            <SwatchName>{swatch.name}</SwatchName>
          </SwatchCard>
        ))}
      </SwatchGrid>
    </MaterialPanel>
  );
}

export function LandingCraftCard() {
  return (
    <StatementCard
      eyebrow="Fabrication"
      title="Planning, cutting, drilling, and joinery shape the piece before finish work begins."
      copy="Each part is milled and prepared for fit, structure, and clean assembly so the final form feels precise rather than overworked."
    />
  );
}

interface LandingProcessPanelProps {
  id?: string;
}

export function LandingProcessPanel({ id }: LandingProcessPanelProps) {
  return (
    <ProcessPanel id={id}>
      <ProcessHeader>
        <LandingEyebrow>Workshop Build</LandingEyebrow>
        <LandingTitle>
          Planned, cut, drilled, sanded, finished, and delivered.
        </LandingTitle>
        <LandingCopy>
          After design and hardwood selection, the build moves through a clear
          production sequence.
        </LandingCopy>
      </ProcessHeader>

      <ProcessGrid>
        {PROCESS_STEPS.map((step) => (
          <ProcessCard key={step.step}>
            <ProcessStep>{step.step}</ProcessStep>
            <ProcessTitle>{step.title}</ProcessTitle>
            <ProcessCopy>{step.copy}</ProcessCopy>
          </ProcessCard>
        ))}
      </ProcessGrid>
    </ProcessPanel>
  );
}

export function LandingWorkshopPanel() {
  return (
    <WorkshopPanel>
      <div>
        <LandingEyebrow>Workshop Standard</LandingEyebrow>
        <WorkshopQuote>
          &ldquo;A custom piece is not made by adding options everywhere. It is made
          by resolving the right decisions in the right order.&rdquo;
        </WorkshopQuote>
        <WorkshopCaption>
          That order is design, material, fabrication, finish, and delivery.
          Keeping the process disciplined keeps the result clean.
        </WorkshopCaption>
      </div>

      <WorkshopSpecGrid>
        {WORKSHOP_SPECS.map((spec) => (
          <WorkshopSpec key={spec.label}>
            <WorkshopSpecLabel>{spec.label}</WorkshopSpecLabel>
            <WorkshopSpecValue>{spec.value}</WorkshopSpecValue>
          </WorkshopSpec>
        ))}
      </WorkshopSpecGrid>
    </WorkshopPanel>
  );
}

export function LandingTailoredCard() {
  return (
    <StatementCard
      eyebrow="Tailored Fit"
      title="Sized for the room, not the catalog."
      copy="Dimensions, wood tone, and finish are adjusted so the piece sits naturally in its space."
      align="right"
      width="wide"
    />
  );
}

export function LandingClosingCard() {
  return (
    <ClosingCard $align="center" $width="wide">
      <LandingEyebrow>Begin Your Piece</LandingEyebrow>
      <ClosingTitle>
        Ready to build yours?
      </ClosingTitle>
      <ClosingCopy>
        Explore the collection, then choose the wood, size, and finish that fit
        your room.
      </ClosingCopy>
      <CenteredActionRow>
        <LandingPrimaryAction href="/product-list">
          View The Collection
        </LandingPrimaryAction>
      </CenteredActionRow>
    </ClosingCard>
  );
}
