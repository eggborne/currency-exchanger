export default class ExchangeService {
  
  // business logic

  static async getSupportedCodes() {
    let response = await fetch(`https://v6.exchangerate-api.com/v6/${process.env.API_KEY}/codes`);
    let statusCode = response.status;
    response = await response.json();
    if (statusCode !== 200) {
      throw new Error(`${statusCode}: ${response['error-type']}`);
    } else {
      return response;
    }
  }

  static async getAllExchangeRates(regionCode) {
    let response = await fetch(`https://v6.exchangerate-api.com/v6/${process.env.API_KEY}/latest/${regionCode}`);
    let statusCode = response.status;
    response = await response.json();
    if (statusCode !== 200) {
      throw new Error(`${statusCode}: ${response['error-type']}`);
    } else {
      return response.conversion_rates;
    }
  }

  // UI logic

  static displayErrorMessage(statusCode, jsonResponse) {
    let errorType = jsonResponse['error-type'].split('-').join(' ').toUpperCase();
    let errorInfo = jsonResponse['extra-info'];
    document.getElementById('server-message').innerHTML = `
      <p>ERROR ${statusCode}: ${errorType}</p>
      <p>${errorInfo || '&nbsp;'}</p>
    `;
  }
}