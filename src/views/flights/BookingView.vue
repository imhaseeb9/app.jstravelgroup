<script setup>
import api from '@/service/api'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// ─── Load selected flight from session ───────────────
const selectedFlight = ref(null)
const itinerary = computed(() => selectedFlight.value?.itinerary || null)
const searchParams = computed(() => selectedFlight.value?.searchParams || {})

onMounted(() => {
    const stored = sessionStorage.getItem('selectedFlight')
    if (!stored) {
        router.push({ name: 'flights.search' })
        return
    }
    selectedFlight.value = JSON.parse(stored)

    // Pre-fill passenger count from search
    const adults   = Number(searchParams.value.adults) || 1
    const children = Number(searchParams.value.children) || 0
    const infants  = Number(searchParams.value.infants) || 0

    passengers.value = [
        ...Array(adults).fill(null).map((_, i) => makePassenger('ADT', i === 0)),
        ...Array(children).fill(null).map(() => makePassenger('CNN')),
        ...Array(infants).fill(null).map(() => makePassenger('INF')),
    ]
})

// ─── Passenger Factory ────────────────────────────────
function makePassenger(type, isPrimary = false) {
    return {
        type,           // ADT | CNN | INF
        isPrimary,
        title: '',
        first_name: '',
        last_name: '',
        dob: '',
        nationality: '',
        passport_number: '',
        passport_expiry: '',
        meal_preference: '',
    }
}

const passengers = ref([])

// ─── Contact Details ─────────────────────────────────
const contact = ref({
    email: '',
    phone: '',
})

// ─── Special Requests ────────────────────────────────
const specialRequests = ref('')

// ─── Loading / Error ──────────────────────────────────
const loading = ref(false)
const errors  = ref({})
const step    = ref(1) // 1 = passenger details, 2 = review

// ─── Options ─────────────────────────────────────────
const titles = ['Mr', 'Mrs', 'Ms', 'Miss', 'Dr', 'Prof']

const mealOptions = [
    { code: '',     label: 'No preference' },
    { code: 'VGML', label: 'Vegetarian' },
    { code: 'KSML', label: 'Kosher' },
    { code: 'HNML', label: 'Hindu Meal' },
    { code: 'MOML', label: 'Muslim Meal' },
    { code: 'GFML', label: 'Gluten Free' },
    { code: 'LCML', label: 'Low Calorie' },
    { code: 'DBML', label: 'Diabetic Meal' },
]

const nationalities = [
    'Pakistani', 'Emirati', 'Saudi', 'British', 'American',
    'Indian', 'Qatari', 'Kuwaiti', 'Bahraini', 'Omani',
    'Afghan', 'Bangladeshi', 'Sri Lankan', 'Nepali', 'Other',
]

// ─── Helpers ─────────────────────────────────────────
function paxTypeLabel(type) {
    return { ADT: 'Adult', CNN: 'Child', INF: 'Infant' }[type] || type
}

function paxTypeClass(type) {
    return { ADT: 'pax-adult', CNN: 'pax-child', INF: 'pax-infant' }[type] || ''
}

function formatPrice(amount) {
    return new Intl.NumberFormat('en-PK', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

function formatTime(dt) {
    return dt ? dt.substring(11, 16) : '--'
}

function formatDuration(minutes) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h}h ${m}m` : `${h}h`
}

const airportCities = {
    KHI: 'Karachi', LHE: 'Lahore', ISB: 'Islamabad', PEW: 'Peshawar',
    MUX: 'Multan', DXB: 'Dubai', AUH: 'Abu Dhabi', DOH: 'Doha',
    LHR: 'London', JED: 'Jeddah', RUH: 'Riyadh',
}
function cityName(code) { return airportCities[code] || code }

const airlineNames = {
    PK: "Pakistan Int'l", EK: 'Emirates', QR: 'Qatar Airways',
    EY: 'Etihad Airways', FZ: 'flydubai',
}
function airlineName(code) { return airlineNames[code] || code }

function airlineLogo(code) {
    return `https://pics.avs.io/50/50/${code}.png`
}

