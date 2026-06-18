
// Recover states safely from local storage vectors
const userData = JSON.parse(localStorage.getItem('checkout_user'));
const cartData = JSON.parse(localStorage.getItem('checkout_cart')) || {};

if (!userData || Object.keys(cartData).length === 0) {
  alert("No active session data found.");
  window.location.href = 'index.html';
}

// Populate user data components
document.querySelector('#summary-name').textContent = userData.name;
document.querySelector('#summary-email').textContent = userData.email;
document.querySelector('#summary-github').textContent = `@${userData.JBLUE}`;

const cartContainer = document.querySelector('#order-breakdown-container');
const totalPriceDisplay = document.querySelector('#summary-price');

//Render out item groups dynamically based on selections made

function renderCartItems() {
  if (!cartContainer) return;

  if (Object.keys(cartData).length === 0) {
    cartContainer.innerHTML = `<p class="text-slate-500 text-sm">Your cart is empty.</p>`;
    return;
  }

  // Generate individual element loops dynamically
  cartContainer.innerHTML = Object.values(cartData).map(item => {
    const numericPrice = parseInt(item.price.replace(/[^0-9]/g, ''), 10) || 0;
    return `
      <div class="flex justify-between items-center py-3 border-b border-slate-900/40 last:border-0" data-item-id="${item.id}">
        <div class="flex flex-col">
          <span class="font-bold text-sm text-slate-200">${item.name}</span>
          <span class="text-xs text-slate-500">${item.price} each</span>
        </div>
        <div class="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl p-1">
          <button type="button" onclick="adjustQty('${item.id}', -1)" class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-900 cursor-pointer font-bold">-</button>
          <span class="font-mono text-sm font-bold w-4 text-center">${item.quantity}</span>
          <button type="button" onclick="adjustQty('${item.id}', 1)" class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-900 cursor-pointer font-bold">+</button>
        </div>
      </div>
    `;
  }).join('');

  calculateGrandTotal();
}


//Change individual item quantities up or down dynamically
window.adjustQty = function(id, change) {
  if (!cartData[id]) return;

  cartData[id].quantity += change;

  // Drop item completely if quantity hits zero
  if (cartData[id].quantity <= 0) {
    delete cartData[id];
  }

  // Update persistent state storage and sync layout engine viewports
  localStorage.setItem('checkout_cart', JSON.stringify(cartData));
  renderCartItems();
};


//Sum up totals across all dynamic type rows
 
function calculateGrandTotal() {
  let grandTotal = 0;

  Object.values(cartData).forEach(item => {
    const priceInt = parseInt(item.price.replace(/[^0-9]/g, ''), 10) || 0;
    grandTotal += (priceInt * item.quantity);
  });

  if (totalPriceDisplay) {
    totalPriceDisplay.textContent = `${grandTotal.toLocaleString()} KES`;
  }
}

document.querySelector('#btn-pay')?.addEventListener('click', () => {
  alert(`Processing your payment for your selected tickets! A transaction confirmation was deployed directly to ${userData.email}.`);
  localStorage.clear(); 
});

// Run rendering workflows on initialization loop
renderCartItems();