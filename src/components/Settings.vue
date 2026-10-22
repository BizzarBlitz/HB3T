<script setup lang="ts">
import useStoredValue from "@/modules/composables/useStoredValue"

const settings = reactive({
	"Send daily wheel notifications": useStoredValue("local:setting-wheel-notifications", true),
	"Larger chip values": useStoredValue("local:setting-larger-chip-values", true),
	"Chips override wager": useStoredValue("local:setting-chip-override", false),
})
</script>

<template>
	<h2 class="font-sans-bold mb-2 border-b-1 text-lg tracking-wider text-[#f0c94a] uppercase">Settings</h2>
	<div class="flex flex-col gap-1">
		<label v-for="(setting, name) in settings" class="flex cursor-pointer flex-row items-center gap-1 select-none">
			<input
				type="checkbox"
				v-model="setting.state"
				:indeterminate="setting.isLoading"
				:name
				:title="`${setting.isLoading ? 'Loading...' : setting.state ? 'Enabled' : 'Disabled'} (click to toggle)`"
				class="h-5 w-5 cursor-pointer appearance-none rounded-xs bg-red-400 checked:bg-green-400 indeterminate:bg-gray-400"
			/>
			{{ name }}
		</label>
	</div>
</template>
