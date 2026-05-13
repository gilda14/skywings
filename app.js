/* ===========================
   SkyWings — App Logic
   =========================== */

// ---- State ----
const state = {
  loggedIn: false,
  userName: '',
  passengers: 1,
  tripType: 'round',
  selectedFlight: null,
  selectedDate: null,
  selectedTime: null,
  selectedReturnDate: null,
  selectedReturnTime: null,
  baggage: 'carryon',
  extraBags: 0,
  paymentMethod: 'card',
  total: 0,
};

const flights = [
  { id: 1, from: 'JFK', to: 'LHR', dep: '06:30', arr: '18:45', duration: '7h 15m', stops: 0, price: 485, airline: 'SkyWings', cabin: 'Economy', seats: 12 },
  { id: 2, from: 'JFK', to: 'LHR', dep: '08:00', arr: '20:10', duration: '7h 10m', stops: 0, price: 520, airline: 'SkyWings', cabin: 'Economy', seats: 8 },
  { id: 3, from: 'JFK', to: 'LHR', dep: '10:45', arr: '22:55', duration: '7h 10m', stops: 0, price: 465, airline: 'SkyWings', cabin: 'Economy', seats: 3 },
  { id: 4, from: 'JFK', to: 'LHR', dep: '14:20', arr: '02:35+1', duration: '7h 15m', stops: 0, price: 410, airline: 'SkyWings', cabin: 'Economy', seats: 22 },
  { id: 5, from: 'JFK', to: 'LHR', dep: '07:15', arr: '21:40', duration: '9h 25m', stops: 1, price: 340, airline: 'EuroAir', cabin: 'Economy', seats: 15 },
  { id: 6, from: 'JFK', to: 'LHR', dep: '23:55', arr: '12:10+1', duration: '7h 15m', stops: 0, price: 375, airline: 'SkyWings', cabin: 'Economy', seats: 6 },
  { id: 7, from: 'JFK', to: 'LHR', dep: '09:30', arr: '21:45', duration: '7h 15m', stops: 0, price: 690, airline: 'SkyWings', cabin: 'Business', seats: 4 },
  { id: 8, from: 'JFK', to: 'LHR', dep: '19:00', arr: '09:15+1', duration: '7h 15m', stops: 0, price: 450, airline: 'SkyWings', cabin: 'Economy', seats: 18 },
  { id: 9, from: 'JFK', to: 'LHR', dep: '11:20', arr: '02:10+1', duration: '9h 50m', stops: 1, price: 290, airline: 'BudgetFly', cabin: 'Economy', seats: 7 },
  { id: 10, from: 'JFK', to: 'LHR', dep: '16:45', arr: '05:00+1', duration: '7h 15m', stops: 0, price: 520, airline: 'SkyWings', cabin: 'Premium Economy', seats: 9 },
];

// ---- City database for autocomplete ----
const cities = [
  { name: 'New York', code: 'JFK', country: 'United States' },
  { name: 'New York', code: 'LGA', country: 'United States' },
  { name: 'Los Angeles', code: 'LAX', country: 'United States' },
  { name: 'Chicago', code: 'ORD', country: 'United States' },
  { name: 'San Francisco', code: 'SFO', country: 'United States' },
  { name: 'Miami', code: 'MIA', country: 'United States' },
  { name: 'London', code: 'LHR', country: 'United Kingdom' },
  { name: 'London', code: 'LGW', country: 'United Kingdom' },
  { name: 'Paris', code: 'CDG', country: 'France' },
  { name: 'Dubai', code: 'DXB', country: 'UAE' },
  { name: 'Tokyo', code: 'NRT', country: 'Japan' },
  { name: 'Singapore', code: 'SIN', country: 'Singapore' },
  { name: 'Sydney', code: 'SYD', country: 'Australia' },
  { name: 'Hong Kong', code: 'HKG', country: 'China' },
  { name: 'Bangkok', code: 'BKK', country: 'Thailand' },
  { name: 'Toronto', code: 'YYZ', country: 'Canada' },
  { name: 'Rome', code: 'FCO', country: 'Italy' },
  { name: 'Barcelona', code: 'BCN', country: 'Spain' },
  { name: 'Amsterdam', code: 'AMS', country: 'Netherlands' },
  { name: 'Berlin', code: 'BER', country: 'Germany' },
  { name: 'Istanbul', code: 'IST', country: 'Turkey' },
  { name: 'Doha', code: 'DOH', country: 'Qatar' },
  { name: 'Mumbai', code: 'BOM', country: 'India' },
  { name: 'Seoul', code: 'ICN', country: 'South Korea' },
  { name: 'Zurich', code: 'ZRH', country: 'Switzerland' },
];

