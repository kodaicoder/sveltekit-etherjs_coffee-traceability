<script>
	import FooterWeb3 from '$lib/components/FooterWeb3.svelte';
	import NavBarWeb3 from '$lib/components/NavBarWeb3.svelte';
	import { AppShell } from '@skeletonlabs/skeleton';
</script>

<AppShell>
	<svelte:fragment slot="header"><NavBarWeb3 /></svelte:fragment>
	<!-- Router Slot -->
	<div class="m-3">
		<slot />
	</div>
	<!-- ---- / ---- -->
	<svelte:fragment slot="footer"><FooterWeb3 /></svelte:fragment>
</AppShell>
