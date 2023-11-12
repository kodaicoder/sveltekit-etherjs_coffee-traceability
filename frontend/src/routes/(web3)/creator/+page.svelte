<script>
	import Select from 'svelte-select';
	import { datePicker } from 'svelte-flatpickr-plus';
	import QrReader from '$lib/components/QRReader.svelte';
	import {
		roleStore,
		workplaceStore,
		workplaceValueStore,
		roleValueStore
	} from '$lib/stores/role.js';

	let coffeeSpecieValue = '';
	const coffeeSpecie = [
		{ value: 1, label: 'Arabica' },
		{ value: 2, label: 'Robusta' },
		{ value: 3, label: 'Liberica' },
		{ value: 4, label: 'Excelsa' }
	];

	const dateOptions = {
		dateFormat: 'Z',
		altFormat: 'd F Y',
		altInput: true,
		maxDate: 'today',
		defaultDate: 'today',
		wrap: true
	};

	let scanSuccess = false;
	let scanData;

	/**
	 * @param {{ detail: { txnHash: any; }; }} event
	 */
	async function scanSuccessHandler(event) {
		scanSuccess = true;
		scanData = event.detail.txnHash;
	}
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
			<form>
				<div class="max-w-sm mx-auto">
					<label class="label" for="workplace">
						<span>Farm name<span class=" text-error-500">*</span></span>
						<input
							name="farmName"
							class="input rounded-md"
							title="Input (text)"
							type="text"
							placeholder="Farm name ..."
							required
						/>
					</label>
					<br />
					<label class="label" for="workplace">
						<span>Harvesting area name<span class=" text-error-500">*</span></span>
						<input
							name="harvestingAreaName"
							class="input rounded-md"
							title="Input (text)"
							type="text"
							placeholder="Harvesting area name ..."
							required
						/>
					</label>
					<br />
					<label class="label" for="workplace">
						<span>Harvesting date<span class=" text-error-500">*</span></span>
						<div class="flex [&_input]:!cursor-pointer" use:datePicker={dateOptions}>
							<input
								name="harvestingAreaName"
								class="input rounded-md"
								title="Input (date)"
								type="text"
								placeholder="Harvesting date ..."
								required
								data-input
							/>
							<button
								type="button"
								title="clear harvesting date"
								class="btn-icon variant-filled-error rounded-sm"
								data-clear
							>
								✖
							</button>
						</div>
					</label>
					<br />
					<label class="label" for="workplace">
						<span>Coffee specie<span class=" text-error-500">*</span></span>
						<Select
							name="coffeeSpecie"
							items={coffeeSpecie}
							placeholder="please select coffee bean specie..."
							class="select-svelte"
							required
							bind:value={coffeeSpecieValue}
						>
							<div slot="item" let:item let:index class="select-svelte-list">
								{item.label}
							</div>
							<div slot="empty" class="select-svelte-empty">Not have any data...</div>
						</Select>
					</label>
					<br />
					<div class="flex justify-around">
						<button class="btn variant-filled-primary w-28" type="submit">Submit</button>
						<button class="btn variant-filled-error w-28" type="reset">Reset</button>
					</div>
				</div>
			</form>
		{:else if $workplaceValueStore != 99 && $roleValueStore != 99}
			<div class="grid place-content-center text-center">
				<p>Please scan your product QR Code first</p>
				<QrReader on:scanSuccess={scanSuccessHandler} />
			</div>
		{:else}
			<div class="grid place-content-center text-center">
				<p>You are contract manager, you only can register wallet for employee</p>
			</div>
		{/if}
	</div>
</div>
