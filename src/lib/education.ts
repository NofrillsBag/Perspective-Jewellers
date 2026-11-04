export type LearnCard = { title: string; tagline: string; points: string[] };

export const materials: LearnCard[] = [
  {
    title: 'Gold vermeil',
    tagline: 'Our collection finish',
    points: [
      'Real gold layered over sterling silver',
      'Gold must be 10k+ and at least 2.5 microns thick',
      'Not solid gold, but far tougher than thin plating',
      'Pronounced "ver-may"',
      'Note: in the US, "vermeil" is a regulated term, so a real piece has to meet that thickness rule',
    ],
  },
  {
    title: 'Sterling silver (925)',
    tagline: 'The classic',
    points: [
      '92.5% pure silver, 7.5% other metals',
      'Usually stamped "925"',
      'Tarnishes over time. A soft cloth brings it back',
      'Choose nickel-free if you have sensitive skin',
      'Note: Tarnish is silver reacting with sulphur in the air, not dirt. Pure silver is too soft for jewellery, so copper is added for strength',
    ],
  },
  {
    title: 'Recycled metal',
    tagline: 'Same metal, second life',
    points: [
      'Melted down from old jewellery, tech or scrap',
      'Identical quality to newly mined metal',
      'Avoids new mining and its footprint',
      'Ask for proof, not just a promise',
      'Note: gold never wears out, so it can be melted and reused forever without losing quality, which makes it very sustainable, if done responsibly.',
    ],
  },
  {
    title: 'Gold plated',
    tagline: 'Budget-friendly shine',
    points: [
      'A very thin gold layer over base metal',
      'Often under 0.5 microns thick',
      'Can wear off with daily use',
      'Keep away from water and perfume',
      'Note: a micron is a thousandth of a millimetre. A human hair is about 70 microns wide, so plating can be over 100 times thinner than a hair',
    ],
  },
  {
    title: 'Gold filled',
    tagline: 'Plating, but thicker',
    points: [
      'Gold bonded to a base metal with heat and pressure',
      'At least 5% gold by weight',
      "Lasts for years, and won't flake like plating",
      'Often a good middle ground on price',
      'Note: its gold layer is typically many times thicker than plating, which is why it holds up so much better',
    ],
  },
  {
    title: 'Solid gold (karats)',
    tagline: 'Gold all the way through',
    points: [
      '24k = pure gold, 18k = 75%, 14k = 58%, 10k = 42%',
      'Higher karat means softer and richer in colour',
      'Lower karat is harder and better for daily wear',
      'Look for the karat stamp',
      'Note: "karat" (gold purity) and "carat" (gemstone weight) sound the same but measure different things',
    ],
  },
];

export const certificates: LearnCard[] = [
  {
    title: 'Hallmark',
    tagline: 'Proof of purity',
    points: [
      'A tiny stamp showing the metal and its purity',
      'Often applied by an assay office or the maker',
      'Look inside the band or on the clasp',
      'Note: the word comes from Goldsmiths\' Hall in London, where metal was tested and stamped. Hallmarking there goes back to the year 1300',
    ],
  },
  {
    title: 'RJC certified',
    tagline: 'Responsible Jewellery Council',
    points: [
      'Industry standard for ethical and environmental practice',
      'Companies are audited by an outside party',
      'Chain of Custody tracks metal back to its source',
      'Note: the RJC was founded in 2005 by jewellery businesses that wanted a shared standard',
    ],
  },
  {
    title: 'Fairmined / Fairtrade Gold',
    tagline: 'Fairer mining',
    points: [
      'Gold from certified small-scale miners',
      'Miners get a fair price plus a community premium',
      'Strict limits on harmful chemicals like mercury',
      'Note: small-scale miners supply an estimated 10 to 20% of the world\'s gold',
    ],
  },
  {
    title: 'Recycled content (SCS)',
    tagline: 'Checks the "recycled" claim',
    points: [
      'An independent check that metal really is recycled',
      'States how much of it is recycled',
      'Helps spot vague "eco" marketing',
      'Note: "recycled" can mean factory offcuts (pre-consumer) or old jewellery (post-consumer). A good label says which',
    ],
  },
  {
    title: 'GIA report',
    tagline: 'For diamonds and gemstones',
    points: [
      'Independent lab grading of a single stone',
      'Covers cut, colour, clarity and carat',
      'Report number can be checked online',
      'Note: GIA is a non-profit, founded in 1931. It created the "4Cs" that the whole diamond trade now uses',
    ],
  },
  {
    title: 'Kimberley Process',
    tagline: 'Conflict-free rough diamonds',
    points: [
      'A UN-backed scheme to block "conflict" diamonds',
      'Covers rough diamonds only',
      'Does not cover worker pay or conditions',
      'Note: it began in 2003, after wars in Africa were found to be funded by diamond sales',
    ],
  },
  {
    title: 'B Corp',
    tagline: 'About the company, not the piece',
    points: [
      'Scores a whole business on people and planet',
      'Re-assessed every few years',
      "Says nothing about a single product's metal",
      'Note: the "B" stands for "benefit"',
    ],
  },
];