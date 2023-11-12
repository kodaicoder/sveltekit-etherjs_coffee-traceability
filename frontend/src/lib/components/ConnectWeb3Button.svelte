<script>
	import { browser } from '$app/environment';
	import { onMount, onDestroy } from 'svelte';
	import CoffeeTraceability from '$contracts/CoffeeTraceability.json';
	import { defaultEvmStores as evm, chainId, signerAddress, connected } from 'svelte-ethers-store';
	import { ethers } from 'ethers';
	import detectEthereumProvider from '@metamask/detect-provider';

	import { contractInterfaceStore } from '$lib/stores/contractInterface';
	import { roleStore, workplaceStore } from '$lib/stores/role';

	import { getData } from '$lib/utils/contractActions';

	/**
	 * Represents an array of ABI objects.
	 *
	 * @typedef {Object} AbiObject
	 * @property {Object[]} inputs - An array of input parameters.
	 * @property {string} inputs.internalType - The internal type of the input.
	 * @property {string} inputs.name - The name of the input.
	 * @property {string} inputs.type - The type of the input.
	 * @property {string} name - The name of the ABI object.
	 * @property {never[]} outputs - An array representing the outputs of the ABI object.
	 * @property {string} stateMutability - The state mutability of the ABI object.
	 * @property {string} type - The type of the ABI object.
	 * @property {boolean} [constant] - Optional constant property for the ABI object.
	 */

	/**
	 * Represents an array of ABI objects.
	 *
	 * @type {AbiObject[]}
	 */

	/**
	 * @type {string[]}
	 */
	let accounts = [];
	let loaded = false;

	$: isMetaMaskPresent = false;
	$: setTimeout(() => {
		loaded = true;
	}, 200);

	onMount(async () => {
		const metamaskProvider = await detectEthereumProvider();
		isMetaMaskPresent = metamaskProvider?.isMetaMask || false;
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		accounts = await provider.listAccounts();
		if (accounts.length > 0) {
			connectWallet();
		}
		window.ethereum?.on('accountsChanged', handleAccountsChanged);
	});

	onDestroy(() => {
		if (browser) {
			window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
		}
	});

	/**
	 * @param {string | string[]} newAccounts
	 */
	async function handleAccountsChanged(newAccounts) {
		if (Array.isArray(newAccounts) && newAccounts.length > 0 && newAccounts[0]) {
			if ($signerAddress) {
				connectWallet();
			}
		} else {
			evm.disconnect();
			contractInterfaceStore.clearInterface();
			window.location.pathname = '/';
		}
	}

	async function connectWallet() {
		//! this test direct connect to ganache provider it self
		// const url = 'http://localhost:8545';
		// await evm.setProvider(url);
		await evm.setProvider();
		await setContract();
		const workplace = await getData('CoffeeTraceability', 'getWorkPlace');
		const role = await getData('CoffeeTraceability', 'getRole');
		if (workplace && role) {
			workplaceStore.updateWorkplace(workplace);
			roleStore.updateRole(role);
		}

		contractInterfaceStore.updateContract(CoffeeTraceability.abi);
	}

	async function setContract() {
		// @ts-ignore
		const deployedNetwork = CoffeeTraceability.networks[$chainId];
		await evm.attachContract(
			'CoffeeTraceability',
			deployedNetwork.address,
			// @ts-ignore
			CoffeeTraceability.abi,
			accounts[0] ?? $signerAddress
		);
	}

	async function getSingerAddress() {
		const currentAddress = await $signerAddress;
		const start = currentAddress.slice(0, 5);
		const end = currentAddress.slice(-5);
		return start + '....' + end;
	}
</script>

{#if loaded}
	{#if isMetaMaskPresent}
		{#if $connected}
			<button type="button" class="btn variant-filled">
				<span>
					<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 256 256"
						><path
							fill="currentColor"
							d="M216 72H56a8 8 0 0 1 0-16h136a8 8 0 0 0 0-16H56a24 24 0 0 0-24 24v128a24 24 0 0 0 24 24h160a16 16 0 0 0 16-16V88a16 16 0 0 0-16-16Zm-36 80a12 12 0 1 1 12-12a12 12 0 0 1-12 12Z"
						/></svg
					>
				</span>
				{#await getSingerAddress()}
					<p>...waiting</p>
				{:then address}
					<span>{address}</span>
				{:catch error}
					<p style="color: red">{error.message}</p>
				{/await}
			</button>
		{:else}
			<button type="button" class="btn variant-filled" on:click={connectWallet}>
				<span>
					<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 256 256"
						><path
							fill="currentColor"
							d="M216 72H56a8 8 0 0 1 0-16h136a8 8 0 0 0 0-16H56a24 24 0 0 0-24 24v128a24 24 0 0 0 24 24h160a16 16 0 0 0 16-16V88a16 16 0 0 0-16-16Zm-36 80a12 12 0 1 1 12-12a12 12 0 0 1-12 12Z"
						/></svg
					>
				</span>
				<span>Connect Wallet</span>
			</button>
		{/if}
	{:else}
		<p>Please install MetaMask before using.</p>
	{/if}
{:else}
	<p>Loading...</p>
{/if}
