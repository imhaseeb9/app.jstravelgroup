<script setup>
import FlightCard from '@/components/flights/FlightCard.vue'
import FlightSearchLoader from '@/components/flights/FlightSearchLoader.vue'
import api from '@/service/api'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// ─── State ────────────────────────────────────────────
const loading = ref(true)
const error = ref(null)
const allItineraries = ref([])
const calendar = ref([])
const searchParams = ref({})
const calendarRange = ref(3)

// ─── Filters ─────────────────────────────────────────
const filterStops = ref([])          // [] = all, [0] = direct only, [1] = 1 stop
const filterAirlines = ref([])       // [] = all airlines
const filterPriceMax = ref(null)
const filterDepartureTime = ref([])  // 'morning','afternoon','evening','night'
const filterBaggageOnly = ref(false)
const filterRefundable = ref(false)

// ─── Sort ─────────────────────────────────────────────
const sortBy = ref('price') // price | duration | departure

// ─── Sidebar mobile toggle ────────────────────────────
const showFilters = ref(false)

// ─── Fetch Results ────────────────────────────────────
async function fetchResults(params) {
    loading.value = true
    error.value = null
    try {
        const response = await api.post('/flights/search', {
            origin:         params.origin,
            destination:    params.destination,
            departure_date: params.departure_date,
            return_date:    params.return_date || undefined,
            adults:         Number(params.adults) || 1,
            children:       Number(params.children) || 0,
            infants:        Number(params.infants) || 0,
            cabin_class:    params.cabin_class || 'Y',
            trip_type:      params.trip_type || 'oneway',
        })
        allItineraries.value = response.data.itineraries || []
        calendar.value = response.data.calendar || []
        searchParams.value = response.data.search_params || params
        calendarRange.value = response.data.calendar_range || 3
    } catch (err) {
        error.value = err.response?.data?.message || 'Search failed. Please try again.'
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchResults(route.query)
})

// ─── Available filter options (derived from results) ──
const availableAirlines = computed(() => {
    const seen = {}
    allItineraries.value.forEach(i => {
        if (!seen[i.validating_carrier]) {
            seen[i.validating_carrier] = {
                code: i.validating_carrier,
                count: 0,
                minPrice: Infinity,
            }
        }
        seen[i.validating_carrier].count++
        if (i.total_price < seen[i.validating_carrier].minPrice) {
            seen[i.validating_carrier].minPrice = i.total_price
        }
    })
    return Object.values(seen).sort((a, b) => a.minPrice - b.minPrice)
})

const priceRange = computed(() => {
    if (!allItineraries.value.length) return { min: 0, max: 0 }
    const prices = allItineraries.value.map(i => i.total_price)
    return { min: Math.min(...prices), max: Math.max(...prices) }
})

// Set default max price when results load
watch(allItineraries, (itins) => {
    if (itins.length && filterPriceMax.value === null) {
        filterPriceMax.value = priceRange.value.max
    }
})

// ─── Filtered + Sorted Results ────────────────────────
const filteredItineraries = computed(() => {
    let list = [...allItineraries.value]

    // Stops filter
    if (filterStops.value.length > 0) {
        list = list.filter(i => filterStops.value.includes(i.stops))
    }

    // Airlines filter
    if (filterAirlines.value.length > 0) {
        list = list.filter(i => filterAirlines.value.includes(i.validating_carrier))
    }

    // Price filter
    if (filterPriceMax.value !== null) {
        list = list.filter(i => i.total_price <= filterPriceMax.value)
    }

    // Departure time filter
    if (filterDepartureTime.value.length > 0) {
        list = list.filter(i => {
            const seg = i.outbound?.[0] || i.segments?.[0]
            if (!seg) return true
            const hour = parseInt(seg.departure_datetime.substring(11, 13))
            const slot = hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'
            return filterDepartureTime.value.includes(slot)
        })
    }

    // Baggage filter
    if (filterBaggageOnly.value) {
        list = list.filter(i => i.baggage_weight > 0 || i.baggage_pieces > 0)
    }

    // Refundable filter
    if (filterRefundable.value) {
        list = list.filter(i => i.is_refundable)
    }

    // Sort
    if (sortBy.value === 'price') {
        list.sort((a, b) => a.total_price - b.total_price)
    } else if (sortBy.value === 'duration') {
        list.sort((a, b) => a.total_duration - b.total_duration)
    } else if (sortBy.value === 'departure') {
        list.sort((a, b) => {
            const ta = a.outbound?.[0]?.departure_datetime || ''
            const tb = b.outbound?.[0]?.departure_datetime || ''
            return ta.localeCompare(tb)
        })
    }

    return list
})

