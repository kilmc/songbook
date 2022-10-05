<script lang="ts">
	import Header from '$lib/header/Header.svelte';
	import '../app.css';
</script>

<Header />
<main class="bg-slate-900 white">
	<slot />
</main>
