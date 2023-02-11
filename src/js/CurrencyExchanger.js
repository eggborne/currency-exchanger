import ExchangeService from "./ExchangeService";

export default class CurrencyExchanger {
  constructor() {
    this.exchangeService = new ExchangeService();

    window.addEventListener('load', async () => {
      await this.buildCachedData();
      document.getElementById('base-currency-input').addEventListener('change', e => { 
        document.getElementById('base-amount-input').placeholder = `Enter ${e.target.value}...`;
      });
      document.getElementById('target-currency-input').addEventListener('change', e => {
        let currencyName = this.cachedEntryForRegion(e.target.value).currencyName;
        document.querySelector('#output-area > label').innerHTML = `${currencyName}`;
      });
      document.getElementById('exchange-form').addEventListener('submit', async e => {
        e.preventDefault();
        let baseAmount = document.getElementById('base-amount-input').value;
        let baseRegion = document.getElementById('base-currency-input').value;
        let targetRegion = document.getElementById('target-currency-input').value;
        let convertedAmount = await this.convertCurrency(baseRegion, targetRegion, baseAmount);
        document.getElementById('converted-output').value = convertedAmount;
      });
    });

  }

  get cachedData() {
    let data = JSON.parse(sessionStorage.getItem('currency_exchange_data'));
    return data;
  }

  cachedEntryForRegion(regionCode) {
    return this.cachedData.filter(entry => entry.code === regionCode)[0] || undefined;
  }

  cachedExchangeRateForRegions(baseCode, targetCode) {
    return (this.cachedEntryForRegion(baseCode) &&
      this.cachedEntryForRegion(baseCode).exchangeRates &&
      this.cachedEntryForRegion(baseCode).exchangeRates[targetCode]) || undefined;
  }

  async convertCurrency(baseCode, targetCode, baseAmount) {
    let baseInfo = this.cachedEntryForRegion(targetCode);
    if (baseInfo) {
      let exchangeRate = await this.cachedExchangeRateForRegions(baseCode, targetCode);
      if (!exchangeRate) {
        exchangeRate = await this.cacheExchangeRate(baseCode, targetCode);
      }
      return (baseAmount * exchangeRate).toFixed(2);
    }
  }

  async buildCachedData() {
    let regionInfo = await this.cacheRegionInfo();
    this.buildRegionDropdowns(regionInfo);
    await this.cacheAllExchangeRatesForRegion(['USD']);
  }

  async cacheRegionInfo() {
    let response = await this.exchangeService.getSupportedCodes();
    let output;
    if (response.supported_codes) {
      if (response.supported_codes.length > 0) {
        let regionInfoList = [];
        response.supported_codes.forEach(codeArr => {
          let code = codeArr[0];
          let currencyName = codeArr[1];
          regionInfoList.push({ code, currencyName });
        });
        sessionStorage.setItem('currency_exchange_data', JSON.stringify(regionInfoList));
        output = regionInfoList;
      } else {
        throw new Error(`Region call succeeded but returned empty array`);
      }
    }
    return output;
  }

  async cacheExchangeRate(baseCode, targetCode) {
    let cachedData = [...this.cachedData];
    let exchangeRate = await this.exchangeService.getExchangeRate(baseCode, targetCode);    
    cachedData.forEach(item => {
      if (baseCode === item.code) {
        if (!item.exchangeRates) {
          item.exchangeRates = {};
        }
        item.exchangeRates[targetCode] = exchangeRate;
      }
    });
    this.cachedData = cachedData;
    return exchangeRate;
  }

  async cacheAllExchangeRatesForRegion(codeList) { // takes > 30 seconds to do all regions
    let cachedData = [...this.cachedData];
    let ratesObj = await this.exchangeService.getAllExchangeRates(codeList);
    cachedData.forEach(item => {
      if (codeList.includes(item.code)) {
        item.exchangeRates = ratesObj[item.code];
      }
    });
    sessionStorage.setItem('currency_exchange_data', JSON.stringify(cachedData));
  }

  buildRegionDropdowns(regionData) {
    let baseElement = document.getElementById('base-currency-input');
    let targetElement = document.getElementById('target-currency-input');
    for (const regionObj of regionData) {
      let baseOption = document.createElement('option');
      let targetOption = document.createElement('option');
      baseOption.name = 'base-currency-input';
      targetOption.name = 'target-currency-input';
      baseOption.value = targetOption.value = regionObj.code;
      baseOption.innerHTML = targetOption.innerHTML = `${regionObj.code} - ${regionObj.currencyName}`;
      baseElement.append(baseOption);
      targetElement.append(targetOption);
    }
    baseElement.value = 'USD';
    targetElement.value = 'JPY';
  }
}