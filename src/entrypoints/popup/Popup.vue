<script lang="ts" setup>
import Settings from "@/components/Settings.vue"
import {useTimeAgo} from "@vueuse/core"

browser.notifications.onClicked.addListener((id) => {
	if (id !== "hbb-wheel-available") return
	window.open("https://hamsballbattles.com/wheel")
})

const wheelCountdown = ref("Loading")
const wheelReadyTime = ref("00:00")
storage
	.getItem<number>("sync:nextWheelSpin")
	.then((nextWheelSpin) => {
		console.log("Retrieval success:", nextWheelSpin)
		const nextWheelDate = new Date(nextWheelSpin ?? Date.now())
		wheelCountdown.value = useTimeAgo(nextWheelDate) as any
		wheelReadyTime.value = nextWheelDate.toLocaleTimeString()
	})
	.catch((err) => {
		console.warn("Retrieval not success:", err)
	})

const isSyncing = ref(false)
function syncWheelCooldown() {
	isSyncing.value = true

	browser.runtime
		.sendMessage("sync-wheel-cooldown")
		.then((nextWheelSpin) => {
			const nextWheelDate = new Date(nextWheelSpin ?? Date.now())
			wheelCountdown.value = useTimeAgo(nextWheelDate) as any
			wheelReadyTime.value = nextWheelDate.toLocaleTimeString()
		})
		.catch((err) => {
			console.warn("Could not sync:", err)
		})
		.finally(() => {
			isSyncing.value = false
		})
}
</script>

<template>
	<div id="root" class="text-cream flex min-h-32 min-w-64 flex-col p-2 text-sm">
		<Settings />
		<div class="mt-2 text-xs opacity-80">
			<hr class="mb-1" />
			Next wheel spin:
			<button
				:disabled="isSyncing"
				@click="syncWheelCooldown"
				title="Click to refresh"
				class="cursor-pointer font-bold hover:underline disabled:text-gray-400 disabled:no-underline"
			>
				{{ wheelCountdown }}
			</button>
			({{ wheelReadyTime }})
		</div>
	</div>
</template>
