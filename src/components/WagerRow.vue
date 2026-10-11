<script setup lang="ts">
import Chip from "./Chip.vue"
import Payout, {type PayoutInfo} from "./Payout.vue"

defineProps<{
	selectedParticipant?: {
		pool: number
		id: string
	}
	total: number
}>()

const emit = defineEmits<{
	wagerUpdated: [wager: number]
	payoutInfoUpdated: [payoutInfo: PayoutInfo]
}>()

const wagerInput = ref("")
const wager = computed(() => {
	if (Number.isNaN(parseInt(wagerInput.value))) {
		return 0
	} else {
		return parseInt(wagerInput.value)
	}
})
watch(wager, (value) => {
	if (value >= 100_000_000) {
		wagerInput.value = "Relax."
	}
	emit("wagerUpdated", value)
})

function incrementWager(amount: number) {
	if (amount === -1) {
		goAllIn()
	} else {
		wagerInput.value = (wager.value + amount).toString()
	}
}

function goAllIn() {
	const coinText = document.querySelector("#hbb-pw-coins")?.textContent // "XX,XXX coins"
	if (!coinText) return // Profile widget doesn't exist for some reason

	const coins = coinText.replaceAll(/\D/g, "") // Remove commas and decimals (for europeans)
	wagerInput.value = coins
}
</script>

<template>
	<div class="mt-3 flex items-center gap-2">
		<Chip :amount="10" color0="#5a8bf0" color1="#2a4f9c" @click="incrementWager(10)" />
		<Chip :amount="100" color0="#e05c5c" color1="#8f2323" @click="incrementWager(100)" />
		<Chip :amount="1000" color0="#3fc478" color1="#146834" @click="incrementWager(1000)" />
		<Chip :amount="10000" color0="#ffd35c" color1="#a06a10" @click="incrementWager(10000)" />
		<Chip
			:amount="-1"
			color0="#3a3a3a"
			color1="#0a0a0a"
			@click="incrementWager(-1)"
			style="color: var(--color-amber-300); /* Class gets overridden */"
		/>
		<input
			type="text"
			name="custom-wager"
			v-model="wagerInput"
			placeholder="Wager amount"
			autocomplete="off"
			spellcheck="false"
			class="ml-2 bg-[#06180d] border-amber-300 h-8 border-1 p-2 text-amber-300 rounded-sm w-42"
			style="box-shadow: inset 0 2px 5px white / 0.7"
		/>
		<Payout
			@payout-info-updated="
				(payoutInfo) => {
					emit('payoutInfoUpdated', payoutInfo)
				}
			"
			:wager
			:selected-participant
			:total
		/>
	</div>
</template>
