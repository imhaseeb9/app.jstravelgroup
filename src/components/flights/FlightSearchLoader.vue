<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
    origin: { type: String, default: 'KHI' },
    destination: { type: String, default: 'LHE' },
    date: { type: String, default: '' },
    passengers: { type: Number, default: 1 },
})

// ─── Rotating search status messages ─────────────────
const messages = [
    'Connecting to Sabre GDS...',
    'Searching available flights...',
    'Checking fare availability...',
    'Comparing prices across airlines...',
    'Fetching baggage allowances...',
    'Calculating best fares...',
    'Almost there...',
]

const currentMessageIndex = ref(0)
const currentMessage = computed(() => messages[currentMessageIndex.value])
let messageInterval = null

onMounted(() => {
    messageInterval = setInterval(() => {
        currentMessageIndex.value = (currentMessageIndex.value + 1) % messages.length
    }, 1800)
})

onUnmounted(() => {
    clearInterval(messageInterval)
})

// ─── Format date nicely ───────────────────────────────
const formattedDate = computed(() => {
    if (!props.date) return ''
    const d = new Date(props.date)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
})
</script>

<template>
    <div class="loader-overlay">

        <!-- Background animated dots -->
        <div class="bg-dots">
            <div v-for="n in 20" :key="n" class="bg-dot" :style="{
                '--x': Math.random() * 100 + '%',
                '--y': Math.random() * 100 + '%',
                '--delay': (Math.random() * 3) + 's',
                '--size': (Math.random() * 4 + 2) + 'px',
                '--duration': (Math.random() * 3 + 2) + 's',
            }"></div>
        </div>

        <div class="loader-card">

            <!-- Route Display -->
            <div class="route-display">
                <div class="route-airport">
                    <div class="airport-code">{{ origin }}</div>
                    <div class="airport-label">Departure</div>
                </div>

                <!-- Flight Animation -->
                <div class="flight-track">
                    <div class="track-line"></div>
                    <div class="track-dots">
                        <div class="track-dot"></div>
                        <div class="track-dot"></div>
                        <div class="track-dot"></div>
                    </div>
                    <div class="plane-wrapper">
                        <svg class="plane-svg" viewBox="0 0 80 24" fill="none">
                            <path d="M4 12 L20 4 L72 12 L20 20 Z" fill="#f6cb03"/>
                            <path d="M28 12 L44 6 L44 18 Z" fill="#e6bc00"/>
                            <path d="M20 8 L28 4 L28 8 Z" fill="#f6cb03" opacity="0.7"/>
                            <path d="M20 16 L28 20 L28 16 Z" fill="#f6cb03" opacity="0.7"/>
                        </svg>
                    </div>
                    <!-- Contrail -->
                    <div class="contrail"></div>
                </div>

                <div class="route-airport">
                    <div class="airport-code">{{ destination }}</div>
                    <div class="airport-label">Arrival</div>
                </div>
            </div>

            <!-- Search Details -->
            <div class="search-meta">
                <span v-if="formattedDate" class="meta-item">
                    <i class="pi pi-calendar"></i>
                    {{ formattedDate }}
                </span>
                <span class="meta-item">
                    <i class="pi pi-users"></i>
                    {{ passengers }} Passenger{{ passengers > 1 ? 's' : '' }}
                </span>
            </div>

            <!-- Progress Bar -->
            <div class="progress-wrap">
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
            </div>

            <!-- Status Message -->
            <Transition name="msg-fade" mode="out-in">
                <div class="status-message" :key="currentMessage">
                    <span class="status-dot"></span>
                    {{ currentMessage }}
                </div>
            </Transition>

            <!-- Airline Logos Strip -->
            <div class="airlines-strip">
                <div class="airlines-label">Searching across</div>
                <div class="airlines-logos">
                    <div
                        v-for="(code, i) in ['PK', 'EK', 'QR', 'EY', 'FZ', 'TK']"
                        :key="code"
                        class="airline-chip"
                        :style="{ '--delay': (i * 0.15) + 's' }"
                    >
                        <img
                            :src="`https://pics.avs.io/40/40/${code}.png`"
                            :alt="code"
                            @error="e => e.target.style.display='none'"
                        />
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<style scoped>
/* ── Overlay ──────────────────────────────────────── */
.loader-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: overlayIn 0.3s ease;
}

@keyframes overlayIn {
    from { opacity: 0; }
    to   { opacity: 1; }
}

/* ── Background Dots ──────────────────────────────── */
.bg-dots {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
}

.bg-dot {
    position: absolute;
    left: var(--x);
    top: var(--y);
    width: var(--size);
    height: var(--size);
    border-radius: 50%;
    background: rgba(246, 203, 3, 0.3);
    animation: dotPulse var(--duration) var(--delay) infinite ease-in-out;
}

@keyframes dotPulse {
    0%, 100% { opacity: 0.1; transform: scale(1); }
    50%       { opacity: 0.6; transform: scale(1.8); }
}

/* ── Card ─────────────────────────────────────────── */
.loader-card {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 24px;
    padding: 2.5rem 3rem;
    width: 100%;
    max-width: 560px;
    box-shadow:
        0 0 0 1px rgba(246,203,3,0.05),
        0 25px 80px rgba(0,0,0,0.35),
        0 0 60px rgba(246,203,3,0.04) inset;
    animation: cardIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
}