const outbound = computed(() => itinerary.value?.outbound || itinerary.value?.segments || [])
const firstSeg = computed(() => outbound.value[0] || {})
const lastSeg  = computed(() => outbound.value[outbound.value.length - 1] || {})

const cabinLabels = { Y: 'Economy', W: 'Premium Economy', C: 'Business', F: 'First' }
const cabinLabel  = computed(() => cabinLabels[itinerary.value?.cabin_class] || 'Economy')

// ─── Price Breakdown ──────────────────────────────────
const adultCount    = computed(() => passengers.value.filter(p => p.type === 'ADT').length)
const childCount    = computed(() => passengers.value.filter(p => p.type === 'CNN').length)
const infantCount   = computed(() => passengers.value.filter(p => p.type === 'INF').length)

const basePricePerPax    = computed(() => itinerary.value?.total_price || 0)
const totalPassengerCost = computed(() => basePricePerPax.value * (adultCount.value + childCount.value + infantCount.value))

// ─── Validation ───────────────────────────────────────
function validate() {
    errors.value = {}
    let valid = true

    passengers.value.forEach((pax, i) => {
        if (!pax.title) {
            errors.value[`pax_${i}_title`] = 'Required'
            valid = false
        }
        if (!pax.first_name.trim()) {
            errors.value[`pax_${i}_first`] = 'Required'
            valid = false
        }
        if (!pax.last_name.trim()) {
            errors.value[`pax_${i}_last`] = 'Required'
            valid = false
        }
        if (!pax.dob) {
            errors.value[`pax_${i}_dob`] = 'Required'
            valid = false
        }
        if (!pax.nationality) {
            errors.value[`pax_${i}_nat`] = 'Required'
            valid = false
        }
        // Passport required for international
        if (!pax.passport_number.trim()) {
            errors.value[`pax_${i}_pnum`] = 'Required'
            valid = false
        }
        if (!pax.passport_expiry) {
            errors.value[`pax_${i}_pexp`] = 'Required'
            valid = false
        }
    })

    if (!contact.value.email.trim() || !/\S+@\S+\.\S+/.test(contact.value.email)) {
        errors.value.email = 'Valid email required'
        valid = false
    }
    if (!contact.value.phone.trim()) {
        errors.value.phone = 'Phone number required'
        valid = false
    }

    return valid
}

