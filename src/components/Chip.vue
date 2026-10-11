<script setup lang="ts">
defineProps<{
	amount: number
	color0: string
	color1: string
}>()

function playChipSound() {
	const chipElement = document.querySelector<HTMLElement>(".wager-row > .chip")
	if (chipElement) {
		// Simulate click on website chip element to get it to play the sound for us
		chipElement.click()
	}
}
</script>

<template>
	<button
		@click="playChipSound"
		class="chip aspect-square leading-none"
		:style="`--color-0: ${color0}; --color-1: ${color1}`"
	>
		<span v-if="amount > 0">{{ amount.toLocaleString() }}</span>
		<span v-else>ALL<br />IN</span>
	</button>
</template>

<style scoped>
/* Ripped straight from the website LOL */
.chip {
	background: linear-gradient(155deg, var(--color-0, white), var(--color-1, gray));
	width: 64px;
	height: 64px;
	color: white;
	text-shadow: 0 1px 2px black;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 3px solid rgba(255, 255, 255, 0.3);
	border-radius: 50%;
	font-family: "Courier New", monospace;
	font-weight: 900;
	font-size: 14px;
	box-shadow:
		inset 0 2px 3px rgba(255, 255, 255, 0.4),
		inset 0 -4px 6px rgba(0, 0, 0, 0.35),
		0 4px 0 rgba(0, 0, 0, 0.55),
		0 6px 6px rgba(0, 0, 0, 0.35);
	cursor:
		url("img/Cursor Select.png") 0 0,
		pointer;
	transition:
		transform 0.07s ease,
		box-shadow 0.07s ease,
		filter 0.1s ease;
}

.chip:hover {
	filter: brightness(1.15);
}

.chip:active {
	transform: translateY(4px);
	box-shadow:
		inset 0 3px 6px rgba(0, 0, 0, 0.55),
		0 0 0 rgba(0, 0, 0, 0);
}
</style>
