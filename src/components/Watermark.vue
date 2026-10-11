<script setup lang="ts">
function donate() {}
</script>

<template>
	<div class="text-[#8fae8f] font-['Times_New_Roman',Times,serif]">
		<span class="after:content-['•'] after:inline-block after:mx-2"
			>Extra components powered by
			<a
				target="_blank"
				title="GitHub link (opens in new tab)"
				href="https://github.com/BizzarBlitz/HB3T"
				class="hover:text-white underline cursor-ball-pointer"
				>HB3T</a
			></span
		>
		<!-- [TODO]: Actually implement this -->
		<button
			@click="donate"
			title="Donate some coins to the extension developer (please)"
			class="hover:text-[lime] underline cursor-ball-pointer"
		>
			Give coins
		</button>
	</div>
</template>