// ---- Navigation ----
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  const nav = document.getElementById('topNav');
  const indicator = document.getElementById('stepIndicator');
  const loginPages = ['page-login', 'page-register'];
  if (loginPages.includes(id)) {
    nav.classList.add('hidden');
    indicator.classList.add('hidden');
  } else {
    nav.classList.remove('hidden');
    indicator.classList.remove('hidden');
  }

  updateSteps(id);
}

function goToPage(id) {
  showPage(id);
}

function updateSteps(current) {
  const stepMap = {
    'page-search': 2, 'page-results': 3, 'page-datetime': 4,
    'page-baggage': 5, 'page-payment': 6, 'page-confirmation': 7
  };
  const s = stepMap[current] || 0;
  document.querySelectorAll('.step').forEach(el => {
    const n = parseInt(el.dataset.step);
    el.classList.toggle('active', n === s);
    el.classList.toggle('done', n < s);
  });
}

// ---- Login / Register ----
function showRegister() { showPage('page-register'); }
function showLogin() { showPage('page-login'); }

function handleLogin(e) {
  e.preventDefault();
  state.loggedIn = true;
  state.userName = document.getElementById('loginEmail').value.split('@')[0];
  document.getElementById('navUserName').textContent = state.userName;
  showPage('page-search');
  setDefaultDates();
  return false;
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value;
  state.loggedIn = true;
  state.userName = name;
  document.getElementById('navUserName').textContent = name;
  showPage('page-search');
  setDefaultDates();
  return false;
}

function logout() {
  state.loggedIn = false;
  showPage('page-login');
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPassword').value = '';
}

// ---- Autocomplete & Route helpers ----
function buildSuggestions(filterText, targetId) {
  const container = document.getElementById(targetId);
  if (!filterText || filterText.length < 1) {
    container.classList.remove('show');
    return;
  }
  const q = filterText.toLowerCase();
  const matches = cities.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.code.toLowerCase().includes(q) ||
    c.country.toLowerCase().includes(q)
  ).slice(0, 6);
  if (matches.length === 0) { container.classList.remove('show'); return; }
  container.innerHTML = matches.map(c =>
    `<div class="suggestion-item" onclick="pickSuggestion('${c.name} (${c.code})', '${targetId}')">
       <span>🏙</span>
       <span class="s-city">${c.name}</span>
       <span style="color:var(--text-light);font-size:12px">${c.country}</span>
       <span class="s-code">${c.code}</span>
     </div>`
  ).join('');
  container.classList.add('show');
}

function filterSuggestions(input, targetId) {
  buildSuggestions(input.value, targetId);
}

function showSuggestions(targetId) {
  const input = targetId === 'fromSuggestions'
    ? document.getElementById('fromCity')
    : document.getElementById('toCity');
  buildSuggestions(input.value, targetId);
}

function pickSuggestion(value, targetId) {
  const inputId = targetId === 'fromSuggestions' ? 'fromCity' : 'toCity';
  document.getElementById(inputId).value = value;
  document.getElementById(targetId).classList.remove('show');
}

function swapCities() {
  const from = document.getElementById('fromCity');
  const to = document.getElementById('toCity');
  const tmp = from.value;
  from.value = to.value;
  to.value = tmp;
}

