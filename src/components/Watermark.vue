<script setup lang="ts">
import DonateModal from "./DonateModal.vue"

const isDonateModalOpen = ref(false)
</script>

<template>
	<div class="font-['Times_New_Roman',Times,serif] text-[#8fae8f]">
		<span class="after:mx-2 after:inline-block after:content-['•']"
			>Extra components powered by
			<a
				target="_blank"
				title="GitHub link (opens in new tab)"
				href="https://github.com/BizzarBlitz/HB3T"
				class="hover:text-cream cursor-ball-pointer underline"
				>HB3T</a
			></span
		>
		<button
			@click="isDonateModalOpen = true"
			title="Donate some coins to the extension developer (please)"
			class="cursor-ball-pointer underline hover:text-green-400"
		>
			Give coins
		</button>
	</div>

	<DonateModal v-model="isDonateModalOpen" />
</template>
