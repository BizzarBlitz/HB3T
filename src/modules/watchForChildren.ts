export default function (parent: Element, selector: string, callback: (element: Element) => void): () => void {
	const children = parent.children
	for (let i = 0; i < children.length; i++) {
		const element = children[i]
		if (element?.matches(selector)) {
			callback(element)
		}
	}

	const observer = new MutationObserver((mutations) => {
		mutations.forEach((mutation) => {
			mutation.addedNodes.forEach((child) => {
				if (child instanceof Element && child.matches(selector)) {
					callback(child)
				}
			})
		})
	})
	observer.observe(parent, {
		childList: true,
	})

	return observer.disconnect
}
