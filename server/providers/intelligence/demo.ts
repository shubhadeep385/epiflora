/**
 * Demo Mode as a real provider.
 *
 * This is the terminal fallback and the reason a spent quota can never break a
 * live demo. It implements the same interface as Gemini, so nothing upstream knows
 * the difference — the UI simply reports "Demo mode" in the status pill.
 *
 * Unlike the cloud providers it cannot be schema-driven generically, so it
 * switches on the task. Every string is written to be agronomically plausible and
 * is surfaced with an explicit "illustrative" disclaimer. It is never presented as
 * a real analysis of the farmer's own photo or field.
 */

import { ProviderError, type GenerateRequest, type GenerateResult, type IntelligenceProvider } from '../types.ts';

const DEMO_DIAGNOSIS_DISCLAIMER =
  'Illustrative demo result, not an analysis of your photo. EpiFlora is running without a live AI provider. Connect a provider for a real assessment.';

const DEMO_ADVISORY_DISCLAIMER =
  'Illustrative demo advisory. Weather figures are real, but this guidance is pre-written rather than generated for your field.';

interface Seed {
  keywords: string[];
  payload: Record<string, unknown>;
}

const DIAGNOSIS_SEEDS: Seed[] = [
  {
    keywords: ['tomato', 'potato', 'brinjal', 'eggplant', 'टमाटर', 'आलू'],
    payload: {
      diagnosis: 'Early blight (Alternaria solani)',
      confidence: 88,
      severity: 'moderate',
      imageQuality: 'good',
      symptoms: [
        'Dark brown lesions with concentric rings on older, lower leaves',
        'Yellow halo spreading outward from each lesion',
        'Lower leaves drying and dropping first',
      ],
      causes: [
        'Warm temperatures combined with prolonged leaf wetness',
        'Splash from overhead irrigation moving spores upward from soil',
        'Dense canopy holding humidity between plants',
      ],
      recommendations: [
        'Remove and destroy the worst affected lower leaves — do not compost them',
        'Switch from overhead watering to drip or furrow irrigation at the base',
        'Thin the canopy to open airflow between plants',
        'Mulch the soil surface to stop rain splashing spores onto leaves',
      ],
      organicRemedies: [
        'Neem-based foliar spray applied in the cool of early morning',
        'Trichoderma or Bacillus subtilis biological drench around the root zone',
        'Cow-milk-and-water foliar spray, a common low-cost smallholder practice',
      ],
      chemicalOptions: [
        'Copper-based protectant fungicides',
        'Mancozeb-group protectants where locally approved',
      ],
      prevention: [
        'Rotate away from tomato, potato and brinjal for at least two seasons',
        'Stake plants so no foliage touches the soil',
        'Clear and destroy crop residue after harvest',
        'Choose tolerant varieties where available locally',
      ],
      regenerativePractices: [
        'Rotate with a legume to rebuild nitrogen and break the disease cycle',
        'Keep living mulch or cover crop between rows to protect soil structure',
        'Add compost to raise organic matter and strengthen disease suppression',
      ],
      urgency: 'Act within two to three days — early blight spreads upward quickly in humid weather.',
      weatherRiskNote:
        'High humidity with warm days keeps infection pressure elevated. Avoid evening watering.',
      disclaimer: DEMO_DIAGNOSIS_DISCLAIMER,
    },
  },
  {
    keywords: ['wheat', 'गेहूं', 'gehu', 'barley'],
    payload: {
      diagnosis: 'Yellow rust (Puccinia striiformis), early stage',
      confidence: 82,
      severity: 'moderate',
      imageQuality: 'good',
      symptoms: [
        'Yellow-orange powdery pustules arranged in stripes along the leaf veins',
        'Powder rubs off onto a finger when touched',
        'Older leaves affected before the upper canopy',
      ],
      causes: [
        'Cool, moist conditions favouring rust sporulation',
        'Susceptible variety grown in a rust-prone belt',
        'Dense sowing restricting airflow through the crop',
      ],
      recommendations: [
        'Inspect the field along two diagonals to judge how widely it has spread',
        'Avoid additional nitrogen for now — soft, lush growth worsens rust',
        'Prioritise treatment if pustules have reached the top two leaves, which feed the grain',
        'Contact your local extension officer: rust decisions are region and variety specific',
      ],
      organicRemedies: [
        'Sulphur-based sprays where locally approved for cereals',
        'Remove volunteer wheat plants nearby that carry rust between seasons',
      ],
      chemicalOptions: ['Triazole-group fungicides are the standard response'],
      prevention: [
        'Sow rust-resistant varieties recommended for your district',
        'Sow at the recommended spacing rather than denser',
        'Balance nitrogen with potassium instead of pushing nitrogen alone',
      ],
      regenerativePractices: [
        'Rotate cereals with pulses to interrupt the rust cycle',
        'Retain some residue cover to protect soil moisture and structure',
      ],
      urgency: 'Scout the whole field within 24 hours and decide before the flag leaf is affected.',
      weatherRiskNote: 'Cool nights with morning dew strongly favour further rust development.',
      disclaimer: DEMO_DIAGNOSIS_DISCLAIMER,
    },
  },
  {
    keywords: ['rice', 'paddy', 'चावल', 'धान'],
    payload: {
      diagnosis: 'Bacterial leaf blight (Xanthomonas oryzae)',
      confidence: 79,
      severity: 'high',
      imageQuality: 'good',
      symptoms: [
        'Water-soaked streaks starting at the leaf tip and margin',
        'Streaks turning yellow then straw-coloured as they lengthen',
        'Milky bacterial ooze visible on young lesions in the early morning',
      ],
      causes: [
        'Standing water combined with wind-driven rain spreading bacteria',
        'Excess nitrogen producing soft, susceptible growth',
        'Root and leaf injury during transplanting creating entry points',
      ],
      recommendations: [
        'Drain the field intermittently rather than keeping it continuously flooded',
        'Stop further nitrogen application immediately',
        'Avoid moving through the crop while foliage is wet',
        'Consult your extension officer — at this severity, variety choice matters most next season',
      ],
      organicRemedies: [
        'Copper-based protectants where locally approved',
        'Balanced potassium to firm up plant tissue',
      ],
      chemicalOptions: [
        'Copper compounds are the usual option; antibiotics are restricted in many regions',
      ],
      prevention: [
        'Plant resistant varieties recommended for your district',
        'Use certified clean seed',
        'Avoid injuring seedlings during transplanting',
        'Remove and destroy infected stubble after harvest',
      ],
      regenerativePractices: [
        'Alternate wetting and drying to cut water use and methane while improving root health',
        'Incorporate green manure such as Sesbania before transplanting',
      ],
      urgency: 'Act today — bacterial blight can move fast through a flooded field.',
      weatherRiskNote: 'Wind-driven rain spreads this disease rapidly between plants.',
      disclaimer: DEMO_DIAGNOSIS_DISCLAIMER,
    },
  },
];

