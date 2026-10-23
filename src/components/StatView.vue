<script setup lang="ts">
import betData from "@/modules/betData.ts"
import PoolMeter from "./PoolMeter.vue"
import type {Match, Participant} from "@/modules/betData.ts"

const props = defineProps<{
	elements: {
		matchCard: HTMLElement
		selectButtons: Record<string, HTMLButtonElement> // <participantId, button>
	}
}>()
provide("matchCard", props.elements.matchCard)

const match = computed((): Match => {
	const placeholderMatch: Match = {
		id: props.elements.matchCard.dataset.id || "loading-id",
		participants: [
			{
				id: "al",
				name: "Al",
				pool: 1,
			},
			{
				id: "bosh",
				name: "Bosh",
				pool: 1,
			},
		],
	}

	if (!betData.scheduledMatches) return placeholderMatch

	return (
		betData.scheduledMatches.find((match) => {
			return match.id === props.elements.matchCard.dataset.matchId
		}) ?? placeholderMatch
	)
})

const selectedParticipantId = ref()
watch(selectedParticipantId, (newId) => {
	props.elements.selectButtons[newId]?.click()
})
watch(
	() => props.elements.selectButtons,
	(selectButtons) => {
		for (const [participantId, button] of Object.entries(selectButtons)) {
			// Set onclick property to override previous handler and prevent event stacking
			button.onclick = () => {
				selectedParticipantId.value = participantId
			}
		}
	},
	{immediate: true},
)

const selectedParticipant = computed<Participant | undefined>(() => {
	return match.value.participants.find((participant) => {
		return participant.id === selectedParticipantId.value
	})
})
</script>

<template>
	<div class="mt-3 font-[Courier_New]">
		<PoolMeter :match :selected-participant v-model="selectedParticipantId" />
	</div>
</template>
