document.addEventListener("DOMContentLoaded", () => {
    // Point directly to your local file path to avoid CORS blocks and 404 errors!
    const localEventsApi = "./tickets.json";

    const gridContainer = document.getElementById("eventsGrid");
    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");
    const venueInput = document.getElementById("venueInput");

    let fetchedTickets = []; // Local cache storage for filtering inputs

    // Image assets mapped perfectly to match your event names
    const imageAssets = {
        "Kitenge Fest":
            "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=500&q=80",
        "Colour Festival":
            "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=500&q=80",
        "TTNT 6":
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=500&q=80",
    };

    const dateMap = {
        "Kitenge Fest": "1st Aug",
        "Colour Festival": "5th Sep",
        "TTNT 6": "10th Oct",
    };

    // UI Grid Rendering Engine
   // UI Grid Rendering Engine
  function renderEvents(eventsList) {
    if (!gridContainer) return; 
    gridContainer.innerHTML = ""; 

    if (eventsList.length === 0) {
      gridContainer.innerHTML = `
        <p class="col-span-full text-center text-slate-500 font-medium py-12">
          No matching events found for your search query.
        </p>
      `;
      return;
    }

    eventsList.forEach(item => {
      // Figure out which banner group matches this ticket item
      let matchedGroup = "Event Pass";
      if (item.location.includes("Kitenge Fest")) matchedGroup = "Kitenge Fest";
      else if (item.location.includes("Colour Festival")) matchedGroup = "Colour Festival";
      else if (item.location.includes("TTNT 6")) matchedGroup = "TTNT 6";

      const eventImage = imageAssets[matchedGroup] || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=500&q=80";
      const displayDate = dateMap[matchedGroup] || "Soon";

      // CLEANED: Replaced the dynamic fire badge with your original static date badge style
      const statusBadge = `<span class="absolute top-3 left-3 bg-red-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded shadow-md uppercase tracking-wider">${displayDate}</span>`;

      // We turn the card container into an anchor tag <a> pointing to your ticket checkout page
      const card = document.createElement("a");
      card.href = `ticket.html?id=${item.id}&event=${encodeURIComponent(matchedGroup)}&tier=${encodeURIComponent(item.name)}&price=${encodeURIComponent(item.price)}`;
      card.className = "bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 border border-slate-100 flex flex-col justify-between group cursor-pointer block";
      
      card.innerHTML = `
        <div class="relative h-48 bg-slate-200 overflow-hidden">
          <img src="${eventImage}" alt="${matchedGroup}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
          ${statusBadge}
        </div>
        <div class="p-4 flex-grow flex flex-col justify-between">
          <div>
            <h3 class="font-black text-lg text-slate-800 line-clamp-1 group-hover:text-red-600 transition mb-1">
              ${matchedGroup} - ${item.name}
            </h3>
            <p class="text-xs font-semibold text-slate-400 mb-3 flex items-center">
        
              ${item.location}
            </p>
          </div>
          <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span class="text-xs font-bold text-red-600 tracking-wider uppercase group-hover:underline">Buy Ticket Now</span>
            <span class="text-base font-black text-emerald-600">${item.price}</span>
          </div>
        </div>
      `;
      gridContainer.appendChild(card);
    });
  }

    // Local Data Fetch Execution
    if (gridContainer) {
        fetch(localEventsApi)
            .then((res) => {
                if (!res.ok)
                    throw new Error(
                        "Local tickets file missing or incorrectly formatted",
                    );
                return res.json();
            })
            .then((data) => {
                fetchedTickets = data;
                renderEvents(fetchedTickets);
            })
            .catch((err) => {
                console.error("Local load fail:", err);
                gridContainer.innerHTML = `<p class="col-span-full text-center text-red-500 font-semibold py-8">Error loading tickets file structure locally.</p>`;
            });
    }

    // Active Searching Layout intercept engine
    if (searchForm && searchInput && venueInput) {
        searchForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const searchKeyword = searchInput.value.toLowerCase().trim();
            const venueKeyword = venueInput.value.toLowerCase().trim();

            const filteredResults = fetchedTickets.filter((event) => {
                const matchesName =
                    event.name.toLowerCase().includes(searchKeyword) ||
                    event.location.toLowerCase().includes(searchKeyword);
                const matchesVenue = event.location
                    .toLowerCase()
                    .includes(venueKeyword);
                return matchesName && matchesVenue;
            });

            renderEvents(filteredResults);
        });
    }
});
