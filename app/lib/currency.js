
const SUPPORTED_CURRENCIES = ['INR', 'USD', 'GBP', 'AED', 'AUD'];

const CURRENCY_KEY = 'nimie_display_currency';
const RATES_KEY = 'nimie_exchange_rates_v1';
const CACHE_DURATION = 24 * 60 * 60 * 1000;

let ratesPromise = null;

export function getSavedCurrency() {
  if (typeof window === 'undefined') return 'INR';

  const saved = localStorage.getItem(CURRENCY_KEY);

  return SUPPORTED_CURRENCIES.includes(saved) ? saved : 'INR';
}

export function saveCurrency(currency) {
  if (
    typeof window === 'undefined' ||
    !SUPPORTED_CURRENCIES.includes(currency)
  ) {
    return;
  }

  localStorage.setItem(CURRENCY_KEY, currency);
  window.dispatchEvent(new Event('nimie:currency-change'));
}

export async function getExchangeRates() {
  if (typeof window === 'undefined') return {INR: 1};

  if (ratesPromise) return ratesPromise;

  ratesPromise = (async () => {
    let cachedRates = null;

    try {
      const cached = localStorage.getItem(RATES_KEY);

      if (cached) {
        const parsed = JSON.parse(cached);
        cachedRates = parsed.rates;

        if (
          parsed.timestamp &&
          Date.now() - parsed.timestamp < CACHE_DURATION &&
          parsed.rates?.INR === 1 &&
          SUPPORTED_CURRENCIES.every(
            (currency) =>
              currency === 'INR' ||
              Number(parsed.rates[currency]) > 0,
          )
        ) {
          return parsed.rates;
        }
      }

      const response = await fetch('/api/exchange-rates');

      if (!response.ok) throw new Error('Exchange-rate request failed');

      const rates = await response.json();

      console.log('Nimie exchange rates loaded:', rates);

      if (
        SUPPORTED_CURRENCIES.some(
          (currency) =>
            !Number.isFinite(rates[currency]) ||
            rates[currency] <= 0,
        )
      ) {
        throw new Error('One or more currency rates are missing');
      }

      localStorage.setItem(
        RATES_KEY,
        JSON.stringify({timestamp: Date.now(), rates}),
      );

      return rates;
    } catch (error) {
      console.error('Unable to load Nimie exchange rates:', error);

      if (
        cachedRates?.INR === 1 &&
        SUPPORTED_CURRENCIES.every(
          (currency) =>
            currency === 'INR' ||
            Number(cachedRates[currency]) > 0,
        )
      ) {
        return cachedRates;
      }

      return null;
    } finally {
      ratesPromise = null;
    }
  })();

  return ratesPromise;
}