// ─── Reset Filters ────────────────────────────────────
function resetFilters() {
    filterStops.value = []
    filterAirlines.value = []
    filterPriceMax.value = priceRange.value.max
    filterDepartureTime.value = []
    filterBaggageOnly.value = false
    filterRefundable.value = false
}

const hasActiveFilters = computed(() =>
    filterStops.value.length > 0 ||
    filterAirlines.value.length > 0 ||
    filterDepartureTime.value.length > 0 ||
    filterBaggageOnly.value ||
    filterRefundable.value ||
    (filterPriceMax.value !== null && filterPriceMax.value < priceRange.value.max)
)

// ─── Toggle helpers ───────────────────────────────────
function toggleStop(val) {
    const idx = filterStops.value.indexOf(val)
    if (idx > -1) filterStops.value.splice(idx, 1)
    else filterStops.value.push(val)
}

function toggleAirline(code) {
    const idx = filterAirlines.value.indexOf(code)
    if (idx > -1) filterAirlines.value.splice(idx, 1)
    else filterAirlines.value.push(code)
}

function toggleDeptTime(slot) {
    const idx = filterDepartureTime.value.indexOf(slot)
    if (idx > -1) filterDepartureTime.value.splice(idx, 1)
    else filterDepartureTime.value.push(slot)
}

// ─── Calendar Date Select ─────────────────────────────
function selectCalendarDate(date) {
    const newQuery = { ...route.query, departure_date: date }
    router.replace({ query: newQuery })
    fetchResults(newQuery)
}

// ─── Select Flight → Go to Booking ───────────────────
function selectFlight(itinerary) {
    // Store selected itinerary in sessionStorage for booking page
    sessionStorage.setItem('selectedFlight', JSON.stringify({
        itinerary,
        searchParams: searchParams.value,
    }))
    router.push({ name: 'flights.booking' })
}

