<script setup lang="ts">
import Chip from "./Chip.vue"
import Payout, {type PayoutInfo} from "./Payout.vue"
import useStoredValue from "@/modules/composables/useStoredValue.ts"

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

const useLargerChipValues = useStoredValue("local:setting-larger-chip-values", true)
const chipValues = computed(() => {
	if (useLargerChipValues.isLoading.value || useLargerChipValues.state.value) {
		return [10, 100, 1000, 10000]
	} else {
		return [10, 50, 100, 500]
	}
})

const chipColors = [
	["#5a8bf0", "#2a4f9c"],
	["#e05c5c", "#8f2323"],
	["#3fc478", "#146834"],
	["#ffd35c", "#a06a10"],
]

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

const chipsOverrideValues = useStoredValue("local:setting-chip-override", false)
function incrementWager(amount: number) {
	if (amount === -1) {
		goAllIn()
		return
	}

	if (chipsOverrideValues.isLoading.value || !chipsOverrideValues.state.value) {
		// Default behavior: Add chip value to wager
		wagerInput.value = (wager.value + amount).toString()
	} else {
		// Otherwise: Chip value overrides wager (like it does on the normal website)
		wagerInput.value = amount.toString()
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
		<Chip v-for="(value, i) in chipValues" :amount="value" :color0="chipColors[i]![0]!" :color1="chipColors[i]![1]!" />
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
			class="ml-1 h-8 w-42 rounded-sm border-1 border-amber-300 bg-[#06180d] p-2 text-amber-300"
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
