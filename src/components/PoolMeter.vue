<script setup lang="ts">
import betData, {type Match, type Participant} from "@/modules/betData.ts"
import BetButton from "./BetButton.vue"
import WagerRow from "./WagerRow.vue"

const props = defineProps<{
	match: Match
	selectedParticipant?: Participant
}>()

const METER_COLORS = [
	"#5a8bf0", // Blue
	"#e05c5c", // Red
	"#3fc478", // Green
	"#ffd35c", // Yellow
]

const selectedParticipantIndex = computed(() => {
	const index = props.match.participants.findIndex((participant) => participant.id === props.selectedParticipant?.id)
	if (index === -1) {
		return undefined
	} else {
		return index
	}
})

const pools = computed(() => {
	const pools: number[] = []

	props.match.participants.forEach((participant) => {
		pools.push(participant.pool)
	})

	return pools
})
const total = computed(() => {
	return pools.value.reduce((total, current) => total + current, 0)
})

const placedBet = computed(() => {
	return betData.placedBets.find((bet) => bet.matchId === props.match.id)
})

const wager = ref(0)
const payoutInfo = ref({
	pool: 1,
	total: 2,
	multiplier: 2,
	payout: 0,
	profit: 0,
})

const barOverrides = ref({
	"--would-be-pool": 0,
	"--would-be-total": 0,
})

watchEffect(() => {
	if (!props.selectedParticipant || wager.value <= 0) {
		barOverrides.value = {
			"--would-be-pool": props.selectedParticipant?.pool ?? 1,
			"--would-be-total": total.value,
		}
		return
	}

	const newPool = payoutInfo.value.pool
	if (!newPool || newPool === 1) {
		barOverrides.value = {
			"--would-be-pool": props.selectedParticipant?.pool ?? 1,
			"--would-be-total": total.value,
		}
	} else {
		barOverrides.value = {
			"--would-be-pool": payoutInfo.value.pool,
			"--would-be-total": payoutInfo.value.total,
		}
	}
})
</script>

<template>
	<div class="border-[#3a6b45] border-1 overflow-hidden rounded-sm flex flex-row h-8 text-white" :style="barOverrides">
		<div
			v-for="(participant, i) in match.participants"
			class="pool-bar whitespace-nowrap grow gap-[0.5ch] font-black flex flex-row flex-nowrap items-center text-shadow-[0_1px_2px_black] content-center"
			:class="[
				{
					'pl-2': i === 0,
					'text-left': i === 0,
					'pr-2': i === match.participants.length - 1,
					'text-right': i === match.participants.length - 1,
					'flex-row-reverse': i === match.participants.length - 1,
					// grow: i === participants.length - 1, // Close 1px gap between last element and border
				},
			]"
			:style="{
				'--width': `calc(${participant.pool} / var(--would-be-total, ${total}) * 100%)`,
				// Use max-width with flex basis to prevent long text from increasing bar size
				'min-width': 0, // Allow shrinking
				// 'max-width': 'var(--width)',
				'flex-basis': 'var(--width)',
				'flex-shrink': 1,
				'background-color': ` ${METER_COLORS[i]}`,
				order: i * 10,
			}"
		>
			<span class="z-1">{{ participant.pool.toLocaleString() }}</span>
			<span v-show="selectedParticipant?.id === participant.id && wager > 0" class="text-green-400 z-1">+</span>
			<span v-show="selectedParticipant?.id === participant.id && wager > 0" class="text-green-400 z-1">
				{{ wager.toLocaleString() }}
			</span>
		</div>

		<div
			v-show="wager > 0 && selectedParticipant !== undefined"
			class="border-0 bg-fixed"
			:class="{
				'border-l-0': selectedParticipantIndex !== match.participants.length - 1,
				'border-r-0': selectedParticipantIndex === match.participants.length - 1,
			}"
			style="
				--stripe-width: 5px;
				background: repeating-linear-gradient(
					45deg,
					var(--selected-color),
					var(--selected-color) var(--stripe-width),
					var(--selected-color) var(--stripe-width),
					var(--selected-color) calc(var(--stripe-width) * 2)
				);
			"
			:style="{
				'--selected-color': METER_COLORS[selectedParticipantIndex ?? 0],
				'flex-basis': `calc((var(--would-be-pool, 0) - ${selectedParticipant?.pool ?? 1})/var(--would-be-total, ${total}) * 100%)`,
				order:
					(selectedParticipantIndex === match.participants.length - 1 ? -1 : 1) +
					(selectedParticipantIndex ?? 0) * 10,
				'border-color': METER_COLORS[selectedParticipantIndex ?? 0],
			}"
		>
			<div class="wager-stripes w-full h-full will-change-[opacity,_background-position]"></div>
		</div>

		<div
			class="midpoint-indicator w-[20px] h-min -translate-y-[calc(100%+2px)] left-1/2 -translate-x-1/2 absolute text-center select-none text-[#f0c94a]"
			style="text-box-edge: cap alphabetic; text-box-trim: trim-both"
		>
			▼
		</div>
	</div>

	<WagerRow
		v-if="!placedBet"
		:total
		:selected-participant
		@wager-updated="
			(value) => {
				wager = value
			}
		"
		@payout-info-updated="
			(value) => {
				payoutInfo = value
			}
		"
	/>

	<BetButton :match :wager :selected-participant />
</template>

<style scoped>
@keyframes scroll-stripes {
	0% {
		background-position: 0 0;
	}
	100% {
		background-position: calc(4 * var(--stripe-width, 5px) * sqrt(2)) 0;
	}
}
.wager-stripes {
	background-size: calc(2 * var(--stripe-width) * sqrt(2));
	/* background-size: 200% 200%; */
	background-image: repeating-linear-gradient(
		45deg,
		color-mix(in oklab, var(--color-green-400) 80%, transparent),
		color-mix(in oklab, var(--color-green-400) 80%, transparent) var(--stripe-width),
		var(--selected-color) var(--stripe-width),
		var(--selected-color) calc(var(--stripe-width) * 2)
	);

	@media (prefers-reduced-motion: no-preference) {
		animation:
			scroll-stripes 2s linear infinite,
			var(--animate-pulse) /* pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite */;
	}
}
</style>