// ─── Go to Review Step ────────────────────────────────
function goToReview() {
    if (!validate()) {
        // Scroll to first error
        const el = document.querySelector('.field-error')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        return
    }
    step.value = 2
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ─── Submit Booking ───────────────────────────────────
async function submitBooking() {
    loading.value = true
    try {
        const payload = {
            itinerary_id:    itinerary.value.id,
            raw_itin:        itinerary.value.raw_itin,
            source:          itinerary.value.source,
            passengers:      passengers.value,
            contact:         contact.value,
            special_requests: specialRequests.value,
            search_params:   searchParams.value,
        }

        const response = await api.post('/flights/book', payload)

        // Store booking result
        sessionStorage.setItem('bookingResult', JSON.stringify(response.data))
        sessionStorage.removeItem('selectedFlight')

        router.push({ name: 'flights.confirmation' })
    } catch (err) {
        errors.value.submit = err.response?.data?.message || 'Booking failed. Please try again.'
        loading.value = false
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }
}

const today = new Date().toISOString().split('T')[0]
</script>

<template>
    <div class="booking-page" v-if="itinerary">

        <!-- Page Header -->
        <div class="page-header">
            <button class="back-btn" @click="router.back()">
                <i class="pi pi-arrow-left"></i> Back to Results
            </button>
            <div class="page-title">
                <h1>Passenger Details</h1>
                <p>Complete your booking for {{ searchParams.origin }} → {{ searchParams.destination }}</p>
            </div>
        </div>

        <!-- Step Indicator -->
        <div class="step-bar">
            <div class="step" :class="{ active: step >= 1, done: step > 1 }">
                <div class="step-circle">
                    <i v-if="step > 1" class="pi pi-check"></i>
                    <span v-else>1</span>
                </div>
                <span class="step-label">Passenger Details</span>
            </div>
            <div class="step-connector" :class="{ filled: step > 1 }"></div>
            <div class="step" :class="{ active: step >= 2 }">
                <div class="step-circle">
                    <span>2</span>
                </div>
                <span class="step-label">Review & Pay</span>
            </div>
        </div>

        <!-- Main Layout -->
        <div class="booking-layout">

            <!-- Left: Form / Review -->
            <div class="booking-form-col">

                <!-- ── STEP 1: Passenger Details ── -->
                <template v-if="step === 1">

                    <!-- Contact Info -->
                    <div class="form-section">
                        <div class="section-header">
                            <i class="pi pi-envelope"></i>
                            <h2>Contact Information</h2>
                            <span class="section-note">Booking confirmation will be sent here</span>
                        </div>
                        <div class="form-grid-2">
                            <div class="form-field" :class="{ 'has-error': errors.email }">
                                <label>Email Address <span class="required">*</span></label>
                                <input
                                    v-model="contact.email"
                                    type="email"
                                    placeholder="your@email.com"
                                    class="form-input"
                                />
                                <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
                            </div>
                            <div class="form-field" :class="{ 'has-error': errors.phone }">
                                <label>Phone Number <span class="required">*</span></label>
                                <input
                                    v-model="contact.phone"
                                    type="tel"
                                    placeholder="+92 300 0000000"
                                    class="form-input"
                                />
                                <span v-if="errors.phone" class="field-error">{{ errors.phone }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Passengers -->
                    <div
                        v-for="(pax, index) in passengers"
                        :key="index"
                        class="form-section"
                    >
                        <div class="section-header">
                            <i class="pi pi-user"></i>
                            <h2>
                                Passenger {{ index + 1 }}
                                <span class="pax-type-badge" :class="paxTypeClass(pax.type)">
                                    {{ paxTypeLabel(pax.type) }}
                                </span>
                                <span v-if="pax.isPrimary" class="primary-badge">Primary</span>
                            </h2>
                        </div>

                        <!-- Name Row -->
                        <div class="form-grid-3">
                            <div class="form-field" :class="{ 'has-error': errors[`pax_${index}_title`] }">
                                <label>Title <span class="required">*</span></label>
                                <select v-model="pax.title" class="form-input">
                                    <option value="">Select</option>
                                    <option v-for="t in titles" :key="t" :value="t">{{ t }}</option>
                                </select>
                                <span v-if="errors[`pax_${index}_title`]" class="field-error">{{ errors[`pax_${index}_title`] }}</span>
                            </div>
                            <div class="form-field" :class="{ 'has-error': errors[`pax_${index}_first`] }">
                                <label>First Name <span class="required">*</span></label>
                                <input
                                    v-model="pax.first_name"
                                    type="text"
                                    placeholder="As on passport"
                                    class="form-input"
                                />
                                <span v-if="errors[`pax_${index}_first`]" class="field-error">{{ errors[`pax_${index}_first`] }}</span>
                            </div>
                            <div class="form-field" :class="{ 'has-error': errors[`pax_${index}_last`] }">
                                <label>Last Name <span class="required">*</span></label>
                                <input
                                    v-model="pax.last_name"
                                    type="text"
                                    placeholder="As on passport"
                                    class="form-input"
                                />
                                <span v-if="errors[`pax_${index}_last`]" class="field-error">{{ errors[`pax_${index}_last`] }}</span>
                            </div>
                        </div>

                        <!-- DOB + Nationality -->
                        <div class="form-grid-2">
                            <div class="form-field" :class="{ 'has-error': errors[`pax_${index}_dob`] }">
                                <label>Date of Birth <span class="required">*</span></label>
                                <input
                                    v-model="pax.dob"
                                    type="date"
                                    class="form-input"
                                    :max="today"
                                />
                                <span v-if="errors[`pax_${index}_dob`]" class="field-error">{{ errors[`pax_${index}_dob`] }}</span>
                            </div>
                            <div class="form-field" :class="{ 'has-error': errors[`pax_${index}_nat`] }">
                                <label>Nationality <span class="required">*</span></label>
                                <select v-model="pax.nationality" class="form-input">
                                    <option value="">Select nationality</option>
                                    <option v-for="n in nationalities" :key="n" :value="n">{{ n }}</option>
                                </select>
                                <span v-if="errors[`pax_${index}_nat`]" class="field-error">{{ errors[`pax_${index}_nat`] }}</span>
                            </div>
                        </div>

                        <!-- Passport -->
                        <div class="form-grid-2">
                            <div class="form-field" :class="{ 'has-error': errors[`pax_${index}_pnum`] }">
                                <label>Passport Number <span class="required">*</span></label>
                                <input
                                    v-model="pax.passport_number"
                                    type="text"
                                    placeholder="AB1234567"
                                    class="form-input passport-input"
                                    style="text-transform: uppercase;"
                                />
                                <span v-if="errors[`pax_${index}_pnum`]" class="field-error">{{ errors[`pax_${index}_pnum`] }}</span>
                            </div>
                            <div class="form-field" :class="{ 'has-error': errors[`pax_${index}_pexp`] }">
                                <label>Passport Expiry <span class="required">*</span></label>
                                <input
                                    v-model="pax.passport_expiry"
                                    type="date"
                                    class="form-input"
                                    :min="today"
                                />
                                <span v-if="errors[`pax_${index}_pexp`]" class="field-error">{{ errors[`pax_${index}_pexp`] }}</span>
                            </div>
                        </div>

                        <!-- Meal Preference -->
                        <div class="form-grid-2">
                            <div class="form-field">
                                <label>Meal Preference</label>
                                <select v-model="pax.meal_preference" class="form-input">
                                    <option v-for="m in mealOptions" :key="m.code" :value="m.code">
                                        {{ m.label }}
                                    </option>
                                </select>
                            </div>
                        </div>

                    </div>

                    <!-- Special Requests -->
                    <div class="form-section">
                        <div class="section-header">
                            <i class="pi pi-comment"></i>
                            <h2>Special Requests</h2>
                            <span class="section-note">Optional — not guaranteed</span>
                        </div>
                        <div class="form-field">
                            <textarea
                                v-model="specialRequests"
                                class="form-input"
                                rows="3"
                                placeholder="Wheelchair assistance, special seating, etc."
                            ></textarea>
                        </div>
                    </div>

                    <!-- Continue Button -->
                    <div class="form-action">
                        <button class="continue-btn" @click="goToReview">
                            Continue to Review
                            <i class="pi pi-arrow-right"></i>
                        </button>
                    </div>

                </template>

                <!-- ── STEP 2: Review ── -->
                <template v-else>

                    <div class="form-section review-section">
                        <div class="section-header">
                            <i class="pi pi-eye"></i>
                            <h2>Review Your Booking</h2>
                        </div>

                        <!-- Passenger Summary -->
                        <div class="review-passengers">
                            <div class="review-sub-title">Passengers</div>
                            <div
                                v-for="(pax, i) in passengers"
                                :key="i"
                                class="review-pax-row"
                            >
                                <span class="pax-type-badge" :class="paxTypeClass(pax.type)">{{ paxTypeLabel(pax.type) }}</span>
                                <span class="pax-name">{{ pax.title }} {{ pax.first_name }} {{ pax.last_name }}</span>
                                <span class="pax-passport">{{ pax.passport_number }}</span>
                                <span v-if="pax.meal_preference" class="pax-meal">{{ mealOptions.find(m => m.code === pax.meal_preference)?.label }}</span>
                            </div>
                        </div>

                        <!-- Contact Summary -->
                        <div class="review-contact">
                            <div class="review-sub-title">Contact</div>
                            <div class="review-contact-row">
                                <span><i class="pi pi-envelope"></i> {{ contact.email }}</span>
                                <span><i class="pi pi-phone"></i> {{ contact.phone }}</span>
                            </div>
                        </div>

                        <button class="edit-link" @click="step = 1">
                            <i class="pi pi-pencil"></i> Edit details
                        </button>
                    </div>

                    <!-- Terms Notice -->
                    <div class="terms-notice">
                        <i class="pi pi-info-circle"></i>
                        <p>
                            By clicking "Confirm Booking", you agree to the fare rules and conditions.
                            <span v-if="!itinerary.is_refundable" class="non-refund-warn">
                                This fare is <strong>non-refundable</strong>.
                            </span>
                            Your credit balance will be deducted upon confirmation.
                        </p>
                    </div>

                    <!-- Submit Error -->
                    <div v-if="errors.submit" class="submit-error">
                        <i class="pi pi-exclamation-triangle"></i>
                        {{ errors.submit }}
                    </div>

                    <!-- Action Buttons -->
                    <div class="form-action review-actions">
                        <button class="back-step-btn" @click="step = 1" :disabled="loading">
                            <i class="pi pi-arrow-left"></i> Back
                        </button>
                        <button
                            class="confirm-btn"
                            @click="submitBooking"
                            :disabled="loading"
                        >
                            <i class="pi" :class="loading ? 'pi-spin pi-spinner' : 'pi-check'"></i>
                            {{ loading ? 'Processing...' : 'Confirm Booking' }}
                        </button>
                    </div>

                </template>

            </div>

            <!-- Right: Booking Summary Sidebar -->
            <aside class="booking-summary">

                <!-- Flight Summary Card -->
                <div class="summary-card">
                    <div class="summary-card-header">
                        <img
                            :src="airlineLogo(itinerary.validating_carrier)"
                            :alt="itinerary.validating_carrier"
                            class="summary-airline-logo"
                            @error="e => e.target.style.display='none'"
                        />
                        <div>
                            <div class="summary-airline-name">{{ airlineName(itinerary.validating_carrier) }}</div>
                            <div class="summary-cabin">{{ cabinLabel }}</div>
                        </div>
                    </div>

                    <!-- Route -->
                    <div class="summary-route">
                        <div class="sum-time-block">
                            <div class="sum-time">{{ formatTime(firstSeg.departure_datetime) }}</div>
                            <div class="sum-airport">{{ firstSeg.departure_airport }}</div>
                            <div class="sum-city">{{ cityName(firstSeg.departure_airport) }}</div>
                        </div>
                        <div class="sum-mid">
                            <div class="sum-duration">{{ formatDuration(itinerary.total_duration) }}</div>
                            <div class="sum-bar">
                                <div class="sum-line"></div>
                                <i class="pi pi-send sum-plane-icon"></i>
                            </div>
                            <div class="sum-stops">
                                {{ itinerary.stops === 0 ? 'Direct' : `${itinerary.stops} Stop${itinerary.stops > 1 ? 's' : ''}` }}
                            </div>
                        </div>
                        <div class="sum-time-block">
                            <div class="sum-time">{{ formatTime(lastSeg.arrival_datetime) }}</div>
                            <div class="sum-airport">{{ lastSeg.arrival_airport }}</div>
                            <div class="sum-city">{{ cityName(lastSeg.arrival_airport) }}</div>
                        </div>
                    </div>

                    <!-- Fare Tags -->
                    <div class="summary-tags">
                        <span v-if="itinerary.baggage_weight > 0" class="sum-tag">
                            <i class="pi pi-briefcase"></i> {{ itinerary.baggage_weight }} kg
                        </span>
                        <span v-else class="sum-tag sum-tag-warn">
                            <i class="pi pi-briefcase"></i> No baggage
                        </span>
                        <span class="sum-tag" :class="itinerary.is_refundable ? 'sum-tag-ok' : 'sum-tag-warn'">
                            <i class="pi" :class="itinerary.is_refundable ? 'pi-check-circle' : 'pi-times-circle'"></i>
                            {{ itinerary.is_refundable ? 'Refundable' : 'Non-Refundable' }}
                        </span>
                        <span class="sum-tag">
                            <i class="pi pi-calendar"></i> Last ticket: {{ itinerary.last_ticket_date }}
                        </span>
                    </div>
                </div>

                <!-- Price Breakdown Card -->
                <div class="summary-card price-card">
                    <div class="price-card-title">Price Breakdown</div>

                    <div class="price-line" v-if="adultCount > 0">
                        <span>Adult × {{ adultCount }}</span>
                        <span>{{ itinerary.currency }} {{ formatPrice(itinerary.total_price * adultCount) }}</span>
                    </div>
                    <div class="price-line" v-if="childCount > 0">
                        <span>Child × {{ childCount }}</span>
                        <span>{{ itinerary.currency }} {{ formatPrice(itinerary.total_price * childCount) }}</span>
                    </div>
                    <div class="price-line" v-if="infantCount > 0">
                        <span>Infant × {{ infantCount }}</span>
                        <span>{{ itinerary.currency }} {{ formatPrice(itinerary.total_price * infantCount) }}</span>
                    </div>

                    <div class="price-divider"></div>

                    <div class="price-line price-total">
                        <span>Total</span>
                        <span>{{ itinerary.currency }} {{ formatPrice(totalPassengerCost) }}</span>
                    </div>

                    <div class="price-note">
                        <i class="pi pi-shield"></i>
                        Amount will be deducted from your credit balance
                    </div>
                </div>

            </aside>

        </div>
    </div>

    <!-- No flight selected -->
    <div v-else class="no-flight">
        <i class="pi pi-exclamation-circle"></i>
        <p>No flight selected. Redirecting...</p>
    </div>
</template>

<style scoped>
/* ── Page ─────────────────────────────────────────── */
.booking-page {
    min-height: 100%;
    background: var(--surface-ground);
    padding-bottom: 2rem;
}

/* ── Header ───────────────────────────────────────── */
.page-header {
    padding: 1.25rem 1.5rem 0;
    display: flex;
    align-items: flex-start;
    gap: 1rem;
}

.back-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: none;
    border: 1px solid var(--surface-border);
    border-radius: 8px;
    padding: 0.5rem 0.875rem;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-color-secondary);
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    margin-top: 0.25rem;
}