// ─── Helpers ─────────────────────────────────────────
function formatPrice(amount) {
    return new Intl.NumberFormat('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)
}

function formatDate(dateStr) {
    const d = new Date(dateStr)
    return {
        day: d.toLocaleDateString('en-GB', { weekday: 'short' }),
        date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    }
}

const cabinLabels = { Y: 'Economy', W: 'Prem. Economy', C: 'Business', F: 'First' }
const cabinLabel = computed(() => cabinLabels[route.query.cabin_class] || 'Economy')

const airlineNames = {
    PK: 'Pakistan Int\'l', EK: 'Emirates', QR: 'Qatar Airways',
    EY: 'Etihad', FZ: 'flydubai', TK: 'Turkish', SV: 'Saudia',
    G9: 'Air Arabia',
}
function airlineName(code) { return airlineNames[code] || code }

function airlineLogo(code) {
    return `https://pics.avs.io/40/40/${code}.png`
}

const timeSlots = [
    { key: 'morning',   label: 'Morning',   sub: '06:00–12:00', icon: '🌅' },
    { key: 'afternoon', label: 'Afternoon', sub: '12:00–18:00', icon: '☀️' },
    { key: 'evening',   label: 'Evening',   sub: '18:00–24:00', icon: '🌆' },
    { key: 'night',     label: 'Night',     sub: '00:00–06:00', icon: '🌙' },
]
</script>

<template>
    <div class="results-page">

        <!-- Top Bar: Search Summary + Edit -->
        <div class="results-topbar">
            <div class="search-summary">
                <span class="route-label">
                    {{ route.query.origin }} → {{ route.query.destination }}
                </span>
                <span class="summary-sep">·</span>
                <span>{{ route.query.departure_date }}</span>
                <span class="summary-sep">·</span>
                <span>{{ route.query.adults }} Adult<template v-if="Number(route.query.adults) > 1">s</template></span>
                <template v-if="Number(route.query.children) > 0">
                    <span class="summary-sep">·</span>
                    <span>{{ route.query.children }} Child<template v-if="Number(route.query.children) > 1">ren</template></span>
                </template>
                <span class="summary-sep">·</span>
                <span>{{ cabinLabel }}</span>
            </div>
            <button class="modify-btn" @click="router.push({ name: 'flights.search' })">
                <i class="pi pi-pencil"></i> Modify Search
            </button>
        </div>

        <!-- Calendar Strip -->
        <div class="calendar-strip-wrap">
            <div class="calendar-strip">
                <div
                    v-for="day in calendar"
                    :key="day.date"
                    class="cal-day"
                    :class="{
                        'cal-target': day.is_target,
                        'cal-unavailable': !day.available,
                    }"
                    @click="!day.is_target && day.available && selectCalendarDate(day.date)"
                >
                    <div class="cal-weekday">{{ formatDate(day.date).day }}</div>
                    <div class="cal-date">{{ formatDate(day.date).date }}</div>
                    <div v-if="day.is_target" class="cal-price cal-price-selected">Selected</div>
                    <div v-else-if="day.available && day.min_price" class="cal-price">
                        {{ route.query.currency || 'PKR' }} {{ formatPrice(day.min_price) }}
                    </div>
                    <div v-else class="cal-price cal-na">—</div>
                </div>
            </div>
        </div>

        <!-- Main Layout -->
        <div class="results-layout">

            <!-- Filter Sidebar -->
            <aside class="filter-sidebar" :class="{ 'sidebar-open': showFilters }">

                <div class="sidebar-header">
                    <span class="sidebar-title">Filters</span>
                    <button v-if="hasActiveFilters" class="reset-btn" @click="resetFilters">
                        Reset all
                    </button>
                </div>

                <!-- Stops -->
                <div class="filter-section">
                    <div class="filter-title">Stops</div>
                    <div class="filter-options">
                        <label
                            v-for="opt in [{ val: 0, label: 'Direct' }, { val: 1, label: '1 Stop' }, { val: 2, label: '2+ Stops' }]"
                            :key="opt.val"
                            class="filter-checkbox"
                        >
                            <input
                                type="checkbox"
                                :checked="filterStops.includes(opt.val)"
                                @change="toggleStop(opt.val)"
                            />
                            <span class="checkbox-label">{{ opt.label }}</span>
                        </label>
                    </div>
                </div>

                <!-- Airlines -->
                <div class="filter-section">
                    <div class="filter-title">Airlines</div>
                    <div class="filter-options">
                        <label
                            v-for="airline in availableAirlines"
                            :key="airline.code"
                            class="filter-checkbox airline-filter"
                        >
                            <input
                                type="checkbox"
                                :checked="filterAirlines.includes(airline.code)"
                                @change="toggleAirline(airline.code)"
                            />
                            <img
                                :src="airlineLogo(airline.code)"
                                :alt="airline.code"
                                class="airline-logo-sm"
                                @error="e => e.target.style.display='none'"
                            />
                            <div class="airline-filter-info">
                                <span class="checkbox-label">{{ airlineName(airline.code) }}</span>
                                <span class="airline-min-price">from {{ formatPrice(airline.minPrice) }}</span>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Price Range -->
                <div class="filter-section">
                    <div class="filter-title">
                        Max Price
                        <span class="filter-value-label">
                            {{ route.query.currency || 'PKR' }} {{ formatPrice(filterPriceMax || 0) }}
                        </span>
                    </div>
                    <input
                        v-if="priceRange.max > 0"
                        type="range"
                        class="price-slider"
                        :min="priceRange.min"
                        :max="priceRange.max"
                        :step="1000"
                        v-model.number="filterPriceMax"
                    />
                    <div class="price-range-labels">
                        <span>{{ formatPrice(priceRange.min) }}</span>
                        <span>{{ formatPrice(priceRange.max) }}</span>
                    </div>
                </div>

                <!-- Departure Time -->
                <div class="filter-section">
                    <div class="filter-title">Departure Time</div>
                    <div class="time-slots">
                        <button
                            v-for="slot in timeSlots"
                            :key="slot.key"
                            class="time-slot-btn"
                            :class="{ active: filterDepartureTime.includes(slot.key) }"
                            @click="toggleDeptTime(slot.key)"
                        >
                            <span class="slot-icon">{{ slot.icon }}</span>
                            <span class="slot-label">{{ slot.label }}</span>
                            <span class="slot-sub">{{ slot.sub }}</span>
                        </button>
                    </div>
                </div>

                <!-- Other Filters -->
                <div class="filter-section">
                    <div class="filter-title">Other</div>
                    <div class="filter-options">
                        <label class="filter-checkbox">
                            <input type="checkbox" v-model="filterBaggageOnly" />
                            <span class="checkbox-label">Includes Baggage</span>
                        </label>
                        <label class="filter-checkbox">
                            <input type="checkbox" v-model="filterRefundable" />
                            <span class="checkbox-label">Refundable Only</span>
                        </label>
                    </div>
                </div>

            </aside>

            <!-- Results Column -->
            <div class="results-column">

                <!-- Sort + Results Count Bar -->
                <div class="results-bar">
                    <div class="results-count">
                        <template v-if="loading">Searching...</template>
                        <template v-else>
                            <strong>{{ filteredItineraries.length }}</strong> flights found
                            <span v-if="hasActiveFilters" class="filtered-note">
                                (filtered from {{ allItineraries.length }})
                            </span>
                        </template>
                    </div>
                    <div class="sort-options">
                        <span class="sort-label">Sort:</span>
                        <button
                            v-for="opt in [{ val: 'price', label: 'Cheapest' }, { val: 'duration', label: 'Fastest' }, { val: 'departure', label: 'Earliest' }]"
                            :key="opt.val"
                            class="sort-btn"
                            :class="{ active: sortBy === opt.val }"
                            @click="sortBy = opt.val"
                        >
                            {{ opt.label }}
                        </button>
                    </div>
                    <!-- Mobile filter toggle -->
                    <button class="mobile-filter-btn" @click="showFilters = !showFilters">
                        <i class="pi pi-sliders-h"></i>
                        Filters
                        <span v-if="hasActiveFilters" class="filter-dot"></span>
                    </button>
                </div>

                <!-- Loading Skeletons -->
                <FlightSearchLoader
                    v-if="loading"
                    :origin="route.query.origin"
                    :destination="route.query.destination"
                    :date="route.query.departure_date"
                    :passengers="Number(route.query.adults) || 1"
                />

                <!-- Error State -->
                <div v-else-if="error" class="empty-state error-state">
                    <i class="pi pi-exclamation-circle"></i>
                    <h3>Search Failed</h3>
                    <p>{{ error }}</p>
                    <button class="retry-btn" @click="fetchResults(route.query)">Try Again</button>
                </div>

                <!-- No Results -->
                <div v-else-if="filteredItineraries.length === 0 && allItineraries.length > 0" class="empty-state">
                    <i class="pi pi-filter-slash"></i>
                    <h3>No flights match your filters</h3>
                    <p>Try adjusting your filters to see more results.</p>
                    <button class="retry-btn" @click="resetFilters">Clear Filters</button>
                </div>

                <div v-else-if="filteredItineraries.length === 0" class="empty-state">
                    <i class="pi pi-send"></i>
                    <h3>No flights found</h3>
                    <p>Try different dates or routes.</p>
                    <button class="retry-btn" @click="router.push({ name: 'flights.search' })">New Search</button>
                </div>

                <!-- Flight Cards -->
                <template v-else>
                    <FlightCard
                        v-for="itin in filteredItineraries"
                        :key="itin.id"
                        :itinerary="itin"
                        @select="selectFlight"
                    />
                </template>

            </div>
        </div>

        <!-- Mobile Filter Overlay -->
        <div
            v-if="showFilters"
            class="filter-overlay"
            @click="showFilters = false"
        ></div>

    </div>
