<script setup lang="ts">
import {refreshBetData} from "@/modules/betData"

const REFRESH_COOLDOWN = 1000

const isLoading = ref(false)
function refresh() {
	if (isLoading.value) return
	isLoading.value = true

	Promise.all([refreshBetData(), cooldown()]).finally(() => {
		isLoading.value = false
	})
}

async function cooldown() {
	return new Promise((resolve) => {
		setTimeout(resolve, REFRESH_COOLDOWN)
	})
}
</script>

<template>
	<button
		title="Refresh"
		class="cursor-ball-pointer font-sans-bold hover:text-white disabled:text-gray-400"
		:disabled="isLoading"
		@click="refresh"
		style="font-family: &quot;Segoe UI Symbol&quot;"
	>
		🔄
	</button>
</template>
