<script setup lang="ts">
const props = defineProps<{
	selectedParticipant?: {
		pool: number
		id: string
	}
	wager: number
	total: number
	leftAlign?: boolean
}>()

export type PayoutInfo = {
	// Values after wager is factored in (for selectedParticipant specifically)
	pool: number
	total: number
	multiplier: number
	payout: number
	profit: number
}

// New pool for selectedParticipant
const newPool = computed(() => (props.selectedParticipant?.pool ?? 0) + props.wager)
const newTotal = computed(() => props.total + props.wager)
const newMultiplier = computed(() => {
	return newTotal.value / newPool.value
})
const newPayout = computed(() => {
	return Math.round(props.wager * newMultiplier.value)
})
const profit = computed(() => {
	return newPayout.value - props.wager
})

const emit = defineEmits<{
	payoutInfoUpdated: [payoutInfo: PayoutInfo]
}>()

watch(profit, (newProfit) => {
	emit("payoutInfoUpdated", {
		pool: newPool.value,
		total: newTotal.value,
		multiplier: newMultiplier.value,
		payout: newPayout.value,
		profit: newProfit,
	})
})
</script>

<template>
	<table v-show="selectedParticipant !== undefined" class="min-h-18" :class="leftAlign ? 'ml-0' : 'ml-auto'">
		<tbody>
			<tr class="text-green-400">
				<th scope="row" class="pr-2" :class="leftAlign ? 'text-left' : 'text-right'">Profit</th>
				<td>{{ profit.toLocaleString() }}</td>
			</tr>
			<tr>
				<th scope="row" class="pr-2" :class="leftAlign ? 'text-left' : 'text-right'">Payout</th>
				<td>{{ newPayout.toLocaleString() }}</td>
			</tr>
			<tr>
				<th scope="row" class="pr-2" :class="leftAlign ? 'text-left' : 'text-right'">Multiplier</th>
				<td>{{ newMultiplier.toFixed(2) }}x</td>
			</tr>
		</tbody>
	</table>
	<div v-show="selectedParticipant === undefined" class="ml-1 w-fit">Pick a side to see profit margins</div>
</template>
