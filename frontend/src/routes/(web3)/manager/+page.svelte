<script>
	// @ts-nocheck
	import Select from 'svelte-select';
	import isWalletValid from '$lib/utils/isWalletValid';
	import { setRoles } from '$lib/utils/contractActions';
	import {
		roleStore,
		workplaceStore,
		workplaceValueStore,
		roleValueStore
	} from '$lib/stores/role.js';

	let workplaceValue = null;
	let roleValue = null;
	let roleDisabled = true;

	let workplace = [
		{ value: 1, label: 'Farm' },
		{ value: 2, label: 'Roasting plant' },
		{ value: 3, label: 'Coffee shop' }
	];

	let farmRole = [
		{ value: 1, label: 'Harvester' },
		{ value: 2, label: 'Processor' },
		{ value: 3, label: 'Farm Packager' }
	];

	let roastingPlantRole = [
		{ value: 1, label: 'Warehouse Keeper' },
		{ value: 2, label: 'Roaster' },
		{ value: 3, label: 'Curer' },
		{ value: 4, label: 'Roasting Plant Packager' }
	];

	let coffeeShopRole = [
		{ value: 1, label: 'Store Keeper' },
		{ value: 2, label: 'Barista' }
	];

	let roleData = [];

	function workplaceChangeHandler(event) {
		const selectWorkplace = event.detail;
		roleValue = null;
		if (selectWorkplace) {
			switch (selectWorkplace.value) {
				case 1:
					roleData = [...farmRole];
					break;
				case 2:
					roleData = [...roastingPlantRole];
					break;
				case 3:
					roleData = [...coffeeShopRole];
					break;
			}
			roleDisabled = false;
		} else {
			roleData = [];
			roleDisabled = true;
		}
	}

	/** @param {{ currentTarget: EventTarget & HTMLFormElement}} event */
	async function handleFormSubmit(event) {
		const formData = new FormData(event.currentTarget);

		const _workPlace = JSON.parse(formData.get('workplace')).value;
		const _role = JSON.parse(formData.get('role')).value;
		const employeeAddress = formData.get('walletAddress');

		const isValidWallet = await isWalletValid(employeeAddress);

		if (!isValidWallet) {
			alert('Wallet address is incorrect, please try again.');
			return;
		}

		const sendData = { _workPlace, _role, employeeAddress };

		sendDataToContract(sendData);

		event.currentTarget.reset();
	}

	function handleFormReset() {
		workplaceValue = null;
		roleValue = null;
		roleData = [];
		roleDisabled = true;
	}

	async function sendDataToContract(data) {
		console.log(JSON.stringify(data));
		const txnHash = await setRoles(
			'CoffeeTraceability',
			data._workPlace,
			data._role,
			data.employeeAddress
		);
		if (txnHash) {
			alert('Complete register role with Transaction hash: ' + txnHash.hash);
		}
	}
</script>

<div class="grid place-content-center">
	{#if $workplaceValueStore == 99 && $roleValueStore == 99}
		<form on:submit|preventDefault={handleFormSubmit} on:reset={handleFormReset}>
			<h3 class="h3 text-center">Assign role for address</h3>
			<br />
			<label class="label" for="workplace">
				<span>Workplace<span class=" text-error-500">*</span></span>
				<Select
					name="workplace"
					items={workplace}
					placeholder="please select workplace..."
					class="select-svelte"
					required
					bind:value={workplaceValue}
					on:input={workplaceChangeHandler}
				>
					<div slot="item" let:item let:index class="select-svelte-list">
						{item.label}
					</div>
					<div slot="empty" class="select-svelte-empty">Not have any data...</div>
				</Select>
			</label>
			<br />
			<label class="label" for="role">
				<span>Process<span class=" text-error-500">*</span></span>
				<Select
					name="role"
					items={roleData}
					placeholder="please select role..."
					class="select-svelte"
					disabled={roleDisabled}
					required
					bind:value={roleValue}
				>
					<div slot="item" let:item let:index class="select-svelte-list">
						{item.label}
					</div>
					<div slot="empty" class="select-svelte-empty">Not have any data...</div>
				</Select>
			</label>
			<br />
			<label class="label" for="workplace">
				<span>Wallet Address<span class=" text-error-500">*</span></span>
				<input
					name="walletAddress"
					class="input rounded-md"
					title="Input (text)"
					type="text"
					placeholder="wallet address"
					required
				/>
			</label>

			<br />
			<div class="flex justify-around">
				<button class="btn variant-filled-primary w-28" type="submit">Register</button>
				<button class="btn variant-filled-error w-28" type="reset">Reset</button>
			</div>
		</form>
	{:else}
		<p>You don't have authorization on this page.</p>
		<br />
		<a href="/" class="btn variant-filled-secondary">back to main menu</a>
	{/if}
</div>
