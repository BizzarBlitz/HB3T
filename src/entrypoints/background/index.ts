import * as listenForMessage from "./listenForMessage"
import processBetResponses from "./processBetResponses"
import wheelNotifier from "./wheelNotifier"

function promisesFromFunctions(fns: (() => void)[]): Promise<void>[] {
	const promises: Promise<void>[] = []
	fns.forEach((fn) => {
		promises.push(new Promise(fn))
	})

	return promises
}

export default defineBackground(() => {
	Promise.all(promisesFromFunctions([listenForMessage.main, wheelNotifier, processBetResponses]))
})