</template>

<style scoped>
/* ── Page ─────────────────────────────────────────── */
.results-page {
    min-height: 100%;
    background: var(--surface-ground);
}

/* ── Top Bar ──────────────────────────────────────── */
.results-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.875rem 1.5rem;
    background: var(--surface-card);
    border-bottom: 1px solid var(--surface-border);
    flex-wrap: wrap;
    gap: 0.75rem;
}

.search-summary {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.4rem;
    font-size: 0.875rem;
    color: var(--text-color);
}

.route-label {
    font-weight: 800;
    font-size: 1rem;
}

.summary-sep {
    color: var(--text-color-secondary);
}

.modify-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 1rem;
    border: 1px solid var(--surface-border);
    border-radius: 8px;
    background: var(--surface-card);
    color: var(--text-color);
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.modify-btn:hover {
    border-color: #f6cb03;
    color: #f6cb03;
}

/* ── Calendar Strip ───────────────────────────────── */
.calendar-strip-wrap {
    background: var(--surface-card);
    border-bottom: 1px solid var(--surface-border);
    overflow-x: auto;
    scrollbar-width: thin;
}

.calendar-strip {
    display: flex;
    padding: 0.75rem 1.5rem;
    gap: 0.5rem;
    min-width: max-content;
}

.cal-day {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    padding: 0.6rem 1rem;
    border-radius: 10px;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s;
    min-width: 90px;
    background: var(--surface-ground);
}

