<script>
	import { AppBar } from '@skeletonlabs/skeleton';
	import { connected, chainId } from 'svelte-ethers-store';
</script>

<AppBar slotTrail="!justify-end">
	<svelte:fragment slot="trail">
		<p>
			{$connected ? 'Connected' : 'Not connected'}
			to Web3
			{$connected ? 'at chain id :' + $chainId : ''}
		</p>
	</svelte:fragment>
</AppBar>
