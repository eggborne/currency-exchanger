import ExchangeService from "./ExchangeService";

export default class CurrencyExchanger {
  constructor() {
    this.exchangeService = new ExchangeService();

    window.addEventListener('load', async () => {
      document.documentElement.style.setProperty('--actual-height', window.innerHeight + 'px');
      await this.buildCachedData();
      document.getElementById('base-currency-input').addEventListener('change', async e => {
        let currencyName = this.cachedEntryForRegion(e.target.value).currencyName;
        document.querySelector('#amount-input-area > label').innerHTML = `${currencyName}`;
        document.getElementById('base-amount-input').placeholder = `Enter ${e.target.value}...`;
      });
      document.getElementById('target-currency-input').addEventListener('change', async e => {
        let currencyName = this.cachedEntryForRegion(e.target.value).currencyName;
        document.querySelector('#output-area > label').innerHTML = `${currencyName}`;
      });
      document.getElementById('exchange-form').addEventListener('submit', async e => {
        e.preventDefault();
        let baseAmount = document.getElementById('base-amount-input').value;
        let baseRegion = document.getElementById('base-currency-input').value;
        let targetRegion = document.getElementById('target-currency-input').value;
        let convertedAmount = this.convertCurrencyViaUSD(baseRegion, targetRegion, baseAmount);
        document.getElementById('converted-output').value = convertedAmount;
      });
    });
  }

  get cachedData() {
    let data = JSON.parse(sessionStorage.getItem('currency_exchange_data'));
    return data;
  }

  updateCachedItem(regionCode, property, newValue) {
    let newCachedData = [...this.cachedData];
    newCachedData.forEach(item => {
      if (regionCode === item.code) {
        item[property] = newValue;
      }
    });
    sessionStorage.setItem('currency_exchange_data', JSON.stringify(newCachedData));
  }

  cachedEntryForRegion(regionCode) {
    return this.cachedData.filter(entry => entry.code === regionCode)[0] || undefined;
  }

  cachedExchangeRateForRegions(baseCode, targetCode) {
    return (this.cachedEntryForRegion(baseCode) &&
      this.cachedEntryForRegion(baseCode).exchangeRates &&
      this.cachedEntryForRegion(baseCode).exchangeRates[targetCode]) || undefined;
  }

  convertCurrencyViaUSD(baseCode, targetCode, baseAmount) {
    let usdRate = this.cachedEntryForRegion(baseCode).usdExchangeRate;
    let usdAmount = baseAmount * usdRate;
    let convertedAmount = usdAmount * this.cachedExchangeRateForRegions('USD', targetCode);
    return convertedAmount.toFixed(2);
  }

  async buildCachedData() {
    let queryStarted = Date.now();
    let regionInfo = await this.cacheRegionInfo();
    document.querySelector('footer > p:first-child').innerHTML = `${regionInfo.length} currencies listed in ${Date.now() - queryStarted}ms`;
    this.buildRegionDropdowns(regionInfo);
    await this.cacheAllExchangeRatesForRegion(['USD']);
    this.cacheReverseRates('USD');
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
    sessionStorage.setItem('currency_exchange_data', JSON.stringify(cachedData));
    return exchangeRate;
  }

  async cacheAllExchangeRatesForRegion(codeList) {
    let cachedData = [...this.cachedData];
    let ratesObj = await this.exchangeService.getAllExchangeRates(codeList);
    cachedData.forEach(item => {
      if (codeList.includes(item.code)) {
        item.exchangeRates = ratesObj[item.code];
      }
    });
    
    sessionStorage.setItem('currency_exchange_data', JSON.stringify(cachedData));
  }

  async cacheReverseRates(regionCode) {
    let rateList = this.cachedEntryForRegion(regionCode).exchangeRates;
    console.log(rateList);
    for (const code in rateList) {
      let usRate = 1 / rateList[code];
      console.log('declaring reverse of rate', rateList[code], 'to be', usRate);
      this.updateCachedItem(code, 'usdExchangeRate', usRate);
    }
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
      baseOption.innerHTML = targetOption.innerHTML = `${regionObj.currencyName}`;
      baseElement.append(baseOption);
      targetElement.append(targetOption);
    }
    baseElement.value = 'USD';
    targetElement.value = 'JPY';
  }
}