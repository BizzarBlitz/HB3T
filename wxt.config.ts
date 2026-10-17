import {defineConfig} from "wxt"
import tailwindcss from "@tailwindcss/vite"

// See https://wxt.dev/api/config.html
export default defineConfig({
	modules: ["@wxt-dev/module-vue"],
	srcDir: "src",
	modulesDir: "wxt-modules", // default: "modules"
	outDir: "dist", // default: ".output"
	publicDir: "static", // default: "public"

	manifest: {
		name: "[HB3T] Ham's Ball Battles Bet Tweaks",
		permissions: ["notifications", "storage", "webRequest"],
		host_permissions: ["https://api.hamsballbattles.com/*"],
	},

	hooks: {
		// https://wxt.dev/guide/essentials/content-scripts#css
		"build:manifestGenerated": (wxt, manifest) => {
			manifest.content_scripts ??= []

			const contentScript = manifest.content_scripts.find((script) => {
				return script.matches?.includes("*://*.hamsballbattles.com/bet")
			})

			if (contentScript) {
				contentScript.css = ["betParlor.css"]
			} else {
				manifest.content_scripts.push({
					matches: ["*://*.hamsballbattles.com/bet"],
					css: ["betParlor.css"],
				})
			}
		},
	},

	vite: () => ({
		plugins: [tailwindcss()],
	}),
})
