<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	const coffeeSpecie = [
		{ value: 1, label: 'Arabica' },
		{ value: 2, label: 'Robusta' },
		{ value: 3, label: 'Liberica' },
		{ value: 4, label: 'Excelsa' }
	];

	const encodedData = $page.url.searchParams.get('data');
	const decodedData = decodeURIComponent(encodedData ?? '');

	/**
	 * @type {string}
	 */
	let farmName;
	/**
	 * @type {string}
	 */
	let harvestingAreaName;
	/**
	 * @type {string | undefined}
	 */
	let coffeeSpecieLabel;
	const data = JSON.parse(decodedData);
	onMount(() => {
		if (data) {
			console.log(data);
			farmName = data.farmName;
			harvestingAreaName = data.harvestingAreaName;
			coffeeSpecieLabel = coffeeSpecie.find(
				(s) => s.value == parseInt(data.coffeeSpecie.hex, 16) + 1
			)?.label;
		}
	});
</script>

<div class="grid place-content-center text-center text-xl">
	<p>We harvesting this coffee at</p>
	<span class="h4 italic underline">{farmName}</span>
	<br />
	<p>within farm's area</p>
	<span class="h4 italic underline">{harvestingAreaName}</span>
	<br />
	<p>and a species of this coffee you drink is</p>
	<span class="h3 italic underline">{coffeeSpecieLabel}</span>
	<br />
	<br />
	<h3 class="h3">Here is a history before it became your cup of coffee</h3>
	<br />

	{#each data?.historyData as transaction, idx}
		<div class="card p-4">
			<p>form > {transaction.workPlace}</p>
			<p>by > {transaction.role}</p>
			<p>complete at > {transaction.dateStamp}</p>
		</div>
		{#if idx < data.historyData.length - 1}
			<span class=" text-4xl my-2">&darr;</span>
		{:else}
			<br />
		{/if}
	{/each}
</div>
