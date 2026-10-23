<script setup lang="ts">
import betData, {type Match, type Participant} from "@/modules/betData.ts"
import BetButton from "./BetButton.vue"
import WagerRow from "./WagerRow.vue"

const props = defineProps<{
	match: Match
	selectedParticipant?: Participant
}>()

const selectedParticipantId = defineModel<string>()

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

const displayWager = computed(() => {
	return placedBet.value?.wager ?? wager.value
})

watchEffect(() => {
	const shouldRender = placedBet.value ? true : props.selectedParticipant && displayWager.value > 0

	if (!shouldRender) {
		console.log("Nothing?", props.selectedParticipant, displayWager.value)
		barOverrides.value = {
			"--would-be-pool": props.selectedParticipant?.pool ?? 1,
			"--would-be-total": total.value,
		}
		return
	}

	let newPool = 0
	if (placedBet.value) {
		const participant = props.match.participants.find((participant) => participant.id === placedBet.value!.participantId)
		newPool = participant!.pool
	} else {
		newPool = payoutInfo.value.pool
	}

	if (!newPool || newPool === 1) {
		console.log("Nothing AGAIN?")
		barOverrides.value = {
			"--would-be-pool": props.selectedParticipant?.pool ?? 1,
			"--would-be-total": total.value,
		}
	} else {
		console.log("SOMETHING?")
		barOverrides.value = {
			"--would-be-pool": newPool,
			"--would-be-total": placedBet.value ? total.value : payoutInfo.value.total,
		}
	}
})

function setMidpointWager() {
	if (props.match.participants.length !== 2) return

	const participant0 = props.match.participants[0]!
	const participant1 = props.match.participants[1]!

	if (participant0.pool === participant1.pool) {
		wager.value = 0
		return
	}

	selectedParticipantId.value = participant0.pool < participant1.pool ? participant0.id : participant1.id
	wager.value = Math.abs(participant0.pool - participant1.pool)
}
</script>

<template>
	<div class="flex h-8 flex-row overflow-hidden rounded-sm border-1 border-[#3a6b45] text-white" :style="barOverrides">
		<div
			v-for="(participant, i) in match.participants"
			class="pool-bar flex grow flex-row flex-nowrap content-center items-center gap-[0.5ch] font-black whitespace-nowrap transition-[flex-basis] will-change-[flex-basis] text-shadow-[0_1px_2px_black]"
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
			<span v-show="selectedParticipant?.id === participant.id && displayWager > 0" class="z-1 text-green-400">+</span>
			<span v-show="selectedParticipant?.id === participant.id && displayWager > 0" class="z-1 text-green-400">
				{{ displayWager.toLocaleString() }}
			</span>
		</div>

		<div
			class="border-0 bg-fixed duration-200 will-change-[flex-basis] motion-safe:transition-[flex-basis]"
			:class="{
				'border-l-0': selectedParticipantIndex !== match.participants.length - 1,
				'border-r-0': selectedParticipantIndex === match.participants.length - 1,
				// 'opacity-0': !(wager > 0 && selectedParticipant !== undefined),
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
				'--selected-color': placedBet
					? METER_COLORS[
							match.participants.findIndex((participant) => participant.id === placedBet!.participantId) ?? 0
						]
					: METER_COLORS[selectedParticipantIndex ?? 0],
				'flex-basis': `calc((var(--would-be-pool, 0) - ${placedBet ? (props.match.participants.find((participant) => participant.id === placedBet!.participantId)?.pool ?? 1) - placedBet.wager : (selectedParticipant?.pool ?? 1)})/var(--would-be-total, ${total}) * 100%)`,
				order:
					(selectedParticipantIndex === match.participants.length - 1 ? -1 : 1) +
					(selectedParticipantIndex ?? 0) * 10,
				'border-color': 'var(--selected-color)',
			}"
		>
			<div class="wager-stripes h-full w-full will-change-[opacity,_background-position]"></div>
		</div>

		<button
			title="Set wager to midpoint"
			@click="setMidpointWager()"
			class="cursor-ball-pointer absolute left-1/2 h-min w-[20px] -translate-x-1/2 -translate-y-[calc(100%+2px)] text-center text-[#f0c94a] select-none hover:text-white"
			style="text-box-edge: cap alphabetic; text-box-trim: trim-both"
		>
			▼
		</button>
	</div>

	<WagerRow
		v-if="!placedBet"
		v-model="wager"
		:total
		:selected-participant
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