.back-btn:hover {
    border-color: #f6cb03;
    color: #f6cb03;
}

.page-title h1 {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--text-color);
    margin: 0 0 0.25rem;
    letter-spacing: -0.02em;
}

.page-title p {
    font-size: 0.875rem;
    color: var(--text-color-secondary);
    margin: 0;
}

/* ── Step Bar ─────────────────────────────────────── */
.step-bar {
    display: flex;
    align-items: center;
    padding: 1.25rem 1.5rem;
    gap: 0;
    max-width: 400px;
}

.step {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.step-circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid var(--surface-border);
    background: var(--surface-card);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--text-color-secondary);
    transition: all 0.3s;
    flex-shrink: 0;
}

.step.active .step-circle {
    border-color: #f6cb03;
    background: #f6cb03;
    color: #1a1a2e;
}

.step.done .step-circle {
    border-color: #22c55e;
    background: #22c55e;
    color: white;
}

.step-label {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-color-secondary);
    white-space: nowrap;
}

.step.active .step-label {
    color: var(--text-color);
}

.step-connector {
    flex: 1;
    height: 2px;
    background: var(--surface-border);
    margin: 0 0.75rem;
    transition: background 0.3s;
    min-width: 40px;
}

.step-connector.filled {
    background: #22c55e;
}