@keyframes cardIn {
    from { opacity: 0; transform: translateY(20px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* ── Route Display ────────────────────────────────── */
.route-display {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
}

.route-airport {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    min-width: 70px;
}

.airport-code {
    font-size: 2.2rem;
    font-weight: 900;
    color: var(--text-color);
    letter-spacing: -0.02em;
    line-height: 1;
    font-family: 'Courier New', monospace;
}

.airport-label {
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--text-color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.08em;
}

/* ── Flight Track ─────────────────────────────────── */
.flight-track {
    flex: 1;
    position: relative;
    height: 48px;
    display: flex;
    align-items: center;
    margin: 0 1.5rem;
}

.track-line {
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg,
        rgba(246,203,3,0.1) 0%,
        rgba(246,203,3,0.5) 50%,
        rgba(246,203,3,0.1) 100%
    );
}

.track-dots {
    position: absolute;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
}

.track-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(246,203,3,0.4);
    animation: trackDotPulse 1.5s infinite ease-in-out;
}

.track-dot:nth-child(1) { animation-delay: 0s; }
.track-dot:nth-child(2) { animation-delay: 0.5s; }
.track-dot:nth-child(3) { animation-delay: 1s; }

@keyframes trackDotPulse {
    0%, 100% { opacity: 0.2; transform: scale(1); }
    50%       { opacity: 1; transform: scale(1.5); }
}

/* ── Plane Animation ──────────────────────────────── */
.plane-wrapper {
    position: absolute;
    left: -8%;
    animation: planeTravel 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    z-index: 2;
}

.plane-svg {
    width: 56px;
    height: 17px;
    filter: drop-shadow(0 0 8px rgba(246,203,3,0.6));
}

@keyframes planeTravel {
    0%   { left: -8%; opacity: 0; }
    8%   { opacity: 1; }
    88%  { opacity: 1; }
    100% { left: 102%; opacity: 0; }
}

/* ── Contrail ─────────────────────────────────────── */
.contrail {
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg,
        transparent 0%,
        rgba(246,203,3,0.08) 20%,
        rgba(246,203,3,0.2) 60%,
        transparent 100%
    );
    animation: contrailPulse 3s ease-in-out infinite;
}

@keyframes contrailPulse {
    0%, 100% { opacity: 0.3; }
    50%       { opacity: 0.8; }
}

/* ── Search Meta ──────────────────────────────────── */
.search-meta {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin-bottom: 1.75rem;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    color: var(--text-color-secondary);
    font-weight: 500;
}

.meta-item i {
    color: rgba(246,203,3,0.6);
    font-size: 0.75rem;
}

/* ── Progress Bar ─────────────────────────────────── */
.progress-wrap {
    margin-bottom: 1.25rem;
}

.progress-bar {
    width: 100%;
    height: 3px;
    background: var(--surface-ground);
    border-radius: 100px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    border-radius: 100px;
    background: linear-gradient(90deg, #f6cb03, #e6bc00, #f6cb03);
    background-size: 200% 100%;
    animation: progressSlide 2s ease-in-out infinite, shimmer 1.5s linear infinite;
    width: 40%;
}

@keyframes progressSlide {
    0%   { transform: translateX(-100%); width: 40%; }
    50%  { width: 60%; }
    100% { transform: translateX(350%); width: 40%; }
}

@keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}

/* ── Status Message ───────────────────────────────── */
.status-message {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 0.82rem;
    color: var(--text-color-secondary);
    font-weight: 500;
    margin-bottom: 1.75rem;
    letter-spacing: 0.01em;
    min-height: 20px;
}

.status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #f6cb03;
    animation: statusBlink 1.2s infinite ease-in-out;
    flex-shrink: 0;
}

@keyframes statusBlink {
    0%, 100% { opacity: 0.4; transform: scale(0.8); }
    50%       { opacity: 1; transform: scale(1.2); }
}

/* ── Message Transition ───────────────────────────── */
.msg-fade-enter-active,
.msg-fade-leave-active {
    transition: all 0.4s ease;
}

.msg-fade-enter-from {
    opacity: 0;
    transform: translateY(6px);
}

.msg-fade-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}

/* ── Airlines Strip ───────────────────────────────── */
.airlines-strip {
    border-top: 1px solid var(--surface-border);
    padding-top: 1.25rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
}

.airlines-label {
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--text-color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
}

.airlines-logos {
    display: flex;
    gap: 0.6rem;
    align-items: center;
}

.airline-chip {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: var(--surface-ground);
    border: 1px solid var(--surface-border);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    animation: chipIn 0.4s var(--delay) both ease-out;
    transition: all 0.2s;
}

.airline-chip:hover {
    background: rgba(246,203,3,0.1);
    border-color: rgba(246,203,3,0.3);
}

.airline-chip img {
    width: 28px;
    height: 28px;
    object-fit: contain;
}

@keyframes chipIn {
    from { opacity: 0; transform: translateY(8px) scale(0.9); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* ── Responsive ───────────────────────────────────── */
@media (max-width: 600px) {
    .loader-card {
        padding: 2rem 1.5rem;
        margin: 1rem;
    }
    .airport-code {
        font-size: 1.75rem;
    }
}
</style>