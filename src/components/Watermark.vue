<script setup lang="ts">
function donate() {}
</script>

<template>
	<div class="text-[#8fae8f] font-['Times_New_Roman',Times,serif]">
		<!-- [TODO]: Replace with github link -->
		<span class="after:content-['•'] after:inline-block after:mx-2"
			>Extra components powered by
			<a
				target="_blank"
				title="GitHub link (opens in new tab)"
				href="https://hamsballbattles.com/bet"
				class="hover:text-white underline cursor-ball-pointer"
				>HB3T</a
			></span
		>
		<button
			@click="donate"
			title="Donate some coins to the extension developer (please)"
			class="hover:text-[lime] underline cursor-ball-pointer"
		>
			Give coins
		</button>
	</div>
</template>