/* ── Layout ───────────────────────────────────────── */
.booking-layout {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 1.25rem;
    padding: 0 1.5rem;
    align-items: start;
}

/* ── Form Sections ────────────────────────────────── */
.booking-form-col {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-section {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 12px;
    padding: 1.25rem;
}

.section-header {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
}

.section-header i {
    color: #f6cb03;
    font-size: 1rem;
}

.section-header h2 {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-color);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.section-note {
    font-size: 0.75rem;
    color: var(--text-color-secondary);
    margin-left: auto;
}

/* ── Form Grids ───────────────────────────────────── */
.form-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.875rem;
    margin-bottom: 0.875rem;
}

.form-grid-3 {
    display: grid;
    grid-template-columns: 120px 1fr 1fr;
    gap: 0.875rem;
    margin-bottom: 0.875rem;
}

/* ── Form Fields ──────────────────────────────────── */
.form-field {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
}

.form-field label {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--text-color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.required {
    color: #ef4444;
}

.form-input {
    padding: 0.65rem 0.875rem;
    border: 1px solid var(--surface-border);
    border-radius: 8px;
    background: var(--surface-ground);
    color: var(--text-color);
    font-size: 0.875rem;
    transition: all 0.2s;
    width: 100%;
    box-sizing: border-box;
}

.form-input:focus {
    outline: none;
    border-color: #f6cb03;
    background: var(--surface-card);
    box-shadow: 0 0 0 3px rgba(246,203,3,0.12);
}

.form-field.has-error .form-input {
    border-color: #ef4444;
}

.field-error {
    font-size: 0.72rem;
    color: #ef4444;
    font-weight: 600;
}

textarea.form-input {
    resize: vertical;
    min-height: 80px;
}

/* ── Pax Type Badges ──────────────────────────────── */
.pax-type-badge {
    font-size: 0.68rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}
.pax-adult  { background: rgba(99,102,241,0.1); color: #6366f1; }
.pax-child  { background: rgba(34,197,94,0.1); color: #22c55e; }
.pax-infant { background: rgba(245,158,11,0.1); color: #f59e0b; }

.primary-badge {
    font-size: 0.68rem;
    font-weight: 600;
    color: #f6cb03;
    background: rgba(246,203,3,0.1);
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
}

/* ── Review Section ───────────────────────────────── */
.review-sub-title {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 0.6rem;
}

.review-passengers {
    margin-bottom: 1rem;
}

.review-pax-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--surface-border);
    flex-wrap: wrap;
    font-size: 0.875rem;
}

.review-pax-row:last-child {
    border-bottom: none;
}

.pax-name {
    font-weight: 600;
    color: var(--text-color);
}

.pax-passport {
    font-family: monospace;
    font-size: 0.82rem;
    color: var(--text-color-secondary);
    background: var(--surface-ground);
    padding: 0.1rem 0.4rem;
    border-radius: 4px;
}

.pax-meal {
    font-size: 0.78rem;
    color: #22c55e;
    background: rgba(34,197,94,0.1);
    padding: 0.1rem 0.4rem;
    border-radius: 4px;
}

.review-contact {
    margin-bottom: 1rem;
}

.review-contact-row {
    display: flex;
    gap: 1.5rem;
    font-size: 0.875rem;
    color: var(--text-color);
    flex-wrap: wrap;
}

.review-contact-row i {
    color: var(--text-color-secondary);
    margin-right: 0.25rem;
}

.edit-link {
    background: none;
    border: none;
    color: #f6cb03;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0;
}

/* ── Terms / Error ────────────────────────────────── */
.terms-notice {
    background: rgba(59,130,246,0.06);
    border: 1px solid rgba(59,130,246,0.2);
    border-radius: 10px;
    padding: 0.875rem 1rem;
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
}

.terms-notice i {
    color: #3b82f6;
    margin-top: 2px;
    flex-shrink: 0;
}

.terms-notice p {
    font-size: 0.82rem;
    color: var(--text-color-secondary);
    margin: 0;
    line-height: 1.6;
}

.non-refund-warn {
    color: #ef4444;
}

.submit-error {
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.2);
    border-radius: 10px;
    padding: 0.875rem 1rem;
    display: flex;
    gap: 0.75rem;
    align-items: center;
    font-size: 0.875rem;
    color: #ef4444;
}

/* ── Action Buttons ───────────────────────────────── */
.form-action {
    display: flex;
    justify-content: flex-end;
}

.review-actions {
    gap: 0.75rem;
    justify-content: space-between;
}

.continue-btn,
.confirm-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 2rem;
    background: #f6cb03;
    color: #1a1a2e;
    border: none;
    border-radius: 10px;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
}

