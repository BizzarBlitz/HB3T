<script setup lang="ts">
import PoolMeter from "./PoolMeter.vue"
import type {Match, Participant} from "@/modules/betData.ts"

const props = defineProps<{
	match: Match
	elements: {
		matchCard: HTMLElement
		selectButtons: Record<string, HTMLButtonElement> // <participantId, button>
	}
}>()
provide("matchCard", props.elements.matchCard)

const selectedParticipantId = ref()
watch(
	() => props.elements.selectButtons,
	(selectButtons) => {
		for (const [participantId, button] of Object.entries(selectButtons)) {
			// Use onclick here to prevent event stacking by overriding previous
			button.onclick = () => {
				selectedParticipantId.value = participantId
			}
		}
	},
	{immediate: true},
)

const selectedParticipant = computed<Participant | undefined>(() => {
	return props.match.participants.find((participant) => {
		return participant.id === selectedParticipantId.value
	})
})
</script>

<template>
	<div class="mt-3 font-[Courier_New]">
		<PoolMeter :match :selected-participant />
	</div>
</template>