function quickRoute(from, to) {
  document.getElementById('fromCity').value = from;
  document.getElementById('toCity').value = to;
  document.querySelectorAll('.suggestions').forEach(s => s.classList.remove('show'));
}

// Close suggestions on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('.route-from') && !e.target.closest('.route-to')) {
    document.querySelectorAll('.suggestions').forEach(s => s.classList.remove('show'));
  }
});

// ---- Trip type ----
function setTripType(type) {
  state.tripType = type;
  document.querySelectorAll('.radio-pill').forEach(el => el.classList.remove('active'));
  document.querySelector(`.radio-pill input[value="${type}"]`).parentElement.classList.add('active');
  const rf = document.getElementById('returnField');
  const rc = document.getElementById('returnDatetimeCard');
  if (type === 'oneway') {
    rf.classList.add('hidden');
    rc.classList.add('hidden');
  } else {
    rf.classList.remove('hidden');
    rc.classList.remove('hidden');
  }
}

// ---- Passengers ----
function adjustPassengers(delta) {
  state.passengers = Math.max(1, Math.min(9, state.passengers + delta));
  document.getElementById('passengerCount').textContent = state.passengers;
}

// ---- Set dates ----
function setDefaultDates() {
  const today = new Date();
  const dep = document.getElementById('departDate');
  const ret = document.getElementById('returnDate');
  dep.value = today.toISOString().split('T')[0];
  dep.min = dep.value;
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 3);
  ret.value = tomorrow.toISOString().split('T')[0];
  ret.min = ret.value;
}

// ---- Search ----
function searchFlights() {
  const from = document.getElementById('fromCity').value;
  const to = document.getElementById('toCity').value;
  document.getElementById('resultsSummary').textContent =
    `${from} → ${to} · ${state.passengers} Passenger${state.passengers > 1 ? 's' : ''} · ${document.getElementById('cabinClass').value}`;
  // Reset continue button
  const contBtn = document.getElementById('continueFromResults');
  const contHint = document.getElementById('resultsHint');
  if (contBtn) { contBtn.disabled = true; contBtn.textContent = 'Continue to Date \u0026 Time \u00a0\u2192'; }
  if (contHint) contHint.style.display = 'block';
  state.selectedFlight = null;
  showPage('page-results');
  renderResults();
}

function renderResults() {
  const container = document.getElementById('flightResults');
  const maxPrice = parseInt(document.getElementById('priceRange').value);
  const stopFilter = getActiveFilter();
  const sort = document.getElementById('sortFlights').value;

  let filtered = flights.filter(f => f.price <= maxPrice);
  if (stopFilter === 'nonstop') filtered = filtered.filter(f => f.stops === 0);
  else if (stopFilter === '1stop') filtered = filtered.filter(f => f.stops === 1);

  if (sort === 'Cheapest') filtered.sort((a, b) => a.price - b.price);
  else if (sort === 'Fastest') filtered.sort((a, b) => a.duration.localeCompare(b.duration));
  else if (sort === 'Best Value') filtered.sort((a, b) => (a.price / (a.stops + 1)) - (b.price / (b.stops + 1)));

  container.innerHTML = filtered.map(f => `
    <div class="flight-card ${state.selectedFlight?.id === f.id ? 'selected' : ''}"
         onclick="selectFlight(${f.id}, this)">
      <div class="flight-main">
        <div class="flight-time">
          <div class="time">${f.dep}</div>
          <div class="airport">${f.from}</div>
        </div>
        <div class="flight-path">
          <div class="duration">${f.duration}</div>
          <div class="line">
            <span class="dot"></span>
            <span class="dash"></span>
            <span class="plane">✈</span>
            <span class="dash"></span>
            <span class="dot"></span>
          </div>
          <div class="stops">${f.stops === 0 ? 'Nonstop' : f.stops + ' stop'}</div>
        </div>
        <div class="flight-time">
          <div class="time">${f.arr}</div>
          <div class="airport">${f.to}</div>
        </div>
      </div>
      <div class="flight-info">
        <div class="price">$${f.price}</div>
        <div class="cabin">${f.airline} · ${f.cabin}</div>
        <div class="seats-left">${f.seats} seats left</div>
      </div>
    </div>
  `).join('');
}

