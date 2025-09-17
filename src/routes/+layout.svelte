<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/utils/header.svelte';

</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>


<Header />

<slot />