const GENERIC_DIAGNOSIS: Record<string, unknown> = {
  diagnosis: 'Leaf spot with early nutrient stress',
  confidence: 64,
  severity: 'moderate',
  imageQuality: 'unclear',
  symptoms: [
    'Irregular brown spots scattered across the leaf surface',
    'General yellowing between the leaf veins',
  ],
  causes: [
    'A fungal leaf spot taking hold on tissue already weakened by nutrient stress',
    'Prolonged leaf wetness from overhead irrigation or recent rain',
  ],
  recommendations: [
    'Photograph both an affected leaf and a healthy one for comparison',
    'Remove the most affected leaves and improve airflow around the plants',
    'Water at the base of the plant, early in the day',
    'Check for the same pattern elsewhere in the field to judge how far it has spread',
  ],
  organicRemedies: [
    'Neem-based foliar spray in the cool early morning',
    'Compost tea or a Trichoderma drench to support root health',
  ],
  chemicalOptions: ['Broad-spectrum protectant fungicide only if spread continues'],
  prevention: [
    'Rotate crops between seasons rather than replanting the same family',
    'Keep a mulch layer to reduce soil splash onto leaves',
    'Test soil nutrients before the next sowing',
  ],
  regenerativePractices: [
    'Add compost to build soil organic matter',
    'Include a legume in the rotation to restore nitrogen naturally',
  ],
  urgency: 'Monitor daily for the next three days and re-photograph if spots enlarge.',
  disclaimer: DEMO_DIAGNOSIS_DISCLAIMER,
};

/** Generic advisory skeleton; real dates are injected from the live forecast. */
const DEMO_ADVISORY: Record<string, unknown> = {
  summary:
    'Humid conditions dominate the week with rain likely midweek. The main risks are fungal disease on leaves and waterlogging in low-lying parts of the field.',
  days: [],
  irrigationGuidance:
    'Hold irrigation while rain remains likely in the next 24 hours. When you do water, water at the base of plants early in the day so leaves dry before nightfall.',
  regenerativePractices: [
    'Mulch bare soil before the heavy rain to prevent erosion and nutrient loss',
    'Keep field drains clear so water does not stand around the root zone',
    'Use the wet spell to establish a cover crop on any fallow ground',
  ],
  disclaimer: DEMO_ADVISORY_DISCLAIMER,
};

