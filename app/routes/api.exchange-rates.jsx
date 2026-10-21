
import {data} from 'react-router';

export async function loader() {
  try {
    const response = await fetch(
      'https://open.er-api.com/v6/latest/INR',
    );

    if (!response.ok) {
      throw new Error(`Exchange-rate API returned ${response.status}`);
    }

    const result = await response.json();

    if (result.result !== 'success' || !result.rates) {
      throw new Error('Invalid exchange-rate response');
    }

    return data(
      {
        INR: 1,
        USD: result.rates.USD,
        GBP: result.rates.GBP,
        AED: result.rates.AED,
        AUD: result.rates.AUD,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600',
        },
      },
    );
  } catch (error) {
    console.error('Exchange-rate route failed:', error);

    throw new Response('Exchange rates unavailable', {
      status: 502,
    });
  }
}