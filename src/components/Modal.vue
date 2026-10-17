<script setup lang="ts">
const isOpen = defineModel<boolean>({
	default: false,
})

const emit = defineEmits<{
	opened: []
	closed: []
}>()

const dialog = useTemplateRef<HTMLDialogElement>("modal-dialog")
watchEffect(() => {
	if (isOpen.value) {
		dialog.value?.showModal()
		emit("opened")
	} else {
		dialog.value?.close()
		emit("closed")
	}
})
</script>

<template>
	<dialog
		@click.self="isOpen = false"
		ref="modal-dialog"
		class="hb3t-modal not-open:hidden text-cream font-['Courier_New'] bg-linear-to-b from-[#123318] to-[#0a2211] grid m-auto min-h-100 min-w-75 border-3 rounded-xl"
	>
		<div class="w-full h-full p-8">
			<form method="dialog" class="absolute top-2 right-2">
				<button
					@click="isOpen = false"
					title="Close"
					class="cursor-ball-pointer w-6 h-6 text-[#a8c9a8] hover:text-[#f0c94a] text-lg font-bold"
				>
					✕
				</button>
			</form>
			<slot />
		</div>
	</dialog>
</template>

<style scoped>
dialog.hb3t-modal {
	border-top-color: #f6e79a;
	border-left-color: #f6e79a;
	border-bottom-color: #8a6a1f;
	border-right-color: #8a6a1f;
	box-shadow:
		0 8px 30px rgba(0, 0, 0, 0.7),
		0 0 20px #d4af3744,
		0 6px 0 black;
}
dialog.hb3t-modal::backdrop {
	background-color: black;
	opacity: 50%;
}
</style>
