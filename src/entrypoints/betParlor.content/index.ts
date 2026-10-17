import "@/assets/tailwind.css"
// import "./style.css"
import watchForChildren from "@/modules/watchForChildren.ts"
import StatView from "@/components/StatView.vue"
import Watermark from "@/components/Watermark.vue"
import type {ContentScriptContext} from "#imports"
import betData, {waitForBetDataLoad} from "@/modules/betData"

function onMatchCardAdded(ctx: ContentScriptContext) {
	return async (matchCard: Element) => {
		// Main UI modifications
		createShadowRootUi(ctx, {
			name: "hb3t-augments",
			position: "inline",
			inheritStyles: true,
			anchor: matchCard.querySelector(".vs-row")!,
			append: "after",
			onMount: onMount(matchCard as HTMLElement),
		}).then((ui) => {
			ui.mount()
		})

		// Watermark
		createShadowRootUi(ctx, {
			name: "hb3t-watermark",
			position: "inline",
			inheritStyles: true,
			anchor: matchCard.querySelector(".lock-row"),
			append: "first",
			onMount: (container) => {
				matchCard.querySelector<HTMLElement>(".lock-row")!.style.justifyContent = "space-between"
				createApp(Watermark).mount(container)
			},
		}).then((ui) => {
			ui.mount()
		})
	}
}

function onMount(matchCard: HTMLElement) {
	return async (container: HTMLElement) => {
		await waitForBetDataLoad()

		// Hide default ui, but don't remove it, since we need to use it to place the actual bet
		matchCard.querySelector<HTMLElement>(".wager-row")!.style.display = "none"

		const app = createApp(StatView, {
			match: betData.scheduledMatches.find((match) => {
				return match.id === matchCard.dataset.matchId
			})!,
			elements: {
				matchCard,
				selectButtons: getSelectButtons(matchCard),
			},
		})
		app.mount(container)

		return app
	}
}

function getSelectButtons(matchCard: Element) {
	const selectButtons: Record<string, HTMLButtonElement> = {}

	const participantTiles = matchCard.querySelectorAll<HTMLElement>("[data-pick-id]")
	participantTiles.forEach((tile) => {
		selectButtons[tile.dataset.pickId!] = tile.querySelector<HTMLButtonElement>("button.pick-btn")!
	})

	return selectButtons
}

export default defineContentScript({
	matches: ["*://*.hamsballbattles.com/bet"],
	cssInjectionMode: "ui",

	main(ctx) {
		const openMatches = document.body.querySelector("#open-matches-list")
		watchForChildren(openMatches!, ".match-card", onMatchCardAdded(ctx))
	},
})