.continue-btn:hover,
.confirm-btn:hover:not(:disabled) {
    background: #e6bc00;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(246,203,3,0.3);
}

.confirm-btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    transform: none;
}

.back-step-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.5rem;
    background: var(--surface-ground);
    color: var(--text-color);
    border: 1px solid var(--surface-border);
    border-radius: 10px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.back-step-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Summary Sidebar ──────────────────────────────── */
.booking-summary {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    position: sticky;
    top: 1rem;
}

.summary-card {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 12px;
    padding: 1.1rem;
}

.summary-card-header {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    margin-bottom: 1rem;
    padding-bottom: 0.875rem;
    border-bottom: 1px solid var(--surface-border);
}

.summary-airline-logo {
    width: 44px;
    height: 44px;
    object-fit: contain;
    border-radius: 8px;
    background: var(--surface-ground);
}

.summary-airline-name {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--text-color);
}

.summary-cabin {
    font-size: 0.75rem;
    color: var(--text-color-secondary);
    margin-top: 0.1rem;
}

/* ── Summary Route ────────────────────────────────── */
.summary-route {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
}

.sum-time-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
}

.sum-time {
    font-size: 1.4rem;
    font-weight: 800;
    color: var(--text-color);
    line-height: 1;
    letter-spacing: -0.02em;
}

