<script>
	import { signerAddress, connected } from 'svelte-ethers-store';

	import ConnectWeb3Button from '$lib/components/ConnectWeb3Button.svelte';
	import logoImg from '$lib/assets/images/logo_color_circle.png';
	import { getTxnDataHistory } from '$lib/utils/contractActions';

	import {
		roleStore,
		workplaceStore,
		workplaceValueStore,
		roleValueStore
	} from '$lib/stores/role.js';

	/**
	 * Represents an array of objects with a 'name' property.
	 * @typedef {object[]} historyTransactionType
	 * @property {string=} hash - The name property of each object.
	 * @property {string=} data - The name property of each object.
	 * @property {string=} error - The name property of each object.
	 */

	/**
	 * Function that takes an array of objects with names.
	 * @type {historyTransactionType} - The array of objects with names.
	 */
	let historyTransactions = [];

	const getHistoryTransactions = async () => {
		historyTransactions = await getTxnDataHistory();
	};
</script>

<div class="grid place-content-center text-center">
	{#if $connected}
		<div class="h1">
			<h1>Welcome back</h1>
			<br />
			<h1>Your role is {$roleStore}</h1>
		</div>
		<br />
		<br />
		<div class="flex flex-col items-center">
			{#if $workplaceValueStore == 99 && $roleValueStore == 99}
				<a class="btn variant-filled-primary w-fit" href="/manager"> go to manager page</a>
			{/if}
			{#if $workplaceValueStore != 99 && $roleValueStore != 99}
				{#if $workplaceValueStore && $roleValueStore}
					<a class="btn variant-filled-primary w-fit" href="/creator"> go to creator page</a>
				{:else}
					<h2>You don't have any permission.</h2>
				{/if}
			{/if}
		</div>
		<!-- <br />
		<div class="flex flex-col items-center">
			<button class="btn variant-filled-primary w-fit" on:click={getHistoryTransactions}>
				get transaction history
			</button>
			<div>
				<h3>History Transactions</h3>
				{#each historyTransactions as txn}
					<p>{!txn.error ? `${txn.hash} : ${txn.data}` : `${txn.error}`}</p>
				{/each}
			</div>
		</div> -->
	{:else}
		<div class="h1">
			<img src={logoImg} alt="coffee tracker logo" width="150" class="mx-auto my-4" />
			<h1>Welcome</h1>
			<h1>to</h1>
			<h1>Coffee tracker</h1>
		</div>
		<br />
		<strong>Please connect your wallet</strong>
		<br />
		<ConnectWeb3Button />
	{/if}
</div>
