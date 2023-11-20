<script>
	import HarvesterForm from '$lib/components/HarvesterForm.svelte';
	import NextStateForm from '$lib/components/NextStateForm.svelte';

	import {
		roleStore,
		workplaceStore,
		workplaceValueStore,
		roleValueStore
	} from '$lib/stores/role.js';
</script>

<div class="grid place-content-center">
	<div class="text-center">
		<h1 class="h1">Tracker Creator</h1>
		<br />
		<h3 class="h3">
			Your workplace is: <b><u>{$workplaceStore}</u></b>
			& Your role is: <b><u>{$roleStore}</u></b>
		</h3>
	</div>
	<br />
	<div>
		{#if $workplaceValueStore == 1 && $roleValueStore == 1}
			<HarvesterForm />
		{:else if $workplaceValueStore != 99 && $roleValueStore != 99 && $workplaceValueStore && $roleValueStore}
			<NextStateForm />
		{:else}
			<div class="grid place-content-center text-center">
				<p>You're not have permission to do this task.</p>
			</div>
		{/if}
	</div>
</div>
