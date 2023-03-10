import ExchangeService from "./ExchangeService";

export default class CurrencyExchanger {
  constructor() {
    this.defaultBaseRegion = 'USD';
    this.defaultTargetRegion = 'JPY';
  }

  get cachedData() {
    return JSON.parse(sessionStorage.getItem('currency_exchange_data'));
  }

  set cachedData(newCachedData) {
    sessionStorage.setItem('currency_exchange_data', JSON.stringify(newCachedData));
  }

  // business logic

  updateCachedItem(regionCode, property, newValue) {
    let newCachedData = [...this.cachedData];
    newCachedData.forEach(item => {
      if (regionCode === item.code) {
        item[property] = newValue;
      }
    });
    this.cachedData = newCachedData;
  }

  cachedEntryForRegion(regionCode) {
    return this.cachedData.filter(entry => entry.code === regionCode)[0] || undefined;
  }

  cachedExchangeRateForRegions(baseCode, targetCode) {
    return (this.cachedEntryForRegion(baseCode) &&
      this.cachedEntryForRegion(baseCode).exchangeRates &&
      this.cachedEntryForRegion(baseCode).exchangeRates[targetCode]) || undefined;
  }

  async cacheRegionInfo() {
    let response = await ExchangeService.getSupportedCodes();
    if (response.supported_codes) {
      if (response.supported_codes.length > 0) {
        let regionInfoList = [];
        response.supported_codes.forEach(codeArr => {
          let code = codeArr[0];
          let currencyName = codeArr[1];
          regionInfoList.push({ code, currencyName });
        });
        this.cachedData = regionInfoList;
      } else {
        throw new Error(`Region call succeeded but returned empty array`);
      }
    }
  }

  async cacheAllExchangeRatesForRegion(regionCode) {
    let newCachedData = [...this.cachedData];
    let rates = await ExchangeService.getAllExchangeRates(regionCode);
    newCachedData.forEach(item => {
      if (regionCode === item.code) {
        item.exchangeRates = rates;
      }
    });
    this.cachedData = newCachedData;
  }

  cacheReverseRates(regionCode) {
    let rateList = this.cachedEntryForRegion(regionCode).exchangeRates;
    for (const code in rateList) {
      let defaultRate = 1 / rateList[code];
      this.updateCachedItem(code, 'defaultRegionExchangeRate', defaultRate);
    }
  }

  convertCurrency(baseCode, targetCode, baseAmount) {
    if (!this.cachedEntryForRegion(baseCode)) {
      document.getElementById('server-message').innerHTML = `
        <p>ERROR: REGION ${baseCode} NOT FOUND</p>
      `;
      return;
    }
    let defaultRegionAmount = baseAmount * this.cachedEntryForRegion(baseCode).defaultRegionExchangeRate;
    let convertedAmount = defaultRegionAmount * this.cachedExchangeRateForRegions(this.defaultBaseRegion, targetCode);
    return convertedAmount.toFixed(2);
  }

  // UI logic

  buildRegionDropdowns() {
    let baseElement = document.getElementById('base-currency-input');
    let targetElement = document.getElementById('target-currency-input');
    for (const regionObj of this.cachedData) {
      let baseOption = document.createElement('option');
      let targetOption = document.createElement('option');
      baseOption.name = 'base-currency-input';
      targetOption.name = 'target-currency-input';
      baseOption.value = targetOption.value = regionObj.code;
      baseOption.innerHTML = targetOption.innerHTML = `${regionObj.currencyName}`;
      baseElement.append(baseOption);
      targetElement.append(targetOption);
    }
    baseElement.value = this.defaultBaseRegion;
    targetElement.value = this.defaultTargetRegion;
    document.querySelector('form button').disabled = false;
  }

  setEventListeners() {
    document.getElementById('base-currency-input').addEventListener('change', async e => {
      let currencyName = this.cachedEntryForRegion(e.target.value).currencyName;
      document.querySelector('#amount-input-area > label').innerHTML = currencyName;
      document.getElementById('base-amount-input').placeholder = `Enter ${e.target.value}...`;
    });
    document.getElementById('target-currency-input').addEventListener('change', async e => {
      let currencyName = this.cachedEntryForRegion(e.target.value).currencyName;
      document.querySelector('#output-area > label').innerHTML = currencyName;
    });
    document.getElementById('exchange-form').addEventListener('submit', async e => {
      e.preventDefault();
      let baseAmount = document.getElementById('base-amount-input').value;
      let baseRegion = document.getElementById('base-currency-input').value;
      let targetRegion = document.getElementById('target-currency-input').value;
      let convertedAmount = this.convertCurrency(baseRegion, targetRegion, baseAmount);
      document.getElementById('converted-output').value = convertedAmount;
    });
  }
}