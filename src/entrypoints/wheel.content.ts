export default defineContentScript({
	matches: ["*://*.hamsballbattles.com/wheel"],

	main(ctx) {
		function sendMessageOnWheelSpin() {
			const spinWheelButton = document.querySelector<HTMLButtonElement>("button#spinButton")
			spinWheelButton!.addEventListener("click", () => {
				browser.runtime.sendMessage("wheel-spin-clicked")
			})
		}

		if (document.readyState === "loading") {
			ctx.addEventListener(document, "DOMContentLoaded", sendMessageOnWheelSpin)
		} else {
			sendMessageOnWheelSpin()
		}
	},
})
