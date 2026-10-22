import useStoredValue from "@/modules/composables/useStoredValue"
import {listenForMessage} from "./listenForMessage"

const WHEEL_COOLDOWN_MILLIS = 86_400_000 // 24 hours

const sendWheelNotifications = useStoredValue("local:setting-wheel-notifications", true)

const nextWheelSpin = storage.defineItem<number>("sync:nextWheelSpin", {
	init: () => {
		function logWheelCooldown(wheelCooldown: number) {
			console.log("Initialized wheel cooldown:", wheelCooldown, new Date(wheelCooldown).toLocaleTimeString())
		}

		return new Promise((resolve) => {
			console.log("Initializing wheel notif data")
			fetchNextWheelSpin()
				.then((nextSpin) => {
					console.log("Successfully retrieved next wheel spin")
					logWheelCooldown(nextSpin)
					resolve(nextSpin)
				})
				.catch((err) => {
					console.warn("Could not fetch HBB profile data, setting wheel cooldown to 24 hours from now")
					console.log(err)

					let nextSpin = getNextWheelFromNow()
					logWheelCooldown(nextSpin)
					resolve(nextSpin)
				})
				.finally(() => {
					storage.removeMeta("sync:nextWheelSpin")
				})
		})
	},
})

async function fetchNextWheelSpin() {
	const response = await fetch("https://api.hamsballbattles.com/me", {
		method: "GET",
		credentials: "include",
	})

	return (await response.json()).user?.next_wheel_spin_at ?? getNextWheelFromNow()
}

function getNextWheelFromNow(): number {
	return Date.now() + WHEEL_COOLDOWN_MILLIS
}

async function isWheelAvailable() {
	return (await nextWheelSpin.getValue()) < Date.now()
}

function setNextWheelSpin(timestamp: number) {
	nextWheelSpin.setValue(timestamp)
	nextWheelSpin.removeMeta(["alreadyNotified"])
}

function resetWheelCooldown() {
	setNextWheelSpin(getNextWheelFromNow())
}

function sendWheelReadyNotfication() {
	sendWheelNotifications.then((notificationsEnabled) => {
		if (notificationsEnabled.state.value) {
			browser.notifications.create("hbb-wheel-available", {
				type: "basic",
				iconUrl: "../../../icon/128.png",
				title: "[Ham's Ball Battles]: Daily wheel is ready to spin",
				message: "Click to open page",
			})
		}
	})

	nextWheelSpin.setMeta({alreadyNotified: true})
}

async function notifyWhenWheelAvailable(sendTimestamp: number) {
	const alreadyNotified = ((await nextWheelSpin.getMeta()) as {alreadyNotified?: true}).alreadyNotified
	const wheelAvailable = await isWheelAvailable()

	if (wheelAvailable) {
		console.log("Wheel available")
		if (!alreadyNotified) {
			// Wheel is already available; notify immediately
			sendWheelReadyNotfication()
		}
	} else {
		console.log("Wheel not available yet")
		// Wait until wheel is available to notify
		// We're in a background script so this hopefully shouldn't get throttled too much
		setTimeout(sendWheelReadyNotfication, sendTimestamp - Date.now())
	}
}

export default function () {
	nextWheelSpin.getValue().then((nextWheelSpinTimestamp: number) => {
		notifyWhenWheelAvailable(nextWheelSpinTimestamp)
	})

	listenForMessage("wheel-spin-clicked", async () => {
		if (await isWheelAvailable()) {
			resetWheelCooldown() // Reset wheel cooldown after wheel is spun
		}
	})

	listenForMessage("sync-wheel-cooldown", (_: any, _1: any, sendResponse) => {
		new Promise((resolve, reject) => {
			fetchNextWheelSpin()
				.then((nextWheelSpin) => {
					setNextWheelSpin(nextWheelSpin)
					sendResponse(nextWheelSpin)
				})
				.catch(reject)
		})

		return true
	})
}
