<script setup lang="ts">
import Payout from "./Payout.vue"
import betData, {refreshBetData, type Match, type Participant, type PlacedBet} from "@/modules/betData"

const props = defineProps<{
	match: Match
	wager: number
	selectedParticipant?: Participant
}>()

const placedBet = computed(() => {
	return betData.placedBets.find((bet) => bet.matchId === props.match.id)
})

const placedTotal = computed(() => {
	let total = 0

	props.match.participants.forEach((participant) => {
		total += participant.pool
	})

	return total
})

const matchCard = inject<HTMLElement>("matchCard")!

const requestInProgress = ref(false)
const betError = ref("")

const canBet = computed(() => {
	return props.wager > 0 && props.selectedParticipant !== undefined && !requestInProgress.value
})
const canRetract = computed(() => {
	return !requestInProgress.value
})

async function processBetResponse(betToPlace: PlacedBet) {
	const statusCode = await browser.runtime.sendMessage("await-bet-response")

	if (Math.floor(statusCode / 100) === 2) {
		await nextTick()
		refreshBetData().then(([placedBets]) => {
			if (placedBets.status === "fulfilled" && !placedBets.value.find((bet) => bet.matchId === props.match.id)) {
				betData.placedBets.push({
					wager: props.wager,
					participantId: props.selectedParticipant!.id,
					participantName: props.selectedParticipant!.name,
					matchId: props.match.id,
				})
			}
		})
	} else {
		betError.value = `Error placing bet (status code ${statusCode})`
	}
}

async function processRetractResponse() {
	const statusCode = await browser.runtime.sendMessage("await-retract-response")

	if (Math.floor(statusCode / 100) === 2) {
		await nextTick()
		refreshBetData().then(([placedBets]) => {
			if (placedBets.status === "fulfilled") {
				betData.placedBets = betData.placedBets.filter((placedBet) => {
					return placedBet.matchId !== props.match.id
				})
			}
		})
	} else {
		betError.value = `Error retracting bet (status code ${statusCode})`
	}
}

async function placeBet() {
	const wagerInput = matchCard.querySelector<HTMLInputElement>(".wager-input")
	const placeBetButton = matchCard.querySelector<HTMLButtonElement>(".place-bet-btn")

	if (!wagerInput || !placeBetButton) {
		betError.value = "[HB3T] Unable to find wager input and/or bet button elements"
		return
	}

	// Debounce
	if (placeBetButton.dataset.busy) {
		return
	}

	betError.value = ""

	wagerInput.value = props.wager.toString()
	await nextTick()

	processBetResponse({
		wager: props.wager,
		participantId: props.selectedParticipant!.id,
		participantName: props.selectedParticipant!.name,
		matchId: props.match.id,
	})

	placeBetButton.click()

	// const selectedParticipantId = props.selectedParticipantId // Just in case it changes
	// getPlacedBets().then((placedBets) => {
	// 	placedBet.value = placedBets.find((bet) => {
	// 		bet.participantId === selectedParticipantId
	// 	})!
	// })

	// POST "https://api.hamsballbattles.com/place-bet"
	// amount: number, pick_label: string (e.g. "King Counter"), pick_participant_id: string (e.g. "boss"), scheduled_match_id: string
	// success: boolean, coins: number, bet_id: string
}

function retractBet() {
	const retractBetButton = matchCard.querySelector<HTMLButtonElement>(".place-bet-btn")
	if (!retractBetButton) {
		betError.value = "[HB3T] Unable to find retract button element"
		return
	}

	// Debounce (technically useless)
	if (retractBetButton.disabled) {
		return
	}

	processRetractResponse()

	retractBetButton.click()

	// POST "https://api.hamsballbattles.com/retract-bet"
	// success: boolean, coins: number
}
</script>

<template>
	<div class="mt-2 mb-4 flex items-center justify-between">
		<div v-if="betError !== ''" class="font-bold text-red-500 text-shadow-[0_1px_2px_black]">
			Error placing bet: {{ betError }}
		</div>
		<div v-if="placedBet !== undefined">
			You bet <b class="text-green-400">{{ placedBet.wager.toLocaleString() }} coins</b> on
			<b>{{ placedBet.participantName }}</b>
			<Payout
				:total="placedTotal"
				:wager="placedBet.wager"
				:selected-participant="{
					id: placedBet.participantId,
					pool: match.participants.find((participant) => participant.id === placedBet?.participantId)?.pool ?? 1,
				}"
				:left-align="true"
			/>
		</div>
		<button
			:disabled="placedBet ? !canRetract : !canBet"
			@click="placedBet ? retractBet() : placeBet()"
			class="bet-button cursor-ball-pointer ml-auto px-6 py-3 text-sm text-nowrap uppercase"
			:class="placedBet && 'retract-button'"
		>
			<span v-show="!placedBet">Bet {{ wager.toLocaleString() }} {{ wager === 1 ? "coin" : "coins" }}</span>
			<span v-show="placedBet">Retract bet</span>
		</button>
	</div>
</template>

<style scoped>
/* Lifted from website again sorry */
.retract-button {
	background-image: radial-gradient(circle at 50% 28%, #888 0%, #444 45%, #1a1a1a 100%);
	border-color: #aaa;
}

.bet-button {
	position: relative;
	background-image: radial-gradient(circle at 50% 28%, #7a463b 0%, #4a2620 45%, #241009 100%);
	color: #c9b6a8;
	border: 3px solid #6b5a35;
	border-radius: 999px;
	box-shadow:
		0 5px 0 #2a0d0a,
		0 9px 16px rgba(0, 0, 0, 0.5),
		inset 0 3px 4px rgba(255, 255, 255, 0.15),
		inset 0 -8px 12px rgba(0, 0, 0, 0.4);
	font-family: "Arial Black", "Impact", sans-serif;
	letter-spacing: 1.5px;
	transition:
		transform 0.06s ease,
		box-shadow 0.1s ease,
		filter 0.15s ease,
		background-image 0.3s ease,
		color 0.3s ease,
		border-color 0.3s ease;
}

.bet-button:enabled {
	background-image: radial-gradient(circle at 50% 28%, #ff6a4d 0%, #d43a2c 45%, #7a1a12 100%);
	color: #fff2dd;
	border-color: #f0c94a;
}

.bet-button:enabled:active {
	transform: translateY(4px);
	box-shadow:
		0 1px 0 #2a0d0a,
		inset 0 4px 8px rgba(0, 0, 0, 0.6),
		inset 0 -2px 4px rgba(0, 0, 0, 0.3);
}
</style>
