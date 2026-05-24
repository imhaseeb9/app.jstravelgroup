<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
    itinerary: {
        type: Object,
        required: true,
    },
    currency: {
        type: String,
        default: 'PKR',
    },
})

const emit = defineEmits(['select'])

const expanded = ref(false)

// ─── Airline Logo ─────────────────────────────────────
function airlineLogo(code) {
    return `https://pics.avs.io/60/60/${code}.png`
}

function onLogoError(e) {
    e.target.style.display = 'none'
    e.target.nextElementSibling.style.display = 'flex'
}

// ─── Airline Names ────────────────────────────────────
const airlineNames = {
    PK: 'Pakistan Int\'l', EK: 'Emirates', QR: 'Qatar Airways',
    EY: 'Etihad Airways', FZ: 'flydubai', TK: 'Turkish Airlines',
    SV: 'Saudia', GF: 'Gulf Air', WY: 'Oman Air', G9: 'Air Arabia',
    PA: 'PIA', AI: 'Air India', BA: 'British Airways', LH: 'Lufthansa',
}

function airlineName(code) {
    return airlineNames[code] || code
}

// ─── Airport Names ────────────────────────────────────
const airportCities = {
    KHI: 'Karachi', LHE: 'Lahore', ISB: 'Islamabad', PEW: 'Peshawar',
    MUX: 'Multan', DXB: 'Dubai', AUH: 'Abu Dhabi', DOH: 'Doha',
    LHR: 'London', JED: 'Jeddah', RUH: 'Riyadh', KUL: 'Kuala Lumpur',
    BKK: 'Bangkok', CDG: 'Paris', FRA: 'Frankfurt', KDU: 'Skardu',
    XNB: 'Dubai Bus Stn',
}

function cityName(code) {
    return airportCities[code] || code
}

