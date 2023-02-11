export default class ExchangeService {
  constructor() {
    this.baseUrl = `https://v6.exchangerate-api.com/v6/`;
  }

  async getSupportedCodes() {
    let response = await fetch(`${this.baseUrl}${process.env.API_KEY}/codes`);
    let statusCode = response.status;
    response = await response.json();
    if (statusCode !== 200) {
      throw new Error(`${statusCode}: ${response['error-type']}`);
    } else {
      return response;
    }
  }

  async getExchangeRate(baseCode, targetCode) {
    let response = await fetch(`${this.baseUrl}${process.env.API_KEY}/pair/${baseCode}/${targetCode}`);
    let statusCode = response.status;
    response = await response.json();
    if (statusCode !== 200) {
      throw new Error(`${statusCode}: ${response['error-type']}`);
    } else {
      let exchangeRate = response.conversion_rate;
      return exchangeRate;
    }
  }

  async getAllExchangeRates(regionArray) {
    let ratesForEachRegionObj = {};
    for (const regionCode of regionArray) {
      let response = await fetch(`${this.baseUrl}${process.env.API_KEY}/latest/${regionCode}`);
      let statusCode = response.status;
      response = await response.json();
      if (statusCode !== 200) {
        throw new Error(`${statusCode}: ${response['error-type']}`);
      } else {
        ratesForEachRegionObj[regionCode] = response.conversion_rates;
      }
    }
    return ratesForEachRegionObj;
  }

  displayErrorMessage(statusCode, jsonResponse) {
    let errorType = jsonResponse['error-type'].split('-').join(' ').toUpperCase();
    let errorInfo = jsonResponse['extra-info'];
    document.getElementById('server-message').innerHTML = `
        <p>ERROR ${statusCode}: ${errorType}</p>
        <p>${errorInfo}</p>
      `;
  }
}