.cal-day:hover:not(.cal-target):not(.cal-unavailable) {
    border-color: #f6cb03;
    background: rgba(246,203,3,0.06);
}

.cal-target {
    border-color: #f6cb03;
    background: rgba(246,203,3,0.1);
    cursor: default;
}

.cal-unavailable {
    opacity: 0.4;
    cursor: not-allowed;
}

.cal-weekday {
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--text-color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.cal-date {
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--text-color);
}

.cal-price {
    font-size: 0.72rem;
    font-weight: 600;
    color: #22c55e;
}

.cal-price-selected {
    color: #f6cb03;
}

.cal-na {
    color: var(--text-color-secondary);
}

/* ── Layout ───────────────────────────────────────── */
.results-layout {
    display: grid;
    grid-template-columns: 260px 1fr;
    gap: 1.25rem;
    padding: 1.25rem 1.5rem;
    max-width: 1400px;
    margin: 0 auto;
    align-items: start;
}

/* ── Filter Sidebar ───────────────────────────────── */
.filter-sidebar {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 12px;
    overflow: hidden;
    position: sticky;
    top: 1rem;
}

.sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.1rem 0.75rem;
    border-bottom: 1px solid var(--surface-border);
}

.sidebar-title {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--text-color);
    text-transform: uppercase;
    letter-spacing: 0.06em;
}

.reset-btn {
    font-size: 0.75rem;
    font-weight: 600;
    color: #f6cb03;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
}

.filter-section {
    padding: 0.875rem 1.1rem;
    border-bottom: 1px solid var(--surface-border);
}

.filter-section:last-child {
    border-bottom: none;
}

.filter-title {
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--text-color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 0.6rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.filter-value-label {
    font-size: 0.78rem;
    font-weight: 700;
    color: #f6cb03;
    text-transform: none;
    letter-spacing: 0;
}

.filter-options {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.filter-checkbox {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    cursor: pointer;
    font-size: 0.82rem;
}

.filter-checkbox input[type="checkbox"] {
    width: 15px;
    height: 15px;
    accent-color: #f6cb03;
    cursor: pointer;
    flex-shrink: 0;
}

.checkbox-label {
    color: var(--text-color);
    font-weight: 500;
}

/* ── Airline Filter ───────────────────────────────── */
.airline-filter {
    align-items: center;
}

.airline-logo-sm {
    width: 22px;
    height: 22px;
    object-fit: contain;
    border-radius: 4px;
    flex-shrink: 0;
}

.airline-filter-info {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
}

.airline-min-price {
    font-size: 0.7rem;
    color: var(--text-color-secondary);
}

/* ── Price Slider ─────────────────────────────────── */
.price-slider {
    width: 100%;
    accent-color: #f6cb03;
    margin: 0.35rem 0;
}

.price-range-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.7rem;
    color: var(--text-color-secondary);
}

/* ── Time Slots ───────────────────────────────────── */
.time-slots {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.4rem;
}

.time-slot-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.1rem;
    padding: 0.5rem 0.25rem;
    border: 1px solid var(--surface-border);
    border-radius: 8px;
    background: var(--surface-ground);
    cursor: pointer;
    transition: all 0.15s;
}