.sum-airport {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-color);
    font-family: monospace;
}

.sum-city {
    font-size: 0.7rem;
    color: var(--text-color-secondary);
}

.sum-mid {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0 0.75rem;
}

.sum-duration {
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--text-color-secondary);
}

.sum-bar {
    width: 100%;
    position: relative;
    height: 14px;
    display: flex;
    align-items: center;
}

.sum-line {
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--surface-border);
}

.sum-plane-icon {
    position: relative;
    z-index: 1;
    font-size: 0.65rem;
    color: #f6cb03;
    margin: 0 auto;
}

.sum-stops {
    font-size: 0.68rem;
    font-weight: 600;
    color: var(--text-color-secondary);
}

/* ── Summary Tags ─────────────────────────────────── */
.summary-tags {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding-top: 0.875rem;
    border-top: 1px solid var(--surface-border);
}

.sum-tag {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--text-color-secondary);
}

.sum-tag i { font-size: 0.75rem; }
.sum-tag-ok   { color: #22c55e; }
.sum-tag-warn { color: #ef4444; }

/* ── Price Card ───────────────────────────────────── */
.price-card-title {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 0.875rem;
}

.price-line {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    color: var(--text-color-secondary);
    padding: 0.35rem 0;
}

.price-divider {
    height: 1px;
    background: var(--surface-border);
    margin: 0.5rem 0;
}

.price-total {
    font-size: 1rem;
    font-weight: 800;
    color: var(--text-color);
}

.price-note {
    margin-top: 0.875rem;
    padding-top: 0.875rem;
    border-top: 1px solid var(--surface-border);
    display: flex;
    gap: 0.4rem;
    align-items: flex-start;
    font-size: 0.75rem;
    color: var(--text-color-secondary);
    line-height: 1.5;
}

.price-note i {
    color: #f6cb03;
    margin-top: 1px;
    flex-shrink: 0;
}

/* ── No Flight ────────────────────────────────────── */
.no-flight {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    gap: 1rem;
    color: var(--text-color-secondary);
}

.no-flight .pi { font-size: 2rem; }

/* ── Responsive ───────────────────────────────────── */
@media (max-width: 900px) {
    .booking-layout {
        grid-template-columns: 1fr;
        padding: 0 1rem;
    }
    .booking-summary {
        position: static;
        order: -1;
    }
    .form-grid-2,
    .form-grid-3 {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 600px) {
    .page-header {
        flex-direction: column;
        padding: 1rem;
    }
    .step-bar {
        padding: 1rem;
    }
    .booking-layout {
        padding: 0 0.75rem;
    }
}
</style>