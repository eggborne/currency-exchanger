export default class ExchangeService {
  constructor() {
    this.baseUrl = `https://v6.exchangerate-api.com/v6/${process.env.API_KEY}`;
  }

  // business logic

  async getSupportedCodes() {
    let response = await fetch(`${this.baseUrl}/codes`);
    let statusCode = response.status;
    response = await response.json();
    if (statusCode !== 200) {
      throw new Error(`${statusCode}: ${response['error-type']}`);
    } else {
      return response;
    }
  }

  async getExchangeRate(baseCode, targetCode) {
    let response = await fetch(`${this.baseUrl}/pair/${baseCode}/${targetCode}`);
    let statusCode = response.status;
    response = await response.json();
    if (statusCode !== 200) {
      this.displayErrorMessage(statusCode, response);
      throw new Error(`${statusCode}: ${response['error-type']}`);
    } else {
      let exchangeRate = response.conversion_rate;
      return exchangeRate;
    }
  }

  async getAllExchangeRates(regionCode) {
    let response = await fetch(`${this.baseUrl}/latest/${regionCode}`);
    let statusCode = response.status;
    response = await response.json();
    if (statusCode !== 200) {
      throw new Error(`${statusCode}: ${response['error-type']}`);
    } else {
      return response.conversion_rates;
    }
  }

  // UI logic

  displayErrorMessage(statusCode, jsonResponse) {
    let errorType = jsonResponse['error-type'].split('-').join(' ').toUpperCase();
    let errorInfo = jsonResponse['extra-info'];
    document.getElementById('server-message').innerHTML = `
      <p>ERROR ${statusCode}: ${errorType}</p>
      <p>${errorInfo || '&nbsp;'}</p>
    `;
  }
}