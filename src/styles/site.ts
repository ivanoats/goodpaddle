import { css } from '../../styled-system/css';
import { container } from '../../styled-system/patterns';
export const shell = container({ maxWidth: '1200px' });
export const header = css({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '4',
  py: '6',
  borderBottomWidth: '1px',
  borderColor: 'border',
});
export const brand = css({
  fontSize: 'displayMd',
  fontWeight: '700',
  textDecoration: 'none',
  color: 'ink',
  letterSpacing: '-0.04em',
});
export const nav = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '4',
  alignItems: 'center',
  '& a': { minHeight: '44px', display: 'inline-flex', alignItems: 'center' },
});
export const hero = css({
  display: 'grid',
  gridTemplateColumns: { base: '1fr', md: '0.9fr 1.1fr' },
  gap: { base: '8', md: '12' },
  alignItems: 'center',
  py: { base: '12', md: '24' },
});
export const eyebrow = css({
  color: 'accent',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  fontSize: 'label',
  fontWeight: '700',
  mb: '6',
});
export const title = css({
  fontSize: { base: '3rem', md: '4.5rem' },
  lineHeight: '1.05',
  letterSpacing: '-0.055em',
  fontWeight: '650',
  maxWidth: '14ch',
  textWrap: 'balance',
});
export const intro = css({
  color: 'ink.muted',
  fontSize: 'displaySm',
  mt: '6',
  maxWidth: '40ch',
});
export const photo = css({
  width: '100%',
  height: { base: '300px', md: '500px' },
  objectFit: 'cover',
  borderRadius: 'lg',
});
export const prose = css({
  maxWidth: '68ch',
  mx: 'auto',
  py: '12',
  fontSize: 'body',
  lineHeight: '1.8',
  overflowWrap: 'anywhere',
  '& > * + *': { mt: '6' },
  '& h2': {
    fontSize: 'displayLg',
    fontWeight: '600',
    lineHeight: '1.2',
    letterSpacing: '-0.03em',
  },
  '& h3': { fontSize: 'displaySm', fontWeight: '600' },
  '& ul': { listStyleType: 'disc', pl: '6' },
  '& ol': { listStyleType: 'decimal', pl: '6' },
  '& blockquote': {
    borderLeftWidth: '3px',
    borderColor: 'accent',
    pl: '6',
    color: 'ink.muted',
  },
  '& pre': { overflowX: 'auto', p: '4', borderRadius: 'sm' },
  '& table': {
    display: 'block',
    overflowX: 'auto',
    borderCollapse: 'collapse',
  },
  '& th, & td': { borderWidth: '1px', borderColor: 'border', p: '2' },
  '& img': { maxWidth: '100%', height: 'auto' },
});
export const footer = css({
  mt: '12',
  py: '8',
  borderTopWidth: '1px',
  borderColor: 'border',
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  gap: '6',
  color: 'ink.muted',
  fontSize: 'bodySm',
});
export const theme = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '4',
  '& label': {
    display: 'inline-flex',
    gap: '2',
    alignItems: 'center',
    minHeight: '44px',
    cursor: 'pointer',
  },
});
