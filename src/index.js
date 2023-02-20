import './css/style.css';
import CurrencyExchanger from './js/CurrencyExchanger';

window.addEventListener('load', async () => {
  let app = new CurrencyExchanger();
  document.documentElement.style.setProperty('--actual-height', window.innerHeight + 'px');
  let queryStarted = Date.now();
  await app.cacheRegionInfo();
  document.querySelector('footer > p').innerHTML = `${app.cachedData.length} currencies listed in ${Date.now() - queryStarted}ms`;
  app.buildRegionDropdowns();
  await app.cacheAllExchangeRatesForRegion(app.defaultBaseRegion);
  app.cacheReverseRates(app.defaultBaseRegion);
  app.setEventListeners();
});

