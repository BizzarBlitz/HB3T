import * as betData from "@/modules/betData"
import useStoredValue from "@/modules/composables/useStoredValue"

const POLL_INTERVAL = 15 * 1000 // Website itself polls every 8 seconds, but we still need to poll to update our own data
const autoRefresh = useStoredValue("local:setting-auto-refresh", true)

export default function () {
	betData.waitForBetDataLoad().then(() => {
		setInterval(() => {
			if (autoRefresh.isLoading.value || autoRefresh.state.value) {
				betData.refreshBetData()
			}
		}, POLL_INTERVAL)
	})
}
