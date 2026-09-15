export const designTokens = {
  color: {
    surface: 'rgba(255, 252, 247, 0.86)',
    line: 'rgba(35, 28, 20, 0.1)',
    text: '#211a12',
    muted: '#6d6458',
    accent: '#c86f31',
    accentDeep: '#8c4718',
  },
  shadow: {
    card: '0 24px 60px rgba(42, 27, 16, 0.12)',
  },
  background: {
    page:
      'radial-gradient(circle at top left, rgba(228, 173, 114, 0.38), transparent 30%), radial-gradient(circle at right center, rgba(151, 116, 73, 0.18), transparent 26%), linear-gradient(180deg, #f7f2e8 0%, #ede4d4 100%)',
    viewer:
      'radial-gradient(circle at center, rgba(255, 255, 255, 0.76), rgba(235, 224, 207, 0.88))',
    viewerWood:
      'linear-gradient(180deg, rgba(255, 255, 255, 0.42), rgba(244, 232, 215, 0.68)), linear-gradient(0deg, rgba(38, 24, 13, 0.08), transparent 52%), url("/materials/hardwood/white-oak.jpg")',
    cardMedia:
      'linear-gradient(180deg, rgba(255, 247, 235, 0.94), rgba(244, 232, 215, 0.72)), radial-gradient(circle at top, rgba(200, 111, 49, 0.1), transparent 48%)',
    badge: 'rgba(255, 250, 242, 0.9)',
    chip: 'rgba(255, 248, 238, 0.92)',
  },
} as const;
