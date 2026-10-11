import {listenForMessage} from "./listenForMessage"

async function waitForCompleted(url: string): Promise<number> {
	return new Promise((resolve) => {
		const listener = (responseDetails: Browser.webRequest.OnCompletedDetails) => {
			browser.webRequest.onCompleted.removeListener(listener)
			resolve(responseDetails.statusCode)
		}

		browser.webRequest.onCompleted.addListener(listener, {
			urls: [url],
		})
	})
}

export default function () {
	console.log("Processing bet responses")
	listenForMessage("await-bet-response", (_: any, _1: any, sendResponse) => {
		waitForCompleted("https://api.hamsballbattles.com/place-bet").then(sendResponse)
		return true
	})

	listenForMessage("await-retract-response", (_: any, _1: any, sendResponse) => {
		waitForCompleted("https://api.hamsballbattles.com/retract-bet").then(sendResponse)
		return true
	})
}
