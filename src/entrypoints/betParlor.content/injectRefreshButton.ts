import RefreshButton from "@/components/RefreshButton.vue"
import type {ContentScriptContext} from "#imports"

export default function (ctx: ContentScriptContext) {
	createShadowRootUi(ctx, {
		name: "hb3t-refresh-data",
		position: "inline",
		inheritStyles: true,
		anchor: ".section-label:has(+ #open-matches-list)",
		append: "last",
		onMount: (container) => {
			const sectionLabel = document.querySelector<HTMLElement>(".section-label:has(+ #open-matches-list)")!
			sectionLabel.style = "justify-content: space-between; display: flex;"
			createApp(RefreshButton).mount(container)
		},
	}).then((ui) => {
		ui.autoMount()
	})
}
