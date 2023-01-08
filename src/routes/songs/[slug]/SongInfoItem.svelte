<script lang="ts">
	export let label: string;
	export let value: string;
</script>

<h2>{label}</h2>
<input
	class="font-bold mb-4 bg-transparent border-b-2 border-b-transparent focus:border-b-white outline-none"
	type="text"
	bind:value
/>
