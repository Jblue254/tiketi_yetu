const userData = JSON.parse(localStorage.getItem('checkout_user'));
const cartData = JSON.parse(localStorage.getItem('checkout_cart')) || {};

// Guard clause: Safe parsing check before we touch DOM nodes to prevent runtime crashes
if (!userData || Object.keys(cartData).length === 0) {
  alert("No active session data found.");
  window.location.href = 'index.html';
} else {
  // Inject user details securely into top-level HTML viewports safely inside else block
  if (document.querySelector('#summary-name')) document.querySelector('#summary-name').textContent = userData.name || 'N/A';
  if (document.querySelector('#summary-email')) document.querySelector('#summary-email').textContent = userData.email || 'N/A';
  if (document.querySelector('#summary-github')) document.querySelector('#summary-github').textContent = userData.JBLUE ? `@${userData.JBLUE}` : 'N/A';
}

const cartContainer = document.querySelector('#order-breakdown-container');
const totalPriceDisplay = document.querySelector('#summary-price');



function renderCartItems() {
  if (!cartContainer) return;

  if (Object.keys(cartData).length === 0) {
    cartContainer.innerHTML = `<p class="text-slate-500 text-sm">Your cart is empty.</p>`;
    if (totalPriceDisplay) totalPriceDisplay.textContent = "0 KES"; 
    return;
  }

  // Generate individual element loops dynamically
  cartContainer.innerHTML = Object.values(cartData).map(item => {
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

// Change individual item quantities up or down dynamically
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

// Sum up totals across all dynamic type rows
function calculateGrandTotal() {
  let grandTotal = 0;

  Object.values(cartData).forEach(item => {
    const priceInt = parseInt(String(item.price).replace(/[^0-9]/g, ''), 10) || 0;
    grandTotal += (priceInt * item.quantity);
  });

  if (totalPriceDisplay) {
    totalPriceDisplay.textContent = `${grandTotal.toLocaleString()} KES`;
  }
}



// receipt markdown converter
function generateReceiptMarkdown(user, cart, total) {
  let receiptText = `
^^^ TRANSACTION RECEIPT
---
Customer: ${user.name}
Email: ${user.email}
GitHub: @${user.JBLUE || 'N/A'}
---
{w:*, 12}
Item | Total Price
---
`;

  Object.values(cart).forEach(item => {
    const priceInt = parseInt(String(item.price).replace(/[^0-9]/g, ''), 10) || 0;
    const itemTotal = priceInt * item.quantity;
    receiptText += `${item.name} x${item.quantity} | ${itemTotal.toLocaleString()} KES\n`;
  });

  receiptText += `
---
{a:right}
^^ GRAND TOTAL: ${total.toLocaleString()} KES
===
{a:center}
Thank you for your purchase!
`;

  return receiptText;
}



document.querySelector('#btn-pay')?.addEventListener('click', (e) => {
  e.preventDefault(); // Prevents forms from accidentally reloading the page on click
  
  if (!userData || Object.keys(cartData).length === 0) {
    alert("Cannot process payment: Cart is empty or session expired.");
    return;
  }
  
  let grandTotal = 0;
  Object.values(cartData).forEach(item => {
    const priceInt = parseInt(String(item.price).replace(/[^0-9]/g, ''), 10) || 0;
    grandTotal += (priceInt * item.quantity);
  });

  // Create the receipt markdown 
  const receiptMarkdown = generateReceiptMarkdown(userData, cartData, grandTotal);
  
  // Save a clean snapshot for the receipt page before we modify anything else
  localStorage.setItem('last_order_user', JSON.stringify(userData));
  localStorage.setItem('last_order_cart', JSON.stringify(cartData));
  localStorage.setItem('last_order_markdown', receiptMarkdown);

  alert(`Processing your payment for your selected tickets! A transaction confirmation was deployed directly to ${userData.email}.`);
  
 
  localStorage.removeItem('checkout_cart'); 
  
  
  window.location.href = 'receipt.html'; 
});

// Run rendering workflows on initialization loop
renderCartItems();