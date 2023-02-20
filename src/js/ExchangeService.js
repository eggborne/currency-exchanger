export default class ExchangeService {
  
  // business logic

  static async getSupportedCodes() {
    let response;
    try {
      response = await fetch(`https://v6.exchangerate-api.com/v6/${process.env.API_KEY}/codes`);
    }
    catch(error) {
      document.getElementById('server-message').innerHTML = `
        <p>getSupportedCodes ERROR:</p>
        <p>${error}</p>
      `;
      throw new Error(error);
    }
    let statusCode = response.status;
    response = await response.json();
    if (statusCode !== 200) {
      this.displayErrorMessage(statusCode, response, 'getSupportedCodes');
      throw new Error(`${statusCode}: ${response['error-type']}`);
    } else {
      if (response.supported_codes.length === 0) {
        document.getElementById('server-message').innerHTML = `
          <p>getSupportedCodes ERROR:</p>
          <p>API returned empty array when fetching currency list</p>
        `;
        throw new Error('API returned empty array when fetching currency list');
      } else {
        return response;
      }
    }
  }

  static async getAllExchangeRates(regionCode) {
    let response;
    try {
      response = await fetch(`https://v6.exchangerate-api.com/v6/${process.env.API_KEY}/latest/${regionCode}`);
    }
    catch(error) {
      document.getElementById('server-message').innerHTML = `
        <p>getAllExchangeRates ERROR:</p>
        <p>${error}</p>
      `;
      throw new Error(error);
    }
    let statusCode = response.status;
    response = await response.json();
    if (statusCode !== 200) {
      this.displayErrorMessage(statusCode, response, 'getAllExchangeRates');
      throw new Error(`${statusCode}: ${response['error-type']}`);
    } else {
      if (response.conversion_rates.length === 0) {
        document.getElementById('server-message').innerHTML = `
          <p>getAllExchangeRates ERROR:</p>
          <p>API returned empty array when fetching conversion rates</p>
        `;
        throw new Error('API returned empty array when fetching conversion rates');
      }
      return response.conversion_rates;
    }
  }

  // UI logic

  static displayErrorMessage(statusCode, jsonResponse, functionName) {
    let errorType = jsonResponse['error-type'].split('-').join(' ').toUpperCase();
    let errorInfo = jsonResponse['extra-info'];
    document.getElementById('server-message').innerHTML = `
      <p>${functionName} ERROR ${statusCode}: ${errorType}</p>
      <p>${errorInfo && errorInfo}</p>
    `;
  }
}