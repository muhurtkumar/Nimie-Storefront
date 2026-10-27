const CURRENCY_KEY = 'nimie_display_currency';
const RATES_KEY = 'nimie_exchange_rates_v1';
const CACHE_DURATION = 24 * 60 * 60 * 1000;

let ratesPromise = null;

export function getSavedCurrency() {
  if (typeof window === 'undefined') return 'INR';

  const saved = localStorage.getItem(CURRENCY_KEY);

  // Validate the format here. The actual supported currencies are
  // determined by the exchange-rate API.
  return saved && /^[A-Z]{3}$/.test(saved) ? saved : 'INR';
}

export function saveCurrency(currency) {
  if (
    typeof window === 'undefined' ||
    typeof currency !== 'string' ||
    !/^[A-Z]{3}$/.test(currency)
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
          cachedRates?.INR === 1 &&
          cachedRates?.USD > 0 &&
          Object.keys(cachedRates).length >= 10
        ) {
          return cachedRates;
        }
      }

      const response = await fetch('/api/exchange-rates');

      if (!response.ok) {
        throw new Error('Exchange-rate request failed');
      }

      const rates = await response.json();

      if (
        rates.INR !== 1 ||
        !Number.isFinite(rates.USD) ||
        rates.USD <= 0 ||
        Object.keys(rates).length < 10
      ) {
        throw new Error('Invalid or incomplete exchange-rate data');
      }

      localStorage.setItem(
        RATES_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          rates,
        }),
      );

      return rates;
    } catch (error) {
      console.error('Unable to load Nimie exchange rates:', error);

      if (cachedRates?.INR === 1 && cachedRates?.USD > 0) {
        return cachedRates;
      }

      return null;
    } finally {
      ratesPromise = null;
    }
  })();

  return ratesPromise;
}