const { default: parse } = require("node-html-parser");

const modify_price = (event) => {
  try {
    const button = event.target;
    const card = button.closest('.card');
    const input = card.querySelector('.modify-price-input');
    const product_id = input.dataset.productId;
    const new_price = input.value;

    fetch('/api/products/' + product_id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      },
      body: JSON.stringify({
        price_number: parseFloat(new_price)
      })
    })
    .then(res => res.json())
    .catch(err => {
      console.error('Error in modify_price fetch:', err);
    });

    console.info(`Modified price of product ${product_id} to new price ${new_price}`);
  } catch (err) {
    console.error(`Error modifying price: ${err}`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const modify_buttons = document.getElementsByClassName('modify-price-button');

  for (const button of modify_buttons) {
    button.addEventListener('click', modify_price);
  }
});