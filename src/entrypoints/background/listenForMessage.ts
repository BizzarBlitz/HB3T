const listeners: Record<any, Listener<any>> = {}

type Listener<T> = (message: T, sender: Browser.runtime.MessageSender, sendResponse: (response?: any) => void) => void

export function listenForMessage<T>(message: T, listener: Listener<T>) {
	listeners[message] = listener as any
}

export function main() {
	console.log("Listening for messages")
	browser.runtime.onMessage.addListener(
		(message: any, sender: Browser.runtime.MessageSender, sendResponse: (response?: any) => void) => {
			const listener = listeners[message]
			console.log("New message", message, listener)
			if (listener) {
				return listener(message, sender, sendResponse)
			}
		},
	)
}