function toggleFilter(btn, value) {
  const parent = btn.parentElement;
  parent.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
  if (value === 'any') {
    parent.querySelectorAll('.filter-pill')[0].classList.add('active');
  } else {
    btn.classList.add('active');
  }
  renderResults();
}

function getActiveFilter() {
  const pills = document.querySelectorAll('.results-controls .filter-group:nth-child(2) .filter-pill');
  for (const p of pills) {
    if (p.classList.contains('active')) {
      const txt = p.textContent.trim().toLowerCase();
      if (txt === 'nonstop') return 'nonstop';
      if (txt === '1 stop') return '1stop';
      return 'any';
    }
  }
  return 'any';
}

function updateRangeLabel() {
  const val = document.getElementById('priceRange').value;
  document.getElementById('rangeLabel').textContent = `$${val}`;
}

// ---- Select flight ----
function selectFlight(id, el) {
  state.selectedFlight = flights.find(f => f.id === id);
  document.querySelectorAll('.flight-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  // Enable continue button
  const btn = document.getElementById('continueFromResults');
  const hint = document.getElementById('resultsHint');
  if (btn) {
    btn.disabled = false;
    btn.textContent = 'Continue to Date \u0026 Time \u00a0\u2192';
  }
  if (hint) hint.style.display = 'none';
}

// ---- Date / Time ----
function confirmFlightSelection() {
  if (!state.selectedFlight) {
    alert('Please select a flight first.');
    return;
  }
  const f = state.selectedFlight;
  document.getElementById('selectedFlightSummary').textContent =
    `${f.airline} · ${f.from} → ${f.to} · ${f.dep} – ${f.arr} · $${f.price}`;
  renderDatePicker();
  renderTimeSlots();
  showPage('page-datetime');
}

function renderDatePicker() {
  const container = document.getElementById('datePicker');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today = new Date();
  container.innerHTML = '';
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const price = 350 + Math.floor(Math.random() * 200);
    container.innerHTML += `
      <div class="date-option ${i === 0 ? 'selected' : ''}" onclick="selectDate(this, ${i})">
        <div class="day-name">${days[d.getDay()]}</div>
        <div class="day-num">${d.getDate()}</div>
        <div class="month">${months[d.getMonth()]}</div>
        <div class="price-tag">$${price}</div>
      </div>
    `;
  }
  selectDate(document.querySelector('.date-option'), 0);
}

let selectedDateIndex = 0;
let selectedTimeIndex = -1;

function selectDate(el, idx) {
  selectedDateIndex = idx;
  document.querySelectorAll('.date-option').forEach(d => d.classList.remove('selected'));
  el.classList.add('selected');
  renderTimeSlots();
}

function renderTimeSlots() {
  const container = document.getElementById('timeSlots');
  const times = ['06:00', '07:30', '09:00', '10:30', '12:00', '14:00', '16:00', '18:30', '21:00', '23:30'];
  container.innerHTML = times.map((t, i) => {
    const price = state.selectedFlight ? state.selectedFlight.price - 30 + Math.floor(Math.random() * 60) : 400;
    return `
      <div class="time-slot ${i === selectedTimeIndex ? 'selected' : ''}" onclick="selectTime(this, ${i})">
        <div class="slot-time">${t}</div>
        <div class="slot-price">$${price}</div>
      </div>
    `;
  }).join('');
  selectedTimeIndex = -1;
}

function selectTime(el, idx) {
  selectedTimeIndex = idx;
  document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
}

function confirmDateTime() {
  if (selectedTimeIndex < 0) { alert('Please select a departure time.'); return; }
  const times = ['06:00', '07:30', '09:00', '10:30', '12:00', '14:00', '16:00', '18:30', '21:00', '23:30'];
  state.selectedTime = times[selectedTimeIndex];
  state.selectedDate = getSelectedDate(selectedDateIndex);
  showPage('page-baggage');
}

function getSelectedDate(idx) {
  if (idx === undefined) idx = selectedDateIndex;
  const d = new Date();
  d.setDate(d.getDate() + idx);
  return d.toDateString();
}

// ---- Baggage ----
const baggagePrices = { carryon: 0, light: 35, standard: 55, heavy: 85 };

function selectBaggage(type, el) {
  state.baggage = type;
  document.querySelectorAll('.baggage-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  updateBaggageTotal();
}

function adjustExtra(delta) {
  state.extraBags = Math.max(0, Math.min(4, state.extraBags + delta));
  document.getElementById('extraCount').textContent = state.extraBags;
  updateBaggageTotal();
}

function updateBaggageTotal() {
  const base = baggagePrices[state.baggage] || 0;
  const extra = state.extraBags * 55;
  const total = base + extra;
  document.getElementById('baggageTotalCost').textContent = `$${total}`;
}

function confirmBaggage() {
  const base = baggagePrices[state.baggage] || 0;
  const extra = state.extraBags * 55;
  const flightCost = state.selectedFlight ? state.selectedFlight.price * state.passengers : 0;
  state.total = flightCost + base + extra;
  showPage('page-payment');
  renderPaymentSummary();
}

function renderPaymentSummary() {
  const f = state.selectedFlight;
  document.getElementById('summaryFlight').textContent = f ? `${f.airline} ${f.from} → ${f.to}` : '—';
  document.getElementById('summaryDate').textContent = state.selectedDate + ' at ' + state.selectedTime;
  document.getElementById('summaryPassengers').textContent = state.passengers;
  const bagNames = { carryon: 'Cabin (7kg)', light: 'Light 15kg', standard: 'Standard 23kg', heavy: 'Heavy 32kg' };
  document.getElementById('summaryBaggage').textContent = bagNames[state.baggage] + (state.extraBags > 0 ? ` + ${state.extraBags} extra` : '');
  document.getElementById('summaryTotal').textContent = `$${state.total}`;
  document.getElementById('payAmount').textContent = `$${state.total}`;
}

// ---- Payment ----
function selectPayment(method, el) {
  state.paymentMethod = method;
  document.querySelectorAll('.payment-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  document.querySelectorAll('.pay-radio').forEach(r => r.textContent = '○');
  el.querySelector('.pay-radio').textContent = '●';
  document.getElementById('cardDetails').style.display = method === 'card' ? 'block' : 'none';
}

function confirmPayment() {
  showConfirmation();
}

// ---- Confirmation ----
function showConfirmation() {
  const ref = 'SW-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  document.getElementById('confRef').textContent = ref;
  const f = state.selectedFlight;
  document.getElementById('confFlight').textContent = f ? `${f.airline} · ${f.from} → ${f.to} (${f.dep} – ${f.arr})` : '—';
  document.getElementById('confDateTime').textContent = state.selectedDate + ' · ' + state.selectedTime;
  const name = state.userName || 'You';
  document.getElementById('confPassenger').textContent = name;
  const bagNames = { carryon: 'Cabin Bag (7kg)', light: 'Light Checked (15kg)', standard: 'Standard Checked (23kg)', heavy: 'Heavy Checked (32kg)' };
  document.getElementById('confBaggage').textContent = bagNames[state.baggage];
  const payNames = { card: 'Credit/Debit Card', paypal: 'PayPal', applepay: 'Apple Pay', googlepay: 'Google Pay', bank: 'Bank Transfer' };
  document.getElementById('confPayment').textContent = payNames[state.paymentMethod] || 'Card';
  document.getElementById('confTotal').textContent = `$${state.total}`;
  showPage('page-confirmation');
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  // Set default to show login first
  showPage('page-login');
  updateRangeLabel();

  // Reset continue button state on results page load
  const contBtn = document.getElementById('continueFromResults');
  const contHint = document.getElementById('resultsHint');
  if (contBtn) contBtn.disabled = true;
  if (contHint) contHint.style.display = 'block';
});
