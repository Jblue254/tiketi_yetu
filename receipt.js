const orderUser = JSON.parse(localStorage.getItem('last_order_user'));
const orderCart = JSON.parse(localStorage.getItem('last_order_cart')) || {};

// Map variables directly to your exact HTML container IDs
const nameDisplay = document.querySelector('#receipt-name');
const emailDisplay = document.querySelector('#receipt-email');
const handleDisplay = document.querySelector('#receipt-github');
const itemsContainer = document.querySelector('#receipt-items-container');
const subtotalDisplay = document.querySelector('#receipt-subtotal');
const vatDisplay = document.querySelector('#receipt-vat');
const totalDisplay = document.querySelector('#receipt-total');

// Guard check: Halt execution if data fails to pass through
if (!orderUser || Object.keys(orderCart).length === 0) {
  console.warn("No active receipt data found in local storage.");
} else {
  renderReceiptDashboard();
}


function renderReceiptDashboard() {
  // 1. Inject User Attendee Fields
  if (nameDisplay) nameDisplay.textContent = orderUser.name || 'N/A';
  if (emailDisplay) emailDisplay.textContent = orderUser.email || 'N/A';
  if (handleDisplay) handleDisplay.textContent = orderUser.JBLUE ? `@${orderUser.JBLUE}` : '@-';

  // 2. Clear out any dummy template markup inside the items container
  if (itemsContainer) itemsContainer.innerHTML = '';

  let checkoutTotalValue = 0;

  // 3. Loop through your cart data array items dynamically
  Object.values(orderCart).forEach(item => {
    const priceInt = parseInt(String(item.price).replace(/[^0-9]/g, ''), 10) || 0;
    const itemTotalValue = priceInt * item.quantity;
    checkoutTotalValue += itemTotalValue;

    // Build the individual line item structures using your Tailwind palette design
    if (itemsContainer) {
      itemsContainer.innerHTML += `
        <div class="flex justify-between items-center text-slate-300 py-1 print:text-black">
          <div class="flex flex-col">
            <span class="font-medium">${item.name}</span>
            <span class="text-xs text-slate-500 print:text-gray-500">${item.quantity} × ${item.price}</span>
          </div>
          <span class="font-mono font-medium">${itemTotalValue.toLocaleString()} KES</span>
        </div>
      `;
    }
  });

  
  // Formula: VAT Amount = Total - (Total / 1.16)
  const vatValue = Math.round(checkoutTotalValue - (checkoutTotalValue / 1.16));
  const subtotalValue = checkoutTotalValue - vatValue;
  const grandTotalValue = checkoutTotalValue; // exactly what they paid on checkout page

  // 5. Update layout elements with formatted string output structures
  if (subtotalDisplay) subtotalDisplay.textContent = `${subtotalValue.toLocaleString()} KES`;
  if (vatDisplay) vatDisplay.textContent = `${vatValue.toLocaleString()} KES`;
  if (totalDisplay) totalDisplay.textContent = `${grandTotalValue.toLocaleString()} KES`;
}