<script setup lang="ts">
import Modal from "./Modal.vue"

const donationInput = ref(0)
const donation = computed(() => Number(donationInput.value) || 0)
const inProgressDonation = ref(false)

const canDonate = computed(() => !inProgressDonation.value && donation.value > 0 && donation.value % 1 === 0)
const donateResult = ref({
	message: "",
	isError: false,
})

// Not user-facing yet
const totalDonated = storage.defineItem<number>("sync:totalDonated", {
	fallback: 0,
})

function donate() {
	if (!canDonate.value) return

	inProgressDonation.value = true
	// [TODO]: Open default profile widget and use that? or just send http manually
	fetch("https://api.hamsballbattles.com/send-coins", {
		method: "POST",
		credentials: "include",
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify({
			username: "BizzarBlitz",
			amount: donation.value,
		}),
	})
		.then((response) => {
			return response.json().then((data) => {
				return {
					data: data,
					ok: response.ok,
				}
			})
		})
		.then((response) => {
			if (!response.ok) {
				donateResult.value = {
					isError: true,
					message: response.data.error,
				}
				return
			}

			totalDonated.getValue().then((value) => {
				totalDonated.setValue(value + donation.value)
			})

			donateResult.value = {
				isError: false,
				message: "Thanks!",
			}
		})
		.catch((err) => {
			donateResult.value = {
				isError: true,
				message: err instanceof Error ? err.message : String(err),
			}
		})
		.finally(() => {
			inProgressDonation.value = false
		})
}
</script>

<template>
	<Modal @closed="donateResult = {message: '', isError: false}" class="max-h-200 max-w-75 text-lg">
		<div class="flex h-full flex-col items-center justify-between text-center">
			<h2 class="font-sans-bold border-b-2 text-center text-xl tracking-wider text-[#f0c94a] uppercase">
				Make a donation
			</h2>
			<div class="w-full">
				Donation amount: <br />
				<input
					name="hb3t-donation"
					v-model.number="donationInput"
					type="text"
					placeholder="Donation amount"
					spellcheck="false"
					autocomplete="off"
					class="h-8 w-48 rounded-sm border-1 border-amber-300 bg-[#06180d] p-2 text-amber-300"
				/>
			</div>
			<div class="justify-items-center">
				<button
					:disabled="!canDonate"
					@click="donate"
					class="donate-button cursor-ball-pointer block px-6 py-3 text-sm text-nowrap uppercase select-none"
				>
					Donate {{ donation.toLocaleString() }} {{ donation === 1 ? "coin" : "coins" }}
				</button>
				<div
					v-show="donateResult.message !== ''"
					class="mt-4 font-bold"
					:class="{'text-green-400': !donateResult.isError, 'text-red-500': donateResult.isError}"
				>
					{{ donateResult.message }}
				</div>
			</div>
		</div>
	</Modal>
</template>

<style scoped>
/* Largely copies from BetButton style */
.donate-button {
	position: relative;
	background-image: radial-gradient(circle at 50% 28%, #7a463b 0%, #4a2620 45%, #241009 100%);
	color: #c9b6a8;
	border: 3px solid #6b5a35;
	border-radius: 999px;
	box-shadow:
		0 5px 0 #2a0d0a,
		0 9px 16px rgba(0, 0, 0, 0.5),
		inset 0 3px 4px rgba(255, 255, 255, 0.15),
		inset 0 -8px 12px rgba(0, 0, 0, 0.4);
	font-family: "Arial Black", "Impact", sans-serif;
	letter-spacing: 1.5px;
	transition:
		transform 0.06s ease,
		box-shadow 0.1s ease,
		filter 0.15s ease,
		background-image 0.3s ease,
		color 0.3s ease,
		border-color 0.3s ease;
}

.donate-button:enabled {
	background-image: radial-gradient(circle at 50% 28%, #ff6a4d 0%, #d43a2c 45%, #7a1a12 100%);
	color: #fff2dd;
	border-color: #f0c94a;
}

.donate-button:enabled:active {
	transform: translateY(4px);
	box-shadow:
		0 1px 0 #2a0d0a,
		inset 0 4px 8px rgba(0, 0, 0, 0.6),
		inset 0 -2px 4px rgba(0, 0, 0, 0.3);
}
</style>
