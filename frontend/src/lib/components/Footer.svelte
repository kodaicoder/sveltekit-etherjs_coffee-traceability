<script>
	import { AppBar } from '@skeletonlabs/skeleton';
	import { connected, chainId } from 'svelte-ethers-store';
</script>

<AppBar slotTrail="!justify-end">
	<svelte:fragment slot="trail">
		<p>Enjoy your fresh coffee</p>
	</svelte:fragment>
</AppBar>
