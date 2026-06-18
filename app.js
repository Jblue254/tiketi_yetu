const ticketTiersAPI = [
  { id: "regular_pass", name: "Regular Pass", price: "1000 KES", location: "Nairobi, Kenya" },
  { id: "vip_experience", name: "VIP Experience", price: "3500 KES", location: "Nairobi, Kenya" },
  { id: "vvip_gold", name: "VVIP Golden Circle", price: "7000 KES", location: "Nairobi, Kenya" }
];

let shoppingCart = {};

const ticketListContainer = document.querySelector('#ticket-api-list');
const formFiller = document.querySelector('#form_filler');
const instructionText = document.querySelector('#form-instruction');

function renderTickets() {
  if (!ticketListContainer) return;

  ticketListContainer.innerHTML = ticketTiersAPI.map(ticket => `
    <div data-id="${ticket.id}" 
         class="ticket-card w-full max-w-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-orange-500/50 rounded-3xl p-6 relative overflow-hidden shadow-2xl cursor-pointer transition-all active:scale-[0.99]">
      <div class="flex justify-between items-start">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-slate-900 border border-slate-800 rounded-xl">
            <svg class="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-lg leading-tight tracking-wide text-white">${ticket.name}</h3>
            <p class="text-slate-500 text-xs font-medium">${ticket.location}</p>
          </div>
        </div>
        <span class="font-mono text-sm text-orange-400 bg-slate-950 px-2.5 py-1 border border-slate-900 rounded-md shadow-inner font-bold">
          ${ticket.price}
        </span>
      </div>
      <div class="flex items-center gap-4 mt-6 border-t border-slate-900/50 pt-4 text-xs text-slate-500 justify-between">
        <span>Click to add / toggle selection</span>
        <span class="text-orange-500 font-medium text-[10px] tracking-wider uppercase opacity-0 card-badge">In Cart</span>
      </div>
    </div>
  `).join('');

  attachCardListeners();
}

function attachCardListeners() {
  document.querySelectorAll('.ticket-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      const ticketInfo = ticketTiersAPI.find(t => t.id === id);
      
      if (ticketInfo) {
        toggleCartItem(ticketInfo, card);
      }
    });
  });
}

function toggleCartItem(ticket, cardElement) {
  if (shoppingCart[ticket.id]) {
    
    delete shoppingCart[ticket.id];
    cardElement.classList.remove('border-orange-500');
    cardElement.querySelector('.card-badge')?.classList.add('opacity-0');
  } else {
    // Add item with default baseline quantity of 1
    shoppingCart[ticket.id] = { ...ticket, quantity: 1 };
    cardElement.classList.add('border-orange-500');
    cardElement.querySelector('.card-badge')?.classList.remove('opacity-0');
  }

  const selectedCount = Object.keys(shoppingCart).length;
  if (instructionText) {
    instructionText.innerHTML = selectedCount > 0 
      ? `Selected <span class="text-orange-400 font-bold">${selectedCount} ticket type(s)</span>. Enter details to proceed.`
      : `Please select a ticket option below to begin.`;
  }
}

formFiller?.addEventListener('submit', (e) => {
  e.preventDefault();
  
  if (Object.keys(shoppingCart).length === 0) {
    alert('Please select at least one ticket type below first!');
    return;
  }

  const formData = new FormData(formFiller);
  
  // Save user profile state & items object directly into localStorage
  localStorage.setItem('checkout_user', JSON.stringify(Object.fromEntries(formData)));
  localStorage.setItem('checkout_cart', JSON.stringify(shoppingCart));

  window.location.href = '/checkout.html';
});

renderTickets();