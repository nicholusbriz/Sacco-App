// Exchange Rate API Functions 
export async function getExchangeRates(baseCurrency = 'USD') {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_EXCHANGE_API_URL}/${import.meta.env.VITE_EXCHANGE_API_KEY}/latest/${baseCurrency}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    throw error;
  }
}

// Get specific currency conversion using same API
export async function convertCurrency(from = 'USD', to = 'UGX', amount = 1) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_EXCHANGE_API_URL}/${import.meta.env.VITE_EXCHANGE_API_KEY}/pair/${from}/${to}/${amount}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error converting currency:', error);
    throw error;
  }
}

// Get all supported currencies
export async function getSupportedCurrencies() {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_EXCHANGE_API_URL}/${import.meta.env.VITE_EXCHANGE_API_KEY}/codes`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching supported currencies:', error);
    throw error;
  }
}

// Main function to get USD to UGX rate with fallback
export async function getUSDToUGXRate() {
  try {
    // Try primary API first
    const data = await getExchangeRates('USD');
    return {
      rate: data.conversion_rates.UGX,
      source: 'ExchangeRate-API',
      date: data.time_last_update_unix,
      base: 'USD',
      target: 'UGX'
    };
  } catch {
    console.error('Unable to fetch exchange rates from primary API');
    throw new Error('Unable to fetch exchange rates from primary API');
  }
}
