import './css/style.css';
import CurrencyExchanger from './js/CurrencyExchanger';

window.addEventListener('load', async () => {
  let app = new CurrencyExchanger();
  await app.buildCachedData();
  let testConversion = await app.convertCurrency('USD', 'GBP', 100);
  document.body.innerHTML += `100 USD equals ${testConversion} GBP`;

});

