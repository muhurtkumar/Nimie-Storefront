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

const REGION_2_COUNTRIES = new Set([
  'AT', // Austria
  'BE', // Belgium
  'DK', // Denmark
  'FI', // Finland
  'FR', // France
  'DE', // Germany
  'IE', // Ireland
  'IT', // Italy
  'JP', // Japan
  'NL', // Netherlands
  'NO', // Norway
  'KR', // South Korea
  'ES', // Spain
  'SE', // Sweden
  'CH', // Switzerland
]);

const REGION_3_COUNTRIES = new Set([
  'BH', // Bahrain
  'CZ', // Czechia
  'GR', // Greece
  'IL', // Israel
  'MY', // Malaysia
  'OM', // Oman
  'PL', // Poland
  'PT', // Portugal
  'SA', // Saudi Arabia
  'ZA', // South Africa
]);

const REGION_4_COUNTRIES = new Set([
  'BR', // Brazil
  'CL', // Chile
  'CO', // Colombia
  'ID', // Indonesia
  'MX', // Mexico
  'PH', // Philippines
  'TH', // Thailand
  'TR', // Türkiye
  'VN', // Vietnam
]);

const REGION_5_COUNTRIES = new Set([
  'BD', // Bangladesh
  'EG', // Egypt
  'GH', // Ghana
  'KE', // Kenya
  'NP', // Nepal
  'NG', // Nigeria
  'PK', // Pakistan
  'LK', // Sri Lanka
]);

const REGION_MULTIPLIERS = {
  INDIA: 1,
  REGION_1: 1.4,
  REGION_2: 1.3,
  REGION_3: 1.25,
  REGION_4: 1.2,
  REGION_5: 1.15,
};

export function getPricingRegion(countryCode) {
  if (countryCode === 'IN') {
    return 'INDIA';
  }

  if (REGION_1_COUNTRIES.has(countryCode)) {
    return 'REGION_1';
  }

  if (REGION_2_COUNTRIES.has(countryCode)) {
    return 'REGION_2';
  }

  if (REGION_3_COUNTRIES.has(countryCode)) {
    return 'REGION_3';
  }

  if (REGION_4_COUNTRIES.has(countryCode)) {
    return 'REGION_4';
  }

  if (REGION_5_COUNTRIES.has(countryCode)) {
    return 'REGION_5';
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