import './css/style.css';
import CurrencyExchanger from './js/CurrencyExchanger';

window.addEventListener('load', async () => {
  new CurrencyExchanger().buildCachedData();
});

