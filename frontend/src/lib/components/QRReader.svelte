<script>
	// @ts-nocheck

	import { onMount, createEventDispatcher } from 'svelte';
	import { Html5QrcodeScanner } from 'html5-qrcode';
	let isScanSuccess = false;
	let html5QrcodeScanner, QRReaderElement;
	const dispatch = createEventDispatcher();
	let stream;

	onMount(async () => {
		const stopButton = QRReaderElement.querySelector('#html5-qrcode-button-camera-stop');
		async function createQRScanner() {
			html5QrcodeScanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: 250 });
			html5QrcodeScanner.render(onScanSuccess);
		}

		stream = await navigator.mediaDevices.getUserMedia({
			video: { facingMode: 'environment' }
		});

		function onScanSuccess(decodedText, decodedResult) {
			// Handle on success condition with the decoded text or result.
			console.log(`Scan result: ${decodedText}`, decodedResult);
			QRReaderElement.querySelector('#html5-qrcode-button-camera-stop').click();
			isScanSuccess = true;
			//really stop accessing client camera

			dispatch('scanSuccess', { txnHash: decodedText });
		}

		stream.getTracks().forEach(function (track) {
			track.stop();
		});

		createQRScanner();
	});
</script>

<div
	class=" w-[400px] bg-surface-500-400-token [&_img]:mx-auto"
	id="reader"
	bind:this={QRReaderElement}
/>
