<script>
	import { page } from '$app/stores';
	import { contractInterfaceStore } from '$lib/stores/contractInterface';
	import decoder from '$lib/utils/decodeTxnData';
	$: $contractInterfaceStore, decodeTxnData();
	let data = 0;

	let txnData = $page.url.searchParams.get('txn');

	async function decodeTxnData() {
		if ($contractInterfaceStore && txnData) {
			data = await decoder($contractInterfaceStore, 'setStoredData', txnData);
		}
	}
</script>

<div class="grid place-content-center">
	<h1 class="h1">CUSTOMER</h1>

	<h1 class="h1">DATA IS : {data}</h1>
</div>
