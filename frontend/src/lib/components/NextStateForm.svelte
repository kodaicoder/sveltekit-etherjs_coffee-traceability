<script>
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import { datePicker } from 'svelte-flatpickr-plus';
	import QRCode from 'easyqrcodejs';
	import QrReader from '$lib/components/QRReader.svelte';
	import {
		roleStore,
		workplaceStore,
		workplaceValueStore,
		roleValueStore
	} from '$lib/stores/role.js';
	import {
		verifyTxHashAndTraceId,
		getTraceability,
		updateTraceability
	} from '$lib/utils/contractActions';

	import { provider } from 'svelte-ethers-store';

	import { contractInterfaceStore } from '$lib/stores/contractInterface';
	import { decodeDefault } from '$lib/utils/decodeTxnData';

	const coffeeSpecie = [
		{ value: 1, label: 'Arabica' },
		{ value: 2, label: 'Robusta' },
		{ value: 3, label: 'Liberica' },
		{ value: 4, label: 'Excelsa' }
	];

	let dateOptions = {
		dateFormat: 'Z',
		altFormat: 'd F Y',
		altInput: true,
		maxDate: 'today',
		minDate: new Date(),
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

	let CompleteQROptions = {
		correctLevel: QRCode.CorrectLevel.L,
		title: 'COFFEE TRACKER',
		titleFont: ' bold 24px Arial',
		titleHeight: 65,
		titleTop: 30,
		subTitle: '',
		subTitleFont: '18px Arial',
		subTitleTop: 50,
		text: '',
		width: 350,
		height: 350,
		quietZone: 30,
		logo: './images/logo_color_circle.png',
		logoBackgroundTransparent: true,
		logoWidth: 100,
		logoHeight: 100,
		colorDark: '#412301',
		PI_TL: '#345700',
		PI_TR: '#345700',
		PI_BL: '#345700'
	};

	let scanSuccess = false;

	/**
	 * @type {{ farmName: string; harvestingAreaName: string; workPlace: string; role: string; dateStamp: string; coffeeSpecie: number; }[] | null}
	 */
	let traceData = null;

	/**
	 * @type {{traceId: string,txhash: string} | null}
	 */
	let scannedData = null;

	/**
	 * @type {string|undefined}
	 */
	let coffeeSpecieValue;

	/**
	 * @type {any}
	 */
	let completeDate;

	/**
	 * @type {HTMLDivElement}
	 */
	let QRCodeElement;

	/**
	 * @type {QRCode}
	 */
	let QRShower;

	let trackerBuildSuccess = false;

	$: console.log($workplaceValueStore);
	$: console.log($roleValueStore);

	/** @param {{ detail: { scanData: any; }; }} event	 */
	async function scanSuccessHandler(event) {
		scanSuccess = true;
		scannedData = event.detail.scanData;
		console.log(scannedData);
		//////! IMPLEMENT DECODED DATA HERE
		if (scannedData) {
			if (!(await verifyTxHashAndTraceId(scannedData.traceId, scannedData.txhash))) {
				return;
			}
			traceData = await getTraceability('CoffeeTraceability', +scannedData.traceId);
			console.log(traceData);
			if (traceData && traceData?.length > 0) {
				const baseData = traceData[traceData.length - 1];
				const coffeeSpecieLabel = coffeeSpecie.find(
					(/** @type {{ value: any; }} */ s) => s.value == +baseData?.coffeeSpecie.toString() + 1
				)?.label;
				coffeeSpecieValue = coffeeSpecieLabel;

				const timestamp = Date.parse(baseData.dateStamp);
				dateOptions.minDate = new Date(timestamp);
			}
		} else {
			return;
		}
	}

	/** @param {{ currentTarget: EventTarget & HTMLFormElement}} event */
	async function handleFormSubmitNextState(event) {
		const submitForm = event.currentTarget;
		const formData = new FormData(submitForm);
		const _traceId = scannedData?.traceId ?? 0;
		const _nextStateDate = formData.get('nextStateDate')?.toString();
		const _previousTransaction = scannedData?.txhash ?? '';

		let localDateString = new Date().toDateString();
		// Create a Date object from the UTC string
		if (_nextStateDate) {
			const utcDate = new Date(_nextStateDate);
			localDateString = Intl.DateTimeFormat('en-GB', {
				dateStyle: 'medium',
				timeZone: 'Asia/Bangkok'
			}).format(utcDate);
		}
		completeDate = localDateString;
		const sendData = {
			coffeeId: +_traceId,
			dateStamp: localDateString,
			previousTransaction: _previousTransaction
		};

		const txnData = await sendDataToContract(sendData);
		if (txnData) {
			submitForm.reset();
			trackerBuildSuccess = true;

			const traceId = await decodeData(txnData.logs[0].data);
			if (traceId) {
				if ($workplaceValueStore != 3) {
					await buildQRCode(traceId, txnData.transactionHash);
				} else if ($roleValueStore != 2) {
					await buildQRCode(traceId, txnData.transactionHash);
				} else {
					//! if you a barista , need to create new qr code that suppose to using to show offchain data to customer
					const completeTraceData = await getTraceability('CoffeeTraceability', +traceId);
					await buildOffChainQRCode(completeTraceData, txnData.transactionHash);
				}
			}
		}
	}

	/**
	 * @param {{ coffeeId: number; dateStamp: any; previousTransaction: string;}} data
	 */
	async function sendDataToContract(data) {
		return await updateTraceability(
			'CoffeeTraceability',
			data.coffeeId,
			data.dateStamp,
			data.previousTransaction
		);
	}

	/**
	 * @param {any} traceId
	 * @param {string} txhash
	 */
	async function buildQRCode(traceId, txhash) {
		QROptions.subTitle = `${$roleStore}-${$workplaceStore}(${completeDate})`;
		const qrData = { traceId: `${traceId[0]}`, txhash };
		QROptions.text = JSON.stringify(qrData);
		QRCodeElement.innerHTML = '';
		QRShower = new QRCode(QRCodeElement, QROptions);
	}

	/**
	 * @param {any[]} completeTraceData
	 * @param {string} lastTxHash
	 */
	async function buildOffChainQRCode(completeTraceData, lastTxHash) {
		CompleteQROptions.subTitle = `Before it became this cup of coffee!`;

		const staticData = {
			farmName: completeTraceData[0].farmName,
			harvestingAreaName: completeTraceData[0].harvestingAreaName,
			coffeeSpecie: completeTraceData[0].coffeeSpecie
		};
		const historyData = [];

		for (let i = 0; i < completeTraceData.length; i++) {
			historyData.push({
				workPlace: completeTraceData[i].workPlace,
				role: completeTraceData[i].role,
				dateStamp: completeTraceData[i].dateStamp
			});
		}
		const allData = {
			...staticData,
			historyData
		};
		const dataString = JSON.stringify(allData);

		// Encode the JSON string
		const encodedData = encodeURIComponent(dataString);

		// Create the URL with the encoded data as a query parameter
		const baseUrl = window.location.origin; // Gets the current root URL
		const customerUrl = `${baseUrl}/customer?data=${encodedData}`;
		CompleteQROptions.text = customerUrl;
		QRCodeElement.innerHTML = '';
		QRShower = new QRCode(QRCodeElement, CompleteQROptions);
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

	/**
	 * @param {string} txnData
	 */
	async function decodeData(txnData) {
		if ($contractInterfaceStore && txnData) {
			return await decodeDefault(['uint256'], txnData);
		}
	}
</script>

<div class="grid place-content-center text-center">
	{#if !scanSuccess}
		<p>Please scan your product QR Code first</p>
		<QrReader on:scanSuccess={scanSuccessHandler} />
	{:else}
		{#if !trackerBuildSuccess}
			{#if traceData && traceData.length > 0}
				<Accordion class="card p-2 ">
					<AccordionItem class="w-[750px]" open>
						<svelte:fragment slot="lead"
							><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
								><path
									fill="currentColor"
									d="M12 21q-3.45 0-6.013-2.288T3.05 13H5.1q.35 2.6 2.313 4.3T12 19q2.925 0 4.963-2.038T19 12q0-2.925-2.038-4.963T12 5q-1.725 0-3.225.8T6.25 8H9v2H3V4h2v2.35q1.275-1.6 3.113-2.475T12 3q1.875 0 3.513.713t2.85 1.924q1.212 1.213 1.925 2.85T21 12q0 1.875-.713 3.513t-1.924 2.85q-1.213 1.212-2.85 1.925T12 21Zm2.8-4.8L11 12.4V7h2v4.6l3.2 3.2l-1.4 1.4Z"
								/></svg
							></svelte:fragment
						>
						<svelte:fragment slot="summary"><strong>Previous product data</strong></svelte:fragment>
						<svelte:fragment slot="content">
							<div class="grid place-content-center text-center mt-4">
								<div class="table-container">
									<table class="table table-hover">
										<thead>
											<tr>
												<th>Farm Name</th>
												<th>Area Name</th>
												<th>Workplace</th>
												<th>Role</th>
												<th>Date Stamp</th>
												<th>Coffee Specie</th>
												<!-- <th>All Previous Txn</th> -->
											</tr>
										</thead>
										<tbody>
											{#each traceData as data}
												<tr>
													<td>{data.farmName}</td>
													<td>{data.harvestingAreaName}</td>
													<td>{data.workPlace}</td>
													<td>{data.role}</td>
													<td>{data.dateStamp}</td>
													<td
														>{coffeeSpecie.find(
															(s) => s.value == +data?.coffeeSpecie.toString() + 1
														)?.label}</td
													>
													<!-- <td>{@html scanData.trackState.join('<br />')}</td> -->
												</tr>
											{/each}
										</tbody>
									</table>
								</div>
							</div>
							<br />
						</svelte:fragment>
					</AccordionItem>
				</Accordion>

				<br />
				<div class="grid place-content-center text-center">
					<h3 class="h3 underline">Please verify the data below</h3>
					<br />
					<form
						id="nextStateForm"
						name="nextStateForm"
						on:submit|preventDefault={handleFormSubmitNextState}
					>
						<div class="text-left">
							<label class="label" for="workplace">
								<span>Farm name</span>
								<input
									name="farmName"
									class="input rounded-md"
									title="Input (text)"
									type="text"
									placeholder="Farm name ..."
									disabled
									bind:value={traceData[0].farmName}
								/>
							</label>
							<br />
							<label class="label" for="workplace">
								<span>Harvesting area name</span>
								<input
									name="harvestingAreaName"
									class="input rounded-md"
									title="Input (text)"
									type="text"
									placeholder="Harvesting area name ..."
									disabled
									bind:value={traceData[0].harvestingAreaName}
								/>
							</label>

							<br />
							<label class="label" for="coffeeSpecie">
								<span>Coffee specie</span>
								<input
									name="coffeeSpecie"
									class="input rounded-md"
									title="Input (text)"
									type="text"
									disabled
									bind:value={coffeeSpecieValue}
								/>
							</label>
							<br />
							<label class="label" for="nextStateDate">
								{#if !trackerBuildSuccess && $workplaceValueStore != 3 && $roleValueStore != 2}
									<span>Your completed date<span class=" text-error-500">*</span></span>
								{:else}
									<span>Coffee brewing date<span class=" text-error-500">*</span></span>
								{/if}
								<input
									use:datePicker={dateOptions}
									name="nextStateDate"
									class="input rounded-md"
									title="Input (date)"
									type="text"
									placeholder="Please select your complete date.."
									required
								/>
							</label>
						</div>
					</form>
				</div>
			{/if}
		{/if}
		<br />
		<div class="flex flex-col items-center gap-4">
			{#if !trackerBuildSuccess}
				{#if $workplaceValueStore != 3}
					<button class="btn variant-filled-primary" type="submit" form="nextStateForm">
						Push this product to next step
					</button>
					<h3>OR</h3>
				{:else if $roleValueStore != 2}
					<button class="btn variant-filled-primary" type="submit" form="nextStateForm">
						Push this product to next step
					</button>
					<h3>OR</h3>
				{:else}
					<button class="btn variant-filled-success" type="submit" form="nextStateForm">
						Create QR Code for customer
					</button>
					<h3>OR</h3>
				{/if}
			{/if}
			<button
				class="btn variant-filled-secondary"
				on:click={() => {
					scanSuccess = false;
					trackerBuildSuccess = false;
					QRShower.clear();
				}}
			>
				Scan another product
			</button>
		</div>
	{/if}

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
</div>