// ─── Duration Format ──────────────────────────────────
function formatDuration(minutes) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h}h ${m}m` : `${h}h`
}

// ─── Time Format ──────────────────────────────────────
function formatTime(datetime) {
    if (!datetime) return '--'
    return datetime.substring(11, 16)
}

// ─── Date Format ──────────────────────────────────────
function formatDate(datetime) {
    if (!datetime) return ''
    const d = new Date(datetime)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

// ─── Price Format ─────────────────────────────────────
function formatPrice(amount) {
    return new Intl.NumberFormat('en-PK', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

// ─── Stops Label ─────────────────────────────────────
const stopsLabel = computed(() => {
    const s = props.itinerary.stops
    if (s === 0) return 'Direct'
    if (s === 1) return '1 Stop'
    return `${s} Stops`
})

const stopsClass = computed(() => {
    const s = props.itinerary.stops
    if (s === 0) return 'stop-direct'
    if (s === 1) return 'stop-one'
    return 'stop-multi'
})

// ─── Via Stops ────────────────────────────────────────
const viaStops = computed(() => {
    const segs = props.itinerary.outbound || props.itinerary.segments || []
    if (segs.length <= 1) return null
    // Collect intermediate airports (all arrival airports except the final one)
    const stops = segs
        .slice(0, -1)
        .map(s => s.arrival_airport)
        .filter(code => code && code !== 'XNB') // exclude bus station codes
    if (!stops.length) return null
    return stops.map(code => cityName(code)).join(', ')
})

// ─── Outbound segments ───────────────────────────────
const outbound = computed(() => props.itinerary.outbound || props.itinerary.segments || [])

// First and last segment for top-level display
const firstSeg = computed(() => outbound.value[0] || {})
const lastSeg = computed(() => outbound.value[outbound.value.length - 1] || {})

// ─── Layover times ────────────────────────────────────
function layoverTime(segs, index) {
    if (index >= segs.length - 1) return null
    const arr = new Date(segs[index].arrival_datetime)
    const dep = new Date(segs[index + 1].departure_datetime)
    const diff = Math.round((dep - arr) / 60000)
    return formatDuration(diff)
}

// ─── Cabin label ─────────────────────────────────────
const cabinLabel = computed(() => {
    const map = { Y: 'Economy', W: 'Prem. Economy', C: 'Business', F: 'First' }
    return map[props.itinerary.cabin_class] || props.itinerary.cabin_class
})

// ─── Meal label ──────────────────────────────────────
const mealLabel = computed(() => {
    const map = { M: 'Meal', B: 'Breakfast', S: 'Snack', L: 'Lunch', D: 'Dinner' }
    return props.itinerary.meal ? (map[props.itinerary.meal] || 'Meal Included') : null
})

// ─── Next day arrival ─────────────────────────────────
const isNextDay = computed(() => {
    if (!firstSeg.value.departure_datetime || !lastSeg.value.arrival_datetime) return false
    const dep = new Date(firstSeg.value.departure_datetime)
    const arr = new Date(lastSeg.value.arrival_datetime)
    return arr.toDateString() !== dep.toDateString()
})
</script>

<template>
    <div class="flight-card" :class="{ expanded }">

        <!-- Main Card Row -->
        <div class="card-main">

            <!-- Airline Info -->
            <div class="airline-col">
                <div class="airline-logo-wrap">
                    <img
                        :src="airlineLogo(itinerary.validating_carrier)"
                        :alt="itinerary.validating_carrier"
                        class="airline-logo"
                        @error="onLogoError"
                    />
                    <div class="airline-fallback" style="display:none">
                        {{ itinerary.validating_carrier }}
                    </div>
                </div>
                <div class="airline-name">{{ airlineName(itinerary.validating_carrier) }}</div>
                <div class="flight-nums">
                    <span
                        v-for="seg in outbound.filter(s => !s.is_bus)"
                        :key="seg.flight_number"
                        class="flight-num-badge"
                    >
                        {{ itinerary.validating_carrier }}{{ seg.flight_number }}
                    </span>
                </div>
            </div>

            <!-- Route Timeline -->
            <div class="route-col">

                <!-- Departure -->
                <div class="time-block">
                    <div class="time">{{ formatTime(firstSeg.departure_datetime) }}</div>
                    <div class="airport-code">{{ firstSeg.departure_airport }}</div>
                    <div class="airport-city">{{ cityName(firstSeg.departure_airport) }}</div>
                    <div v-if="firstSeg.departure_terminal" class="terminal">T{{ firstSeg.departure_terminal }}</div>
                </div>

                <!-- Duration & Stops Bar -->
                <div class="route-bar">
                    <div class="duration">{{ formatDuration(itinerary.total_duration) }}</div>
                    <div class="bar">
                        <div class="bar-line"></div>
                        <div v-if="itinerary.stops === 0" class="bar-direct-dot"></div>
                        <template v-else>
                            <div
                                v-for="(seg, i) in outbound.slice(0, -1)"
                                :key="i"
                                class="stop-dot"
                                :class="{ 'is-bus': outbound[i+1]?.is_bus }"
                                :title="seg.arrival_airport"
                            ></div>
                        </template>
                    </div>
                    <div class="stops-badge" :class="stopsClass">{{ stopsLabel }}</div>
                    <div v-if="viaStops" class="via-stops">via {{ viaStops }}</div>
                </div>

                <!-- Arrival -->
                <div class="time-block arrival">
                    <div class="time">
                        {{ formatTime(lastSeg.arrival_datetime) }}
                        <sup v-if="isNextDay" class="next-day">+1</sup>
                    </div>
                    <div class="airport-code">{{ lastSeg.arrival_airport }}</div>
                    <div class="airport-city">{{ cityName(lastSeg.arrival_airport) }}</div>
                    <div v-if="lastSeg.arrival_terminal" class="terminal">T{{ lastSeg.arrival_terminal }}</div>
                </div>

            </div>

            <!-- Tags Column -->
            <div class="tags-col">
                <span class="tag tag-cabin">{{ cabinLabel }}</span>
                <span v-if="itinerary.baggage_weight > 0" class="tag tag-baggage">
                    <i class="pi pi-briefcase"></i> {{ itinerary.baggage_weight }} kg
                </span>
                <span v-else-if="itinerary.baggage_pieces > 0" class="tag tag-baggage">
                    <i class="pi pi-briefcase"></i> {{ itinerary.baggage_pieces }} pc
                </span>
                <span v-else class="tag tag-no-baggage">
                    <i class="pi pi-briefcase"></i> No Baggage
                </span>
                <span v-if="mealLabel" class="tag tag-meal">
                    <i class="pi pi-star"></i> {{ mealLabel }}
                </span>
                <span class="tag" :class="itinerary.is_refundable ? 'tag-refundable' : 'tag-nonrefundable'">
                    <i class="pi" :class="itinerary.is_refundable ? 'pi-check-circle' : 'pi-times-circle'"></i>
                    {{ itinerary.is_refundable ? 'Refundable' : 'Non-Refundable' }}
                </span>
                <span v-if="itinerary.seats_remaining <= 4" class="tag tag-seats">
                    <i class="pi pi-exclamation-triangle"></i>
                    {{ itinerary.seats_remaining }} seats left
                </span>
            </div>

            <!-- Price & Action -->
            <div class="price-col">
                <div class="price-block">
                    <div class="price-currency">{{ itinerary.currency }}</div>
                    <div class="price-amount">{{ formatPrice(itinerary.total_price) }}</div>
                    <div class="price-label">per person</div>
                </div>
                <button class="select-btn" @click="emit('select', itinerary)">
                    Select
                    <i class="pi pi-arrow-right"></i>
                </button>
                <button class="details-toggle" @click="expanded = !expanded">
                    {{ expanded ? 'Hide details' : 'Flight details' }}
                    <i class="pi" :class="expanded ? 'pi-chevron-up' : 'pi-chevron-down'"></i>
                </button>
            </div>

        </div><!-- end card-main -->

        <!-- Expanded Detail Panel -->
        <Transition name="expand">
            <div v-if="expanded" class="card-detail">
                <div class="detail-header">
                    <span>Flight Details</span>
                    <span class="fare-basis">Fare: {{ itinerary.fare_basis }}</span>
                </div>

                <!-- Segment Timeline -->
                <div class="segment-timeline">
                    <template v-for="(seg, index) in outbound" :key="index">

                        <!-- Segment Row -->
                        <div class="segment-row" :class="{ 'is-bus-row': seg.is_bus }">

                            <!-- Left: Time + Date -->
                            <div class="seg-time-col">
                                <div class="seg-time">{{ formatTime(seg.departure_datetime) }}</div>
                                <div class="seg-date">{{ formatDate(seg.departure_datetime) }}</div>
                            </div>

                            <!-- Center: Dot + Line -->
                            <div class="seg-dot-col">
                                <div class="seg-dot" :class="{ 'bus-dot': seg.is_bus }">
                                    <i v-if="seg.is_bus" class="pi pi-car"></i>
                                    <i v-else class="pi pi-send"></i>
                                </div>
                                <div v-if="index < outbound.length - 1" class="seg-line"></div>
                            </div>

                            <!-- Right: Info -->
                            <div class="seg-info">
                                <div class="seg-airport">
                                    <span class="seg-code">{{ seg.departure_airport }}</span>
                                    <span class="seg-city">{{ cityName(seg.departure_airport) }}</span>
                                    <span v-if="seg.departure_terminal" class="seg-terminal">Terminal {{ seg.departure_terminal }}</span>
                                </div>

                                <!-- Flight info bar -->
                                <div class="seg-flight-bar">
                                    <template v-if="seg.is_bus">
                                        <span class="seg-detail-item bus-label">
                                            <i class="pi pi-car"></i> Bus Transfer
                                        </span>
                                    </template>
                                    <template v-else>
                                        <div class="seg-airline-mini">
                                            <img
                                                :src="airlineLogo(seg.operating_airline)"
                                                :alt="seg.operating_airline"
                                                class="seg-logo"
                                                @error="e => e.target.style.display='none'"
                                            />
                                            <span>{{ airlineName(seg.operating_airline) }}</span>
                                            <span class="seg-flight-no">{{ seg.operating_airline }}{{ seg.flight_number }}</span>
                                        </div>
                                        <div class="seg-details-row">
                                            <span class="seg-detail-item">
                                                <i class="pi pi-clock"></i> {{ formatDuration(seg.elapsed_time) }}
                                            </span>
                                            <span class="seg-detail-item">
                                                <i class="pi pi-tag"></i> {{ seg.booking_class }}
                                            </span>
                                            <span v-if="seg.equipment" class="seg-detail-item">
                                                <i class="pi pi-send"></i> {{ seg.equipment }}
                                            </span>
                                            <span v-if="seg.operating_airline !== seg.marketing_airline && seg.marketing_airline" class="seg-detail-item codeshare">
                                                Marketed by {{ airlineName(seg.marketing_airline) }}
                                            </span>
                                        </div>
                                    </template>
                                </div>

                                <!-- Arrival of this segment -->
                                <div class="seg-airport seg-arrival">
                                    <span class="seg-time-inline">{{ formatTime(seg.arrival_datetime) }}</span>
                                    <span class="seg-code">{{ seg.arrival_airport }}</span>
                                    <span class="seg-city">{{ cityName(seg.arrival_airport) }}</span>
                                    <span v-if="seg.arrival_terminal" class="seg-terminal">Terminal {{ seg.arrival_terminal }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Layover between segments -->
                        <div
                            v-if="index < outbound.length - 1"
                            class="layover-row"
                            :class="{ 'bus-layover': outbound[index+1]?.is_bus }"
                        >
                            <i class="pi" :class="outbound[index+1]?.is_bus ? 'pi-car' : 'pi-clock'"></i>
                            <span v-if="outbound[index+1]?.is_bus">Bus transfer to {{ cityName(outbound[index+1].departure_airport) }}</span>
                            <span v-else>{{ layoverTime(outbound, index) }} layover in {{ cityName(seg.arrival_airport) }}</span>
                        </div>

                    </template>
                </div>

                <!-- Fare Summary -->
                <div class="fare-summary">
                    <div class="fare-row">
                        <span>Base Fare</span>
                        <span>{{ itinerary.currency }} {{ formatPrice(itinerary.base_price) }}</span>
                    </div>
                    <div class="fare-row">
                        <span>Taxes &amp; Fees</span>
                        <span>{{ itinerary.currency }} {{ formatPrice(itinerary.taxes) }}</span>
                    </div>
                    <div class="fare-row fare-total">
                        <span>Total</span>
                        <span>{{ itinerary.currency }} {{ formatPrice(itinerary.total_price) }}</span>
                    </div>
                    <div class="fare-row fare-meta">
                        <span>Last ticketing date</span>
                        <span>{{ itinerary.last_ticket_date }}</span>
                    </div>
                </div>

            </div>
        </Transition>

    </div>
</template>

<style scoped>
/* ── Card Shell ───────────────────────────────────── */
.flight-card {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 12px;
    overflow: hidden;
    transition: box-shadow 0.2s, border-color 0.2s;
}

.flight-card:hover {
    box-shadow: 0 6px 24px rgba(0,0,0,0.09);
    border-color: rgba(246,203,3,0.3);
}

/* ── Main Row ─────────────────────────────────────── */
.card-main {
    display: grid;
    grid-template-columns: 130px 1fr 160px 160px;
    gap: 0;
    align-items: center;
    padding: 1.1rem 1.25rem;
}

/* ── Airline Column ───────────────────────────────── */
.airline-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    padding-right: 1rem;
    border-right: 1px solid var(--surface-border);
}

.airline-logo-wrap {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    overflow: hidden;
    background: var(--surface-ground);
    display: flex;
    align-items: center;
    justify-content: center;
}

.airline-logo {
    width: 48px;
    height: 48px;
    object-fit: contain;
}

.airline-fallback {
    width: 48px;
    height: 48px;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 800;
    color: #f6cb03;
    background: rgba(246,203,3,0.1);
    border-radius: 10px;
}

.airline-name {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-color);
    text-align: center;
    line-height: 1.3;
}

.flight-nums {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.25rem;
}

.flight-num-badge {
    font-size: 0.68rem;
    font-weight: 600;
    color: var(--text-color-secondary);
    background: var(--surface-ground);
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    font-family: monospace;
}

/* ── Route Column ─────────────────────────────────── */
.route-col {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0 1.25rem;
}

.time-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
    min-width: 70px;
}

.time {
    font-size: 1.6rem;
    font-weight: 800;
    color: var(--text-color);
    line-height: 1;
    letter-spacing: -0.02em;
    position: relative;
}

.next-day {
    font-size: 0.7rem;
    font-weight: 700;
    color: #f6cb03;
    position: absolute;
    top: -4px;
    right: -14px;
}

.airport-code {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--text-color);
    font-family: monospace;
}

.airport-city {
    font-size: 0.72rem;
    color: var(--text-color-secondary);
}

.terminal {
    font-size: 0.68rem;
    color: var(--text-color-secondary);
    background: var(--surface-ground);
    padding: 0.1rem 0.35rem;
    border-radius: 3px;
}

/* ── Route Bar ────────────────────────────────────── */
.route-bar {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
}

.duration {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-color-secondary);
}

.bar {
    width: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 16px;
}

.bar-line {
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--surface-border);
}

.bar-direct-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #f6cb03;
    position: relative;
    z-index: 1;
}

.stop-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--surface-card);
    border: 2px solid var(--text-color-secondary);
    position: relative;
    z-index: 1;
    margin: 0 4px;
}

.stop-dot.is-bus {
    border-color: #f6cb03;
    background: rgba(246,203,3,0.15);
}

.stops-badge {
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    border-radius: 100px;
}

.stop-direct { color: #22c55e; background: rgba(34,197,94,0.1); }
.stop-one    { color: #f59e0b; background: rgba(245,158,11,0.1); }
.stop-multi  { color: #ef4444; background: rgba(239,68,68,0.1); }

/* ── Tags Column ──────────────────────────────────── */
.tags-col {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    padding: 0 1rem;
    border-left: 1px solid var(--surface-border);
    border-right: 1px solid var(--surface-border);
}

.tag {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.7rem;
    font-weight: 600;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    white-space: nowrap;
}

.tag-cabin        { background: rgba(99,102,241,0.1); color: #6366f1; }
.tag-baggage      { background: rgba(59,130,246,0.1); color: #3b82f6; }
.tag-no-baggage   { background: var(--surface-ground); color: var(--text-color-secondary); }
.tag-meal         { background: rgba(34,197,94,0.1); color: #22c55e; }
.tag-refundable   { background: rgba(34,197,94,0.1); color: #22c55e; }
.tag-nonrefundable{ background: rgba(239,68,68,0.1); color: #ef4444; }
.tag-seats        { background: rgba(245,158,11,0.1); color: #f59e0b; }

/* ── Price Column ─────────────────────────────────── */
.price-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    padding-left: 1.25rem;
}

.price-block {
    text-align: center;
}

.price-currency {
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--text-color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.price-amount {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--text-color);
    letter-spacing: -0.02em;
    line-height: 1.1;
}

.price-label {
    font-size: 0.68rem;
    color: var(--text-color-secondary);
}

.select-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.6rem 1.25rem;
    background: #f6cb03;
    color: #1a1a2e;
    border: none;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    width: 100%;
    justify-content: center;
}

.select-btn:hover {
    background: #e6bc00;
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(246,203,3,0.35);
}

.details-toggle {
    background: none;
    border: none;
    color: var(--text-color-secondary);
    font-size: 0.75rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.2rem 0;
    transition: color 0.15s;
}

.details-toggle:hover {
    color: #f6cb03;
}

/* ── Expand Transition ────────────────────────────── */
.expand-enter-active,
.expand-leave-active {
    transition: all 0.25s ease;
    overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
    max-height: 0;
    opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
    max-height: 800px;
    opacity: 1;
}

/* ── Detail Panel ─────────────────────────────────── */
.card-detail {
    border-top: 1px solid var(--surface-border);
    padding: 1.25rem;
    background: var(--surface-ground);
}

.detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
}

.fare-basis {
    font-family: monospace;
    font-size: 0.78rem;
    background: var(--surface-card);
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
    border: 1px solid var(--surface-border);
    color: var(--text-color);
    text-transform: none;
    letter-spacing: 0;
}

/* ── Segment Timeline ─────────────────────────────── */
.segment-timeline {
    margin-bottom: 1.25rem;
}

.segment-row {
    display: grid;
    grid-template-columns: 80px 32px 1fr;
    gap: 0;
    position: relative;
}

.seg-time-col {
    padding-top: 2px;
    text-align: right;
    padding-right: 0.75rem;
}

.seg-time {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-color);
}

.seg-date {
    font-size: 0.7rem;
    color: var(--text-color-secondary);
}

.seg-dot-col {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.seg-dot {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--surface-card);
    border: 2px solid #f6cb03;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #f6cb03;
    font-size: 0.65rem;
    flex-shrink: 0;
    z-index: 1;
}

.bus-dot {
    border-color: var(--text-color-secondary);
    color: var(--text-color-secondary);
}

.seg-line {
    width: 2px;
    flex: 1;
    min-height: 40px;
    background: var(--surface-border);
    margin: 2px 0;
}

.seg-info {
    padding: 0 0 1.25rem 0.75rem;
}

.seg-airport {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 0.5rem;
}

.seg-arrival {
    margin-top: 0.5rem;
    margin-bottom: 0;
}

.seg-code {
    font-size: 0.9rem;
    font-weight: 800;
    color: var(--text-color);
    font-family: monospace;
}

.seg-city {
    font-size: 0.8rem;
    color: var(--text-color-secondary);
}

.seg-terminal {
    font-size: 0.7rem;
    color: var(--text-color-secondary);
    background: var(--surface-card);
    padding: 0.1rem 0.35rem;
    border-radius: 3px;
    border: 1px solid var(--surface-border);
}

.seg-time-inline {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--text-color);
}

.seg-flight-bar {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 8px;
    padding: 0.6rem 0.875rem;
    margin: 0.4rem 0;
}

.seg-airline-mini {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.35rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-color);
}

.seg-logo {
    width: 20px;
    height: 20px;
    object-fit: contain;
    border-radius: 3px;
}

.seg-flight-no {
    font-family: monospace;
    font-size: 0.78rem;
    color: var(--text-color-secondary);
    background: var(--surface-ground);
    padding: 0.1rem 0.35rem;
    border-radius: 3px;
}

.seg-details-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
}

.seg-detail-item {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.75rem;
    color: var(--text-color-secondary);
}

.seg-detail-item.codeshare {
    color: #6366f1;
    font-style: italic;
}

.bus-label {
    color: var(--text-color-secondary);
    font-style: italic;
}

/* ── Layover Row ──────────────────────────────────── */
.layover-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0.25rem 0 0.25rem 104px;
    font-size: 0.75rem;
    font-weight: 600;
    color: #f59e0b;
    background: rgba(245,158,11,0.08);
    border: 1px solid rgba(245,158,11,0.2);
    border-radius: 6px;
    padding: 0.35rem 0.75rem;
    width: fit-content;
}

.bus-layover {
    color: var(--text-color-secondary);
    background: var(--surface-card);
    border-color: var(--surface-border);
}

/* ── Via Stops ────────────────────────────────────── */
.via-stops {
    font-size: 0.7rem;
    color: var(--text-color-secondary);
    text-align: center;
    margin-top: 0.2rem;
    font-style: italic;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px;
}

/* ── Fare Summary ─────────────────────────────────── */
.fare-summary {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 10px;
    overflow: hidden;
}

.fare-row {
    display: flex;
    justify-content: space-between;
    padding: 0.55rem 1rem;
    font-size: 0.82rem;
    color: var(--text-color-secondary);
    border-bottom: 1px solid var(--surface-border);
}

.fare-row:last-child {
    border-bottom: none;
}

.fare-total {
    font-weight: 800;
    font-size: 0.9rem;
    color: var(--text-color);
    background: rgba(246,203,3,0.06);
}

.fare-meta {
    font-size: 0.75rem;
}

/* ── Responsive ───────────────────────────────────── */
@media (max-width: 900px) {
    .card-main {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    .airline-col {
        flex-direction: row;
        border-right: none;
        border-bottom: 1px solid var(--surface-border);
        padding-bottom: 0.75rem;
        padding-right: 0;
    }
    .tags-col {
        flex-direction: row;
        flex-wrap: wrap;
        border-left: none;
        border-right: none;
        padding: 0;
    }
    .price-col {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding-left: 0;
        border-top: 1px solid var(--surface-border);
        padding-top: 0.75rem;
    }
}
</style>