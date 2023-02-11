import './css/style.css';
import CurrencyExchanger from './js/CurrencyExchanger';

window.addEventListener('load', async () => {
  let app = new CurrencyExchanger();
  document.getElementById('target-currency-input').addEventListener('change', e => {
    console.log(e.target.value);
  });
});

