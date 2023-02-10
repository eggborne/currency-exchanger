export default class ExchangeService {
  constructor() {
    this.baseUrl = `https://v6.exchangerate-api.com/v6/`;
  }

  async getSupportedCodes(text) {
    let response = await fetch(`${this.baseUrl}${process.env.API_KEY}/codes`);
    let statusCode = response.status;
    let jsonResponse = await response.json();
    if (statusCode !== 200) {
      throw new Error(`${response.status}: ${jsonResponse['error-type']}`);
    } else {
      return jsonResponse;
    }
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