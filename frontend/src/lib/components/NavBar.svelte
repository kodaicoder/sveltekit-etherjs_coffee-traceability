<script>
	import { onMount } from 'svelte';
	import { AppBar } from '@skeletonlabs/skeleton';
	import SimpleStorage from '$contracts/SimpleStorage.json';
	import { contractInterfaceStore } from '$lib/stores/contractInterface';

	import logoImg from '$lib/assets/images/logo_color_circle.png';

	onMount(() => {
		contractInterfaceStore.updateContract(SimpleStorage.abi);
	});
</script>

<AppBar gridColumns="grid-cols-3" slotTrail="place-content-end">
	<svelte:fragment slot="lead">
		<a href="/customer" class="flex gap-6">
			<img src={logoImg} alt="coffee tracker logo" width="30" />
			<h3 class="h3">Coffee Tracker</h3>
		</a>
	</svelte:fragment>
</AppBar>
