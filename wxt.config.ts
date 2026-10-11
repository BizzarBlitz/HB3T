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

	vite: () => ({
		plugins: [tailwindcss()],
	}),
})
