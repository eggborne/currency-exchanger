import ExchangeService from "./ExchangeService";

export default class CurrencyExchanger {
  constructor() {
    this.exchangeService = new ExchangeService();
    this.sessionCache = sessionStorage;
  }

  get cachedData() {
    let parsedData = JSON.parse(this.sessionCache.getItem('currency_exchange_data'));
    return parsedData;
  }

  async buildCachedData() {
    this.cacheRegionInfo();
  }

  async cacheRegionInfo() {
    let response = await this.exchangeService.getSupportedCodes();
    if (response.supported_codes) {
      if (response.supported_codes.length > 0) {
        let regionInfoList = [];
        response.supported_codes.forEach(codeArr => {
          let code = codeArr[0];
          let regionName = codeArr[1].split(' ')[0];
          let currencyName = codeArr[1].split(' ')[1];
          let regionInfoObj = {
            code: code,
            regionName: regionName,
            currencyName: currencyName,
          };
          regionInfoList.push(regionInfoObj);
        });
        this.sessionCache.setItem('currency_exchange_data', JSON.stringify(regionInfoList));
        console.log('this.cachedData after region call:', this.cachedData);
      } else {
        return [];
      }
    }

    let queryCount = parseInt(localStorage.getItem('currency_queries')) + 1 || 1;
    document.getElementById('debug').innerHTML = `<p>${queryCount}</p>`;
    localStorage.setItem('currency_queries', queryCount);

  }
}