const DEMO_SOIL: Record<string, unknown> = {
  summary:
    'This soil can support a reasonable crop, but nutrient availability is being held back rather than nutrient quantity. Correcting that first will get more from the inputs you already apply.',
  recommendations: [
    'Address the limiting factor before adding any other nutrient',
    'Apply well-rotted compost or farmyard manure before the next sowing',
    'Split nutrient applications across the season instead of one heavy dose',
    'Retain crop residue after harvest rather than burning it',
  ],
  regenerativePractices: [
    'Include a legume in the rotation to fix nitrogen naturally',
    'Grow a cover crop on fallow ground to protect and feed the soil',
    'Build organic carbon steadily with compost — this pays back over seasons',
  ],
  cautions: [
    'Avoid adding more of any nutrient already measured as high',
    'Do not apply amendments to waterlogged soil',
  ],
  disclaimer:
    'Illustrative demo advisory. EpiFlora is running without a live AI provider, so this is pre-written rather than generated for your soil.',
};

const DEMO_ANSWER: Record<string, unknown> = {
  answer:
    'Based on the conditions recorded for your farm, hold off on irrigation for now and check the lower leaves of your crop for early spots. Humidity is the main risk at the moment, so keeping air moving between plants matters more than adding water. This is an illustrative demo response, because EpiFlora is currently running without a live AI provider.',
  followUps: [
    'What organic treatments can I use?',
    'When should I next irrigate?',
    'How do I improve airflow between plants?',
  ],
  offTopic: false,
  disclaimer: 'Illustrative demo response, not generated for your farm.',
};

function diagnosisFor(prompt: string): Record<string, unknown> {
  const needle = prompt.toLowerCase();
  const seed = DIAGNOSIS_SEEDS.find((candidate) =>
    candidate.keywords.some((word) => needle.includes(word)),
  );
  return seed?.payload ?? GENERIC_DIAGNOSIS;
}

/** Pulls the ISO dates out of the prompt so demo days line up with real weather. */
function advisoryFor(prompt: string): Record<string, unknown> {
  const dates = [...prompt.matchAll(/\b(\d{4}-\d{2}-\d{2})\b/g)].map((match) => match[1]);
  const unique = [...new Set(dates)].slice(0, 7);

  const headlines: Array<[string, string]> = [
    ['Hold irrigation', 'Soil moisture is adequate and rain is likely, so watering now risks waterlogging.'],
    ['Watch for leaf spots', 'Humidity stays high. Check lower leaves for the first dark spots.'],
    ['Avoid spraying', 'Rain would wash off any application. Wait for a dry window.'],
    ['Good spraying window', 'Lower humidity and light wind make this the best day to treat if needed.'],
    ['Clear field drains', 'Standing water after rain invites root disease.'],
    ['Resume light irrigation', 'Topsoil will be drying. Water at the base, early in the day.'],
    ['Scout the whole field', 'Walk two diagonals and compare affected areas with healthy ones.'],
  ];

  return {
    ...DEMO_ADVISORY,
    days: unique.map((date, index) => {
      const [headline, detail] = headlines[index % headlines.length] as [string, string];
      return { date, headline, detail };
    }),
  };
}

export class DemoProvider implements IntelligenceProvider {
  readonly id = 'demo';
  readonly label = 'Demo Mode';
  readonly capabilities = { vision: true, audio: true, structuredJson: true };
  readonly timeoutMs = 5_000;

  /** Needs nothing configured — precisely why it can be the terminal fallback. */
  isConfigured(): boolean {
    return true;
  }

  async generate(request: GenerateRequest, signal: AbortSignal): Promise<GenerateResult> {
    // A brief pause so staged progress UI reads naturally rather than flashing.
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, 700);
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new ProviderError('demo', 'unavailable', 'aborted'));
      });
    });

    switch (request.task) {
      case 'crop_diagnosis':
        return { json: diagnosisFor(request.prompt), model: 'seeded-demo' };
      case 'farm_advisory':
        return { json: advisoryFor(request.prompt), model: 'seeded-demo' };
      case 'soil_recommendation':
        return { json: DEMO_SOIL, model: 'seeded-demo' };
      case 'agri_answer':
        return { json: DEMO_ANSWER, model: 'seeded-demo' };
      default:
        throw new ProviderError(
          'demo',
          'unsupported',
          `Demo Mode has no seeded response for task "${request.task}"`,
        );
    }
  }
}
