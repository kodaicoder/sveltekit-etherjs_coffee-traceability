<script>
	import Select from 'svelte-select';
	import { datePicker } from 'svelte-flatpickr-plus';
	import QRCode from 'easyqrcodejs';
	import { contractInterfaceStore } from '$lib/stores/contractInterface';

	import { roleStore, workplaceStore } from '$lib/stores/role.js';
	import { startTraceability } from '$lib/utils/contractActions';
	import { decodeDefault } from '$lib/utils/decodeTxnData';

	/**
	 * @type {any}
	 */
	let farmName;
	/**
	 * @type {any}
	 */
	let harvestingAreaName;

	/**
	 * @type {any}
	 */
	let harvestingDate;

	/**
	 * @type {string}
	 */
	let coffeeSpecieValue;

	/**
	 * @type {string[]}
	 */
	let trackState = [];

	/**
	 * @type {HTMLDivElement}
	 */
	let QRCodeElement;

	let trackerBuildSuccess = false;

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
		wrap: true,
		allowInput: true
	};
	let QROptions = {
		title: 'COFFEE TRACKER',
		titleFont: ' bold 24px Arial',
		titleHeight: 65,
		titleTop: 30,
		subTitle: '',
		subTitleFont: '18px Arial',
		subTitleTop: 50,
		text: '',
		width: 300,
		height: 300,
		quietZone: 40,
		logo: './images/logo_color_circle.png',
		logoBackgroundTransparent: true,
		logoWidth: 100,
		logoHeight: 100,
		colorDark: '#412301',
		PI_TL: '#345700',
		PI_TR: '#345700',
		PI_BL: '#345700'
	};

	/** @param {{ currentTarget: EventTarget & HTMLFormElement}} event */
	async function handleFormSubmitHarvest(event) {
		const submitForm = event.currentTarget;
		const formData = new FormData(submitForm);

		const _farmName = formData.get('farmName')?.toString();
		const _areaName = formData.get('harvestingAreaName')?.toString();
		const _createDate = formData.get('harvestDate')?.toString();
		const _coffeeSpecie = JSON.parse(
			formData.get('coffeeSpecie')?.toString() || '{value:0, label: ""}'
		);

		let localDateString = new Date().toDateString();
		// Create a Date object from the UTC string
		if (_createDate) {
			const utcDate = new Date(_createDate);

			localDateString = Intl.DateTimeFormat('en-GB', {
				dateStyle: 'medium',
				timeZone: 'Asia/Bangkok'
			}).format(utcDate);
		}

		const sendData = {
			farmName: _farmName,
			harvestingAreaName: _areaName,
			workplace: $workplaceStore,
			role: $roleStore,
			dateStamp: localDateString,
			coffeeSpecie: +_coffeeSpecie.value,
			trackState
		};

		harvestingDate = localDateString;

		const txnData = await sendDataToContract(sendData);
		if (txnData) {
			submitForm.reset();
			trackerBuildSuccess = true;

			const traceId = await decodeData(txnData.logs[0].data);
			if (traceId) {
				await buildQRCode(traceId, txnData.transactionHash);
			}
		}
	}
	/**
	 * @param {string} txnData
	 */
	async function decodeData(txnData) {
		if ($contractInterfaceStore && txnData) {
			return await decodeDefault(['uint256'], txnData);
		}
	}

	function handleFormReset() {
		farmName = null;
		harvestingAreaName = null;
		coffeeSpecieValue = '';
	}

	/**
	 * @param {{ farmName: any; harvestingAreaName: any; workplace?: string | null; role?: string | null; dateStamp: any; coffeeSpecie: any; trackState?: string[]; }} data
	 */
	async function sendDataToContract(data) {
		return await startTraceability(
			'CoffeeTraceability',
			data.farmName,
			data.harvestingAreaName,
			data.dateStamp,
			data.coffeeSpecie
		);
	}

	/**
	 * @param {any} traceId
	 * @param {string} txhash
	 */
	async function buildQRCode(traceId, txhash) {
		QROptions.subTitle = `${$roleStore}-${$workplaceStore}(${harvestingDate})`;
		const qrData = { traceId: `${traceId[0]}`, txhash };
		QROptions.text = JSON.stringify(qrData);
		QRCodeElement.innerHTML = '';
		new QRCode(QRCodeElement, QROptions);
	}

	function downloadClickHandler() {
		const link = document.createElement('a');
		const runner = new Date().getTime();
		link.download = `QR Code_${$roleStore}-${$workplaceStore}_${runner}.png`;
		// @ts-ignore
		link.href = document.querySelector('#qrcode canvas')?.toDataURL('image/png');
		link.click();
		document.removeChild(link);
	}
</script>

<form on:submit|preventDefault={handleFormSubmitHarvest} on:reset={handleFormReset}>
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
				bind:value={farmName}
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
				bind:value={harvestingAreaName}
			/>
		</label>
		<br />
		<label class="label" for="workplace">
			<span>Harvesting date<span class=" text-error-500">*</span></span>
			<div class="flex [&_input]:!cursor-pointer" use:datePicker={dateOptions}>
				<input
					name="harvestDate"
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
{#if trackerBuildSuccess}
	<br />
	<div class="grid place-content-center text-center">
		<p>Please download and print this QR code</p>
		<p>and attach it on your product</p>
		<br />
		<button class="btn variant-filled-secondary" on:click={downloadClickHandler}>Download</button>
	</div>
	<br />
{/if}
<div class="grid place-content-center">
	<div id="qrcode" bind:this={QRCodeElement} />
</div>
