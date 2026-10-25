const REGION_1_COUNTRIES = new Set([
  'AU', // Australia
  'CA', // Canada
  'KW', // Kuwait
  'NZ', // New Zealand
  'QA', // Qatar
  'SG', // Singapore
  'AE', // United Arab Emirates
  'GB', // United Kingdom
  'US', // United States
]);

const REGION_MULTIPLIERS = {
  INDIA: 1,
  REGION_1: 1.4,
  REGION_2: 1,
  REGION_3: 1,
  REGION_4: 1,
  REGION_5: 1,
};

export function getPricingRegion(countryCode) {
  if (countryCode === 'IN') {
    return 'INDIA';
  }

  if (REGION_1_COUNTRIES.has(countryCode)) {
    return 'REGION_1';
  }

  return 'DEFAULT';
}

export function getRegionalPrice(price, countryCode) {
  const amount = Number(price);

  if (!Number.isFinite(amount)) {
    return price;
  }

  const region = getPricingRegion(countryCode);
  const multiplier = REGION_MULTIPLIERS[region] ?? 1;

  return (amount * multiplier).toFixed(2);
}

export function formatRegionalPrice(price, countryCode) {
  const amount = Number(getRegionalPrice(price, countryCode));

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}