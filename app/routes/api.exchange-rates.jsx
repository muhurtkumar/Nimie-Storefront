import {data} from 'react-router';

export async function loader() {
  try {
    const response = await fetch(
      'https://open.er-api.com/v6/latest/INR',
      {
        headers: {
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Exchange-rate API returned ${response.status}`);
    }

    const result = await response.json();

    if (
      result.result !== 'success' ||
      !result.rates ||
      !Number.isFinite(result.rates.USD)
    ) {
      throw new Error('Invalid exchange-rate response');
    }

    const rates = {
      ...result.rates,
      INR: 1,
    };

    console.log(
      'Exchange-rate currency count:',
      Object.keys(rates).length,
    );

    return data(rates, {
      headers: {
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Exchange-rate route failed:', error);

    throw new Response('Exchange rates unavailable', {
      status: 502,
    });
  }
}