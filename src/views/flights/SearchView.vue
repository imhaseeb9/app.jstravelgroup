<script setup>
import api from '@/service/api'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// ─── Trip Type ────────────────────────────────────────
const tripType = ref('oneway')

// ─── Airport AutoComplete ─────────────────────────────
const originAirport      = ref(null)   // full airport object
const destinationAirport = ref(null)   // full airport object
const originQuery        = ref('')
const destinationQuery   = ref('')
const originSuggestions  = ref([])
const destSuggestions    = ref([])
const popularAirports    = ref([])

// ─── Date Fields ──────────────────────────────────────
const departureDateObj = ref(null)
const returnDateObj    = ref(null)

const departureDate = computed(() =>
    departureDateObj.value
        ? departureDateObj.value.toISOString().split('T')[0]
        : ''
)
const returnDate = computed(() =>
    returnDateObj.value
        ? returnDateObj.value.toISOString().split('T')[0]
        : ''
)

// ─── Passengers ───────────────────────────────────────
const adults   = ref(1)
const children = ref(0)
const infants  = ref(0)
const cabinClass = ref('Y')
const showPassengerDropdown = ref(false)
const showCabinDropdown     = ref(false)

// ─── UI State ─────────────────────────────────────────
const loading = ref(false)
const errors  = ref({})

// ─── Options ──────────────────────────────────────────
const cabinOptions = [
    { code: 'Y', label: 'Economy' },
    { code: 'W', label: 'Premium Economy' },
    { code: 'C', label: 'Business' },
    { code: 'F', label: 'First Class' },
]

const selectedCabinLabel = computed(() =>
    cabinOptions.find(c => c.code === cabinClass.value)?.label || 'Economy'
)

const totalPassengers = computed(() => adults.value + children.value + infants.value)

const passengerSummary = computed(() => {
    const parts = [`${adults.value} Adult${adults.value > 1 ? 's' : ''}`]
    if (children.value > 0) parts.push(`${children.value} Child${children.value > 1 ? 'ren' : ''}`)
    if (infants.value > 0)  parts.push(`${infants.value} Infant${infants.value > 1 ? 's' : ''}`)
    return parts.join(', ')
})

// ─── Load Popular Airports on Mount ───────────────────
onMounted(async () => {
    try {
        const res = await api.get('/airports/popular', { params: { country: 'PK' } })
        popularAirports.value = res.data
    } catch (e) {
        // Fallback static list if API fails
        popularAirports.value = [
            { iata_code: 'KHI', city: 'Karachi',   country: 'Pakistan' },
            { iata_code: 'LHE', city: 'Lahore',    country: 'Pakistan' },
            { iata_code: 'ISB', city: 'Islamabad', country: 'Pakistan' },
            { iata_code: 'DXB', city: 'Dubai',     country: 'UAE' },
            { iata_code: 'DOH', city: 'Doha',      country: 'Qatar' },
            { iata_code: 'LHR', city: 'London',    country: 'UK' },
        ]
    }
})

// ─── Airport Search ───────────────────────────────────
async function searchOrigin(event) {
    const q = event.query?.trim()
    if (!q || q.length < 2) {
        originSuggestions.value = popularAirports.value
        return
    }
    try {
        const res = await api.get('/airports/search', { params: { q, limit: 10 } })
        originSuggestions.value = res.data
    } catch (e) {
        originSuggestions.value = []
    }
}

async function searchDestination(event) {
    const q = event.query?.trim()
    if (!q || q.length < 2) {
        destSuggestions.value = popularAirports.value
        return
    }
    try {
        const res = await api.get('/airports/search', { params: { q, limit: 10 } })
        destSuggestions.value = res.data
    } catch (e) {
        destSuggestions.value = []
    }
}

function onOriginFocus() {
    if (!originQuery.value) {
        originSuggestions.value = popularAirports.value
    }
}

function onDestFocus() {
    if (!destinationQuery.value) {
        destSuggestions.value = popularAirports.value
    }
}

// ─── Swap ─────────────────────────────────────────────
function swapRoutes() {
    const temp           = originAirport.value
    originAirport.value  = destinationAirport.value
    destinationAirport.value = temp
}

// ─── Popular Routes ───────────────────────────────────
const popularRoutes = [
    { from: 'KHI', to: 'DXB', fromCity: 'Karachi',   toCity: 'Dubai' },
    { from: 'LHE', to: 'DXB', fromCity: 'Lahore',    toCity: 'Dubai' },
    { from: 'ISB', to: 'DOH', fromCity: 'Islamabad', toCity: 'Doha' },
    { from: 'KHI', to: 'LHE', fromCity: 'Karachi',   toCity: 'Lahore' },
    { from: 'KHI', to: 'LHR', fromCity: 'Karachi',   toCity: 'London' },
    { from: 'LHE', to: 'ISB', fromCity: 'Lahore',    toCity: 'Islamabad' },
]

function fillRoute(route) {
    const fromAirport = popularAirports.value.find(a => a.iata_code === route.from)
    const toAirport   = popularAirports.value.find(a => a.iata_code === route.to)

    originAirport.value = fromAirport || {
        iata_code: route.from, city: route.fromCity, country: '', label: `${route.from} - ${route.fromCity}`
    }
    destinationAirport.value = toAirport || {
        iata_code: route.to, city: route.toCity, country: '', label: `${route.to} - ${route.toCity}`
    }
    errors.value.origin      = null
    errors.value.destination = null
}

// ─── Date Helpers ─────────────────────────────────────
const today = new Date()
const minReturnDate = computed(() => departureDateObj.value || today)

// ─── Validation ───────────────────────────────────────
function validate() {
    errors.value = {}
    if (!originAirport.value?.iata_code)      errors.value.origin      = 'Please select departure airport'
    if (!destinationAirport.value?.iata_code) errors.value.destination = 'Please select arrival airport'
    if (!departureDate.value)                  errors.value.departureDate = 'Please select a date'
    if (tripType.value === 'return' && !returnDate.value) errors.value.returnDate = 'Please select return date'
    return Object.keys(errors.value).length === 0
}

// ─── Search ───────────────────────────────────────────
async function searchFlights() {
    if (!validate()) return
    loading.value = true
    try {
        const params = {
            origin:         originAirport.value.iata_code,
            destination:    destinationAirport.value.iata_code,
            departure_date: departureDate.value,
            adults:         adults.value,
            children:       children.value,
            infants:        infants.value,
            cabin_class:    cabinClass.value,
            trip_type:      tripType.value,
        }
        if (tripType.value === 'return' && returnDate.value) {
            params.return_date = returnDate.value
        }
        router.push({ name: 'flights.results', query: params })
    } finally {
        loading.value = false
    }
}

// ─── Close dropdowns on outside click ────────────────
function closeDropdowns(event) {
    if (!event.target.closest('.passenger-dropdown-wrapper')) showPassengerDropdown.value = false
    if (!event.target.closest('.cabin-dropdown-wrapper'))     showCabinDropdown.value = false
}
</script>

<template>
    <div class="flight-search-page" @click="closeDropdowns">

        <!-- Hero -->
        <div class="search-hero">
            <div class="hero-content">
                <div class="hero-badge">
                    <i class="pi pi-send"></i>
                    <span>Flight Search</span>
                </div>
                <h1 class="hero-title">Where would you like to go?</h1>
                <p class="hero-subtitle">Search hundreds of flights and find the best fares</p>
            </div>
        </div>

        <!-- Search Card -->
        <div class="search-card-container">
            <div class="search-card">

                <!-- Trip Type Tabs -->
                <div class="trip-type-tabs">
                    <button class="trip-tab" :class="{ active: tripType === 'oneway' }" @click="tripType = 'oneway'">
                        <i class="pi pi-arrow-right"></i> One Way
                    </button>
                    <button class="trip-tab" :class="{ active: tripType === 'return' }" @click="tripType = 'return'">
                        <i class="pi pi-sort-alt"></i> Return
                    </button>
                </div>

                <!-- Form -->
                <div class="search-form">

                    <!-- Route Row -->
                    <div class="route-row">

                        <!-- Origin -->
                        <div class="field-group" :class="{ 'has-error': errors.origin }">
                            <label class="field-label">
                                <i class="pi pi-map-marker"></i> From
                            </label>
                            <AutoComplete
                                v-model="originAirport"
                                :suggestions="originSuggestions"
                                optionLabel="label"
                                placeholder="City or Airport"
                                :delay="300"
                                forceSelection
                                fluid
                                class="airport-autocomplete"
                                :class="{ 'ac-error': errors.origin }"
                                @complete="searchOrigin"
                                @focus="onOriginFocus"
                                @item-select="errors.origin = null"
                            >
                                <template #option="{ option }">
                                    <div class="airport-option">
                                        <div class="airport-option-code">{{ option.iata_code }}</div>
                                        <div class="airport-option-info">
                                            <div class="airport-option-city">{{ option.city }}, {{ option.country }}</div>
                                            <div class="airport-option-name">{{ option.name }}</div>
                                        </div>
                                    </div>
                                </template>
                                <template #empty>
                                    <div class="airport-no-results">
                                        <i class="pi pi-search"></i> No airports found
                                    </div>
                                </template>
                            </AutoComplete>
                            <span v-if="errors.origin" class="field-error">{{ errors.origin }}</span>
                        </div>

                        <!-- Swap -->
                        <button class="swap-btn" @click.stop="swapRoutes" title="Swap">
                            <i class="pi pi-sort-alt"></i>
                        </button>

                        <!-- Destination -->
                        <div class="field-group" :class="{ 'has-error': errors.destination }">
                            <label class="field-label">
                                <i class="pi pi-map-marker"></i> To
                            </label>
                            <AutoComplete
                                v-model="destinationAirport"
                                :suggestions="destSuggestions"
                                optionLabel="label"
                                placeholder="City or Airport"
                                :delay="300"
                                forceSelection
                                fluid
                                class="airport-autocomplete"
                                :class="{ 'ac-error': errors.destination }"
                                @complete="searchDestination"
                                @focus="onDestFocus"
                                @item-select="errors.destination = null"
                            >
                                <template #option="{ option }">
                                    <div class="airport-option">
                                        <div class="airport-option-code">{{ option.iata_code }}</div>
                                        <div class="airport-option-info">
                                            <div class="airport-option-city">{{ option.city }}, {{ option.country }}</div>
                                            <div class="airport-option-name">{{ option.name }}</div>
                                        </div>
                                    </div>
                                </template>
                                <template #empty>
                                    <div class="airport-no-results">
                                        <i class="pi pi-search"></i> No airports found
                                    </div>
                                </template>
                            </AutoComplete>
                            <span v-if="errors.destination" class="field-error">{{ errors.destination }}</span>
                        </div>

                    </div>

                    <!-- Details Row -->
                    <div class="details-row">

                        <!-- Departure Date -->
                        <div class="field-group" :class="{ 'has-error': errors.departureDate }">
                            <label class="field-label">
                                <i class="pi pi-calendar"></i> Departure
                            </label>
                            <DatePicker
                                v-model="departureDateObj"
                                dateFormat="yy-mm-dd"
                                placeholder="Select date"
                                :minDate="today"
                                :manualInput="false"
                                showIcon
                                fluid
                                class="field-datepicker"
                            />
                            <span v-if="errors.departureDate" class="field-error">{{ errors.departureDate }}</span>
                        </div>

                        <!-- Return Date -->
                        <div class="field-group" :class="{ 'has-error': errors.returnDate }">
                            <label class="field-label">
                                <i class="pi pi-calendar"></i> Return
                            </label>
                            <DatePicker
                                v-if="tripType === 'return'"
                                v-model="returnDateObj"
                                dateFormat="yy-mm-dd"
                                placeholder="Select return date"
                                :minDate="minReturnDate"
                                :manualInput="false"
                                showIcon
                                fluid
                                class="field-datepicker"
                            />
                            <div v-else class="field-input oneway-placeholder">One way trip</div>
                            <span v-if="errors.returnDate" class="field-error">{{ errors.returnDate }}</span>
                        </div>

                        <!-- Passengers -->
                        <div class="field-group passenger-dropdown-wrapper">
                            <label class="field-label">
                                <i class="pi pi-users"></i> Passengers
                            </label>
                            <button
                                class="field-input field-button"
                                @click.stop="showPassengerDropdown = !showPassengerDropdown; showCabinDropdown = false"
                            >
                                {{ passengerSummary }}
                                <i class="pi pi-chevron-down ml-auto"></i>
                            </button>
                            <div v-if="showPassengerDropdown" class="dropdown-panel">
                                <div class="pax-row">
                                    <div class="pax-info">
                                        <div class="pax-type">Adults</div>
                                        <div class="pax-desc">12+ years</div>
                                    </div>
                                    <div class="pax-counter">
                                        <button class="counter-btn" @click="adults > 1 && adults--" :disabled="adults <= 1">−</button>
                                        <span class="counter-val">{{ adults }}</span>
                                        <button class="counter-btn" @click="totalPassengers < 9 && adults++" :disabled="totalPassengers >= 9">+</button>
                                    </div>
                                </div>
                                <div class="pax-row">
                                    <div class="pax-info">
                                        <div class="pax-type">Children</div>
                                        <div class="pax-desc">2–11 years</div>
                                    </div>
                                    <div class="pax-counter">
                                        <button class="counter-btn" @click="children > 0 && children--" :disabled="children <= 0">−</button>
                                        <span class="counter-val">{{ children }}</span>
                                        <button class="counter-btn" @click="totalPassengers < 9 && children++" :disabled="totalPassengers >= 9">+</button>
                                    </div>
                                </div>
                                <div class="pax-row">
                                    <div class="pax-info">
                                        <div class="pax-type">Infants</div>
                                        <div class="pax-desc">Under 2 years</div>
                                    </div>
                                    <div class="pax-counter">
                                        <button class="counter-btn" @click="infants > 0 && infants--" :disabled="infants <= 0">−</button>
                                        <span class="counter-val">{{ infants }}</span>
                                        <button class="counter-btn" @click="infants < adults && infants++" :disabled="infants >= adults">+</button>
                                    </div>
                                </div>
                                <button class="dropdown-done-btn" @click="showPassengerDropdown = false">Done</button>
                            </div>
                        </div>

                        <!-- Cabin Class -->
                        <div class="field-group cabin-dropdown-wrapper">
                            <label class="field-label">
                                <i class="pi pi-star"></i> Class
                            </label>
                            <button
                                class="field-input field-button"
                                @click.stop="showCabinDropdown = !showCabinDropdown; showPassengerDropdown = false"
                            >
                                {{ selectedCabinLabel }}
                                <i class="pi pi-chevron-down ml-auto"></i>
                            </button>
                            <div v-if="showCabinDropdown" class="dropdown-panel cabin-dropdown">
                                <button
                                    v-for="option in cabinOptions"
                                    :key="option.code"
                                    class="cabin-option"
                                    :class="{ selected: cabinClass === option.code }"
                                    @click="cabinClass = option.code; showCabinDropdown = false"
                                >
                                    {{ option.label }}
                                    <i v-if="cabinClass === option.code" class="pi pi-check"></i>
                                </button>
                            </div>
                        </div>

                    </div>

                    <!-- Search Button -->
                    <div class="search-action">
                        <button class="search-btn" @click="searchFlights" :disabled="loading">
                            <i class="pi" :class="loading ? 'pi-spin pi-spinner' : 'pi-search'"></i>
                            {{ loading ? 'Searching...' : 'Search Flights' }}
                        </button>
                    </div>

                </div>
            </div>
        </div>

        <!-- Popular Routes -->
        <div class="popular-section">
            <h3 class="popular-title">Popular Routes</h3>
            <div class="popular-routes">
                <button
                    v-for="route in popularRoutes"
                    :key="`${route.from}-${route.to}`"
                    class="route-chip"
                    @click="fillRoute(route)"
                >
                    <i class="pi pi-send"></i>
                    {{ route.fromCity }} → {{ route.toCity }}
                </button>
            </div>
        </div>

    </div>
</template>

<style scoped>
/* ── Page Layout ──────────────────────────────────── */
.flight-search-page {
    min-height: 100%;
    background: var(--surface-ground);
}

/* ── Hero ─────────────────────────────────────────── */
.search-hero {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    padding: 3rem 2rem 6rem;
    position: relative;
    overflow: hidden;
}

.search-hero::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(246,203,3,0.08) 0%, transparent 70%);
    pointer-events: none;
}

.search-hero::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 60px;
    background: var(--surface-ground);
    clip-path: ellipse(55% 100% at 50% 100%);
}

.hero-content {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
    position: relative;
    z-index: 1;
}

.hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(246,203,3,0.15);
    border: 1px solid rgba(246,203,3,0.3);
    color: #f6cb03;
    padding: 0.35rem 1rem;
    border-radius: 100px;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    margin-bottom: 1.25rem;
}

.hero-title {
    font-size: 2.5rem;
    font-weight: 800;
    color: #ffffff;
    margin: 0 0 0.75rem;
    line-height: 1.1;
    letter-spacing: -0.02em;
}

.hero-subtitle {
    font-size: 1rem;
    color: rgba(255,255,255,0.55);
    margin: 0;
}

/* ── Search Card ──────────────────────────────────── */
.search-card-container {
    max-width: 1100px;
    margin: -3.5rem auto 0;
    padding: 0 1.5rem;
    position: relative;
    z-index: 10;
}

.search-card {
    background: var(--surface-card);
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06);
    border: 1px solid var(--surface-border);
    overflow: visible;
}

/* ── Trip Tabs ────────────────────────────────────── */
.trip-type-tabs {
    display: flex;
    padding: 1.25rem 1.5rem 0;
    gap: 0.25rem;
    border-bottom: 1px solid var(--surface-border);
}

.trip-tab {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.65rem 1.25rem;
    border: none;
    background: transparent;
    color: var(--text-color-secondary);
    font-size: 0.875rem;
    font-weight: 500;
    border-radius: 8px 8px 0 0;
    cursor: pointer;
    transition: all 0.2s;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
}

.trip-tab:hover  { color: var(--text-color); background: var(--surface-hover); }
.trip-tab.active { color: #f6cb03; border-bottom-color: #f6cb03; background: rgba(246,203,3,0.06); }

/* ── Form ─────────────────────────────────────────── */
.search-form {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.route-row {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 0.75rem;
    align-items: start;
}

.swap-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid var(--surface-border);
    background: var(--surface-card);
    color: var(--text-color-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 1.75rem;
    transition: all 0.2s;
    flex-shrink: 0;
}

.swap-btn:hover {
    background: #f6cb03;
    border-color: #f6cb03;
    color: #1a1a2e;
    transform: rotate(90deg);
}

.details-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1.3fr 1fr;
    gap: 0.75rem;
    align-items: start;
}

/* ── Field Group ──────────────────────────────────── */
.field-group {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    position: relative;
}

.field-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    display: flex;
    align-items: center;
    gap: 0.35rem;
}

.field-input {
    width: 100%;
    padding: 0.7rem 0.875rem;
    border: 1px solid var(--surface-border);
    border-radius: 8px;
    background: var(--surface-ground);
    color: var(--text-color);
    font-size: 0.9rem;
    transition: all 0.2s;
    box-sizing: border-box;
}

.field-input:focus {
    outline: none;
    border-color: #f6cb03;
    background: var(--surface-card);
    box-shadow: 0 0 0 3px rgba(246,203,3,0.12);
}

.field-button {
    display: flex;
    align-items: center;
    cursor: pointer;
    text-align: left;
}

.field-button:hover { border-color: #f6cb03; }

.oneway-placeholder {
    padding: 0.7rem 0.875rem;
    border: 1px solid var(--surface-border);
    border-radius: 8px;
    background: var(--surface-ground);
    color: var(--text-color-secondary);
    font-size: 0.875rem;
    opacity: 0.6;
    cursor: not-allowed;
}

.field-error {
    font-size: 0.72rem;
    color: #ef4444;
    font-weight: 600;
}

.has-error .field-input,
.has-error .airport-autocomplete :deep(.p-autocomplete-input) {
    border-color: #ef4444;
}

/* ── AutoComplete Airport Field ───────────────────── */
.airport-autocomplete :deep(.p-autocomplete-input) {
    background: var(--surface-ground);
    border-color: var(--surface-border);
    border-radius: 8px;
    font-size: 0.9rem;
    padding: 0.7rem 0.875rem;
    color: var(--text-color);
    width: 100%;
    transition: all 0.2s;
}

.airport-autocomplete :deep(.p-autocomplete-input:focus) {
    border-color: #f6cb03;
    background: var(--surface-card);
    box-shadow: 0 0 0 3px rgba(246,203,3,0.12);
}

.airport-autocomplete.ac-error :deep(.p-autocomplete-input) {
    border-color: #ef4444;
}

/* ── Airport Option in Dropdown ───────────────────── */
.airport-option {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding: 0.35rem 0;
}

.airport-option-code {
    font-size: 1rem;
    font-weight: 800;
    color: #f6cb03;
    width: 38px;
    flex-shrink: 0;
    font-family: monospace;
}

.airport-option-info { flex: 1; min-width: 0; }

.airport-option-city {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.airport-option-name {
    font-size: 0.72rem;
    color: var(--text-color-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.airport-no-results {
    padding: 0.5rem;
    color: var(--text-color-secondary);
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* ── DatePicker ───────────────────────────────────── */
.field-datepicker :deep(.p-datepicker-input) {
    background: var(--surface-ground);
    border-color: var(--surface-border);
    border-radius: 8px;
    font-size: 0.9rem;
    padding: 0.7rem 0.875rem;
}

.field-datepicker :deep(.p-datepicker-input:focus) {
    border-color: #f6cb03;
    box-shadow: 0 0 0 3px rgba(246,203,3,0.12);
}

/* ── Passenger / Cabin Dropdowns ──────────────────── */
.dropdown-panel {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    min-width: 240px;
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 10px;
    box-shadow: 0 12px 32px rgba(0,0,0,0.15);
    z-index: 100;
    padding: 0.75rem;
}

.pax-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--surface-border);
}
.pax-row:last-of-type { border-bottom: none; margin-bottom: 0.75rem; }
.pax-type { font-size: 0.875rem; font-weight: 600; color: var(--text-color); }
.pax-desc { font-size: 0.75rem; color: var(--text-color-secondary); }

.pax-counter { display: flex; align-items: center; gap: 0.75rem; }

.counter-btn {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 1px solid var(--surface-border);
    background: var(--surface-ground);
    color: var(--text-color);
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
    line-height: 1;
}
.counter-btn:hover:not(:disabled) { background: #f6cb03; border-color: #f6cb03; color: #1a1a2e; }
.counter-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.counter-val { font-size: 0.95rem; font-weight: 700; color: var(--text-color); min-width: 20px; text-align: center; }

.dropdown-done-btn {
    width: 100%;
    padding: 0.55rem;
    background: #f6cb03;
    color: #1a1a2e;
    border: none;
    border-radius: 7px;
    font-weight: 700;
    font-size: 0.875rem;
    cursor: pointer;
    transition: opacity 0.2s;
}
.dropdown-done-btn:hover { opacity: 0.88; }

.cabin-dropdown { min-width: 200px; padding: 0.5rem; }
.cabin-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0.6rem 0.875rem;
    border: none;
    background: transparent;
    color: var(--text-color);
    font-size: 0.875rem;
    cursor: pointer;
    border-radius: 7px;
    transition: background 0.15s;
    text-align: left;
}
.cabin-option:hover   { background: var(--surface-hover); }
.cabin-option.selected { background: rgba(246,203,3,0.1); color: #f6cb03; font-weight: 600; }

/* ── Search Button ────────────────────────────────── */
.search-action { display: flex; justify-content: flex-end; padding-top: 0.25rem; }

.search-btn {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.875rem 2.5rem;
    background: #f6cb03;
    color: #1a1a2e;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
}
.search-btn:hover:not(:disabled) {
    background: #e6bc00;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(246,203,3,0.35);
}
.search-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

/* ── Popular Routes ───────────────────────────────── */
.popular-section {
    max-width: 1100px;
    margin: 2rem auto;
    padding: 0 1.5rem;
}

.popular-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin: 0 0 0.875rem;
}

.popular-routes { display: flex; flex-wrap: wrap; gap: 0.5rem; }

.route-chip {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.45rem 1rem;
    border: 1px solid var(--surface-border);
    border-radius: 100px;
    background: var(--surface-card);
    color: var(--text-color-secondary);
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}
.route-chip:hover { border-color: #f6cb03; color: #f6cb03; background: rgba(246,203,3,0.06); }

/* ── Responsive ───────────────────────────────────── */
@media (max-width: 900px) {
    .details-row { grid-template-columns: 1fr 1fr; }
    .hero-title  { font-size: 1.75rem; }
}

@media (max-width: 600px) {
    .route-row    { grid-template-columns: 1fr; }
    .swap-btn     { margin: 0 auto; transform: rotate(90deg); }
    .details-row  { grid-template-columns: 1fr; }
    .search-action { justify-content: stretch; }
    .search-btn   { width: 100%; justify-content: center; }
    .hero-title   { font-size: 1.5rem; }
    .search-card-container { padding: 0 1rem; }
}
</style>