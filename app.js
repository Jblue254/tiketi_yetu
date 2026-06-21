let ticketTiersAPI = []; 
let shoppingCart = {};

// Primary DOM Elements Selectors
const ticketListContainer = document.querySelector('#ticket-api-list');
const formFiller = document.querySelector('#form_filler');
const instructionText = document.querySelector('#form-instruction');
const searchBar = document.querySelector('#catalog-search');

// Async Fetch Request to load raw ticket data stream from JSON
async function loadTicketsFromAPI() {
  try {
    const response = await fetch('tickets.json');
    if (!response.ok) throw new Error('Network response failure fetching data asset');
    
    ticketTiersAPI = await response.json();
    
 
    const urlParams = new URLSearchParams(window.location.search);
    const targetId = urlParams.get('id');

    if (targetId) {
      const preSelectedTicket = ticketTiersAPI.find(t => t.id === targetId);
      if (preSelectedTicket) {
        // 1. Auto-select the item into the cart
        shoppingCart[preSelectedTicket.id] = { ...preSelectedTicket, quantity: 1 };
        updateInstructionText();
        
        // 2. Slide down to the form container smoothly
        setTimeout(() => {
          if (formFiller) {
            formFiller.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // 3. Find the first input field and focus the typing cursor into it automatically
            const firstInput = formFiller.querySelector('input:not([readonly])');
            if (firstInput) firstInput.focus();
          }
        }, 150);
      }
    }
    

    renderTickets(); 
  } catch (error) {
    console.error("Error loading the ticket API file:", error);
    if (ticketListContainer) {
      ticketListContainer.innerHTML = `
        <div class="text-center py-6 text-red-400 text-xs font-mono">
          <i class="fa-solid fa-triangle-exclamation block text-lg mb-2"></i>
          Failed to load ticket options. Please verify you are using a local server environment.
        </div>`;
    }
  }
}

// Generate and Render Ticket Cards dynamically
function renderTickets(ticketsToRender = ticketTiersAPI) {
  if (!ticketListContainer) return;

  if (ticketsToRender.length === 0) {
    ticketListContainer.innerHTML = `
      <div class="text-center py-12 text-slate-600 text-sm">
        No available tickets or artists matching your search.
      </div>`;
    return;
  }

  ticketListContainer.innerHTML = ticketsToRender.map(ticket => {
    const isInCart = shoppingCart[ticket.id];
    
    return `
      <div data-id="${ticket.id}" 
           class="ticket-card w-full max-w-xl bg-gradient-to-br from-slate-900 to-slate-950 border ${isInCart ? 'border-orange-500 shadow-orange-950/10' : 'border-slate-800'} hover:border-orange-500/50 rounded-3xl p-6 relative overflow-hidden shadow-2xl cursor-pointer transition-all active:scale-[0.99]">
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center w-10 h-10">
              <i class="fa-solid fa-ticket text-orange-500 text-lg"></i>
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
          <span class="text-orange-500 font-medium text-[10px] tracking-wider uppercase transition-opacity ${isInCart ? 'opacity-100' : 'opacity-0'} card-badge">In Cart</span>
        </div>
      </div>
    `;
  }).join('');

  attachCardListeners();
}

// Bind interactive click capture logic over elements
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

// Update shopping cart maps and toggle active borders
function toggleCartItem(ticket, cardElement) {
  if (shoppingCart[ticket.id]) {
    delete shoppingCart[ticket.id];
    cardElement.classList.remove('border-orange-500');
    cardElement.querySelector('.card-badge')?.classList.add('opacity-0');
  } else {
    shoppingCart[ticket.id] = { ...ticket, quantity: 1 };
    cardElement.classList.add('border-orange-500');
    cardElement.querySelector('.card-badge')?.classList.remove('opacity-0');
    
    if (formFiller) {
      formFiller.scrollIntoView({ behavior: 'smooth', block: 'center' });
      formFiller.querySelector('input:not([readonly])')?.focus();
    }
  }

  updateInstructionText();
}

// Helper to keep instruction subtext updated
function updateInstructionText() {
  const selectedCount = Object.keys(shoppingCart).length;
  if (instructionText) {
    instructionText.innerHTML = selectedCount > 0 
      ? `Selected <span class="text-orange-400 font-bold">${selectedCount} ticket type(s)</span>. Enter details to proceed.`
      : `Please select a ticket option below to begin.`;
  }
}

// Real-Time Search Filtering Listener Engine
searchBar?.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase().trim();
  const filteredTickets = ticketTiersAPI.filter(ticket => {
    return ticket.name.toLowerCase().includes(searchTerm) || 
           ticket.location.toLowerCase().includes(searchTerm);
  });
  renderTickets(filteredTickets);
});

// Profile Submission state validation mapping pipeline
formFiller?.addEventListener('submit', (e) => {
  e.preventDefault();
  
  if (Object.keys(shoppingCart).length === 0) {
    alert('Please select at least one ticket type below first!');
    return;
  }

  const formData = new FormData(formFiller);
  localStorage.setItem('checkout_user', JSON.stringify(Object.fromEntries(formData)));
  localStorage.setItem('checkout_cart', JSON.stringify(shoppingCart));

  window.location.href = 'checkout.html';
});

loadTicketsFromAPI();