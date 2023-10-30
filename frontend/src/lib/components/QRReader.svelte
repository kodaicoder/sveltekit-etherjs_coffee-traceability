<script>
	// @ts-nocheck

	import { onMount, createEventDispatcher } from 'svelte';
	import { Html5QrcodeScanner } from 'html5-qrcode';
	let isScanSuccess = false;
	let html5QrcodeScanner, QRReaderElement;
	const dispatch = createEventDispatcher();
	onMount(async () => {
		async function createQRScanner() {
			html5QrcodeScanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: 250 });
			html5QrcodeScanner.render(onScanSuccess);
		}

		function onScanSuccess(decodedText, decodedResult) {
			// Handle on success condition with the decoded text or result.
			console.log(`Scan result: ${decodedText}`, decodedResult);
			QRReaderElement.querySelector('#html5-qrcode-button-camera-stop').click();
			isScanSuccess = true;
			dispatch('scanSuccess', { txnHash: decodedText });
		}

		createQRScanner();
	});
</script>

<div style="width: 450px;" id="reader" bind:this={QRReaderElement} />
