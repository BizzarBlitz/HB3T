<script lang="ts" setup>
import betData from "@/modules/betData"
import {useTimeAgo} from "@vueuse/core"

function sendNotification(delay: number) {
	setTimeout(() => {
		browser.notifications.create("hbb-wheel-available", {
			type: "basic",
			iconUrl: "../../../wxt.svg",
			title: "[Ham's Ball Battles]: Daily wheel is ready to spin",
			message: "Click to open page",
		})
	}, delay * 1000)
}

browser.notifications.onClicked.addListener((id) => {
	if (id !== "hbb-wheel-available") return
	window.open("https://hamsballbattles.com/wheel")
})

const wheelCountdown = ref("Loading")
storage
	.getItem<number>("sync:nextWheelSpin")
	.then((nextWheelSpin) => {
		console.log("Retrieval success:", nextWheelSpin)
		wheelCountdown.value = useTimeAgo(new Date(nextWheelSpin ?? Date.now())) as any
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
			wheelCountdown.value = useTimeAgo(new Date(nextWheelSpin)) as any
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
	<div id="root" class="text-cream min-w-64 min-h-32">
		<div class="mb-2 text-xl">
			Next wheel spin: <b>{{ wheelCountdown }}</b>
			<button
				:disabled="isSyncing /* Less chance of breaking something (also visual feedback) */"
				@click="syncWheelCooldown"
				class="ml-2 cursor-pointer underline disabled:text-gray-400 disabled:no-underline"
			>
				(Refresh)
			</button>
		</div>

		<button class="border-1 border-white cursor-pointer block mb-2" @click="sendNotification(0.1)">Send notif</button>
		<button class="border-1 border-white cursor-pointer block mb-2" @click="sendNotification(3)">Send notif (3)</button>

		<div>Hi! {{ betData.placedBets }}</div>
	</div>
</template>
