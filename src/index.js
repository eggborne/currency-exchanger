import './css/style.css';
import CurrencyExchanger from './js/CurrencyExchanger';

window.addEventListener('load', async () => {
  let loadedAt = Date.now();
  document.documentElement.style.setProperty('--actual-height', window.innerHeight + 'px');
  let app = new CurrencyExchanger();
  let queryStarted = Date.now();
  await app.cacheRegionInfo();
  document.querySelector('footer > p').innerHTML = `${app.cachedData.length} currencies listed in ${Date.now() - queryStarted}ms`;
  app.buildRegionDropdowns();
  queryStarted = Date.now();
  await app.cacheAllExchangeRatesForRegion(app.defaultBaseRegion);
  app.cacheReverseRates(app.defaultBaseRegion);
  document.querySelector('footer > p:nth-child(2)').innerHTML = `Rates cached in ${Date.now() - queryStarted}ms`;
  app.setEventListeners();
  document.querySelector('footer > p:last-child').innerHTML = `Ready in ${Date.now() - loadedAt}ms`;

});