.time-slot-btn:hover,
.time-slot-btn.active {
    border-color: #f6cb03;
    background: rgba(246,203,3,0.08);
}

.slot-icon { font-size: 1rem; }
.slot-label {
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--text-color);
}
.slot-sub {
    font-size: 0.65rem;
    color: var(--text-color-secondary);
}

/* ── Results Column ───────────────────────────────── */
.results-column {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

/* ── Sort Bar ─────────────────────────────────────── */
.results-bar {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 10px;
    flex-wrap: wrap;
}

.results-count {
    font-size: 0.875rem;
    color: var(--text-color-secondary);
    flex: 1;
}

.results-count strong {
    color: var(--text-color);
    font-size: 1rem;
}

.filtered-note {
    font-size: 0.75rem;
    color: var(--text-color-secondary);
}

.sort-options {
    display: flex;
    align-items: center;
    gap: 0.35rem;
}

.sort-label {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--text-color-secondary);
}

.sort-btn {
    padding: 0.35rem 0.75rem;
    border: 1px solid var(--surface-border);
    border-radius: 6px;
    background: var(--surface-ground);
    color: var(--text-color-secondary);
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
}

.sort-btn:hover,
.sort-btn.active {
    border-color: #f6cb03;
    color: #f6cb03;
    background: rgba(246,203,3,0.08);
}

.mobile-filter-btn {
    display: none;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.875rem;
    border: 1px solid var(--surface-border);
    border-radius: 8px;
    background: var(--surface-ground);
    color: var(--text-color);
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    position: relative;
}

.filter-dot {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #f6cb03;
}

/* ── Skeleton ─────────────────────────────────────── */
.skeleton-card {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 12px;
    padding: 1.1rem 1.25rem;
    display: grid;
    grid-template-columns: 130px 1fr 160px;
    gap: 1rem;
    align-items: center;
}

.skeleton-airline,
.skeleton-route,
.skeleton-price {
    background: var(--surface-ground);
    border-radius: 8px;
    animation: shimmer 1.5s infinite;
}

.skeleton-airline { height: 60px; }
.skeleton-route   { height: 50px; }
.skeleton-price   { height: 70px; }

@keyframes shimmer {
    0%, 100% { opacity: 0.5; }
    50%       { opacity: 1; }
}

/* ── Empty / Error States ─────────────────────────── */
.empty-state {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 12px;
    padding: 3rem 1.5rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
}

.empty-state .pi {
    font-size: 2.5rem;
    color: var(--text-color-secondary);
}

.error-state .pi {
    color: #ef4444;
}

.empty-state h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-color);
    margin: 0;
}

.empty-state p {
    font-size: 0.875rem;
    color: var(--text-color-secondary);
    margin: 0;
}

.retry-btn {
    padding: 0.6rem 1.5rem;
    background: #f6cb03;
    color: #1a1a2e;
    border: none;
    border-radius: 8px;
    font-weight: 700;
    cursor: pointer;
    font-size: 0.875rem;
    transition: opacity 0.2s;
}

.retry-btn:hover { opacity: 0.88; }

/* ── Mobile Overlay ───────────────────────────────── */
.filter-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 49;
}

/* ── Responsive ───────────────────────────────────── */
@media (max-width: 900px) {
    .results-layout {
        grid-template-columns: 1fr;
        padding: 1rem;
    }
    .filter-sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        width: 300px;
        z-index: 50;
        border-radius: 0;
        overflow-y: auto;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
    }
    .filter-sidebar.sidebar-open {
        transform: translateX(0);
    }
    .filter-overlay {
        display: block;
    }
    .mobile-filter-btn {
        display: flex;
    }
}

@media (max-width: 600px) {
    .results-topbar {
        padding: 0.75rem 1rem;
    }
    .calendar-strip {
        padding: 0.5rem 1rem;
    }
    .results-layout {
        padding: 0.75rem;
    }
}
</style>