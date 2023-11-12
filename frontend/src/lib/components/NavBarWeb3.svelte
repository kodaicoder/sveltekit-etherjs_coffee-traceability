<script>
	import { AppBar } from '@skeletonlabs/skeleton';
	import logoImg from '$lib/assets/images/logo_color_circle.png';
	import ConnectWeb3Button from './ConnectWeb3Button.svelte';
</script>

<AppBar gridColumns="grid-cols-3" slotTrail="place-content-end">
	<svelte:fragment slot="lead">
		<a href="/" class="flex gap-6">
			<img src={logoImg} alt="coffee tracker logo" width="30" />
			<h3 class="h3">Coffee Tracker</h3>
		</a>
	</svelte:fragment>

	<svelte:fragment slot="trail"><ConnectWeb3Button /></svelte:fragment>
</AppBar>
