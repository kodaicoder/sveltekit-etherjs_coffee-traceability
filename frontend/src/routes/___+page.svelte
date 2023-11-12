<script>
	// @ts-nocheck
	import SimpleStorage from '../contracts/SimpleStorage.json';
	import { onMount } from 'svelte';
	import { ethers } from 'ethers';
	import QRCode from 'easyqrcodejs';
	import {
		defaultEvmStores as evm,
		connected,
		provider,
		chainId,
		chainData,
		signer,
		signerAddress,
		contracts
	} from 'svelte-ethers-store';
	import QrReader from '$lib/components/QRReader.svelte';

	let QRCodeElement, scanData;
	let scanSuccess = false;
	let QROptions = {
		title: 'COFFEE TRACKER',
		titleFont: ' bold 24px Arial',
		titleHeight: 65,
		titleTop: 30, // content
		// subTitle: 'FARM-HARVEST(2023-10-23)', ////! this will be replace with Data from TXN hash
		subTitleFont: '18px Arial',
		subTitleTop: 50, // content
		//text: 'https://github.com/ushelp/EasyQRCodeJS', ////! this will be replace with TXN hash
		width: 300,
		height: 300,
		quietZone: 20,
		logo: './images/logo_color_circle.png',
		logoBackgroundTransparent: true,
		logoWidth: 100,
		logoHeight: 100,
		colorDark: '#412301',
		PI_TL: '#345700',
		PI_TR: '#345700',
		PI_BL: '#345700'
	};
	let customValue = 40;
	let storageValue = 0;
	let balance = 0;
	let valueByHash = 0;
	let loaded, iface, txnHash, accounts;
	$: historyTransactions = [];
	$: isMetaMaskPresent = false;
	$: setTimeout(() => {
		loaded = true;
	}, 200);

	onMount(async () => {
		iface = new ethers.utils.Interface(SimpleStorage.abi);
		isMetaMaskPresent = getMetaMaskPresent();
		window.ethereum?.on('accountsChanged', handleAccountsChanged);
		accounts = JSON.parse(window?.localStorage.getItem('accounts') ?? '[]');
		if (accounts?.length > 0) {
			await connectWallet();
		}
	});

	async function handleAccountsChanged(newAccounts) {
		if (Array.isArray(newAccounts) && newAccounts.length > 0 && newAccounts[0]) {
			setAccountToLocalStorage(newAccounts);
			accounts = JSON.parse(window?.localStorage.getItem('accounts'));

			if ($signerAddress) {
				historyTransactions = [];
				window?.location.reload();
			}
		} else {
			evm.disconnect();
			window?.localStorage.removeItem('accounts');
		}
	}

	const getMetaMaskPresent = () => {
		return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
	};

	async function connectWallet() {
		//! this test direct connect to ganache provider it self
		// const url = 'http://localhost:8545';
		// await evm.setProvider(url);
		await evm.setProvider();

		await setContract();

		await getBalance();
		await getStorageData();

		setAccountToLocalStorage([$signerAddress]);
	}

	function setAccountToLocalStorage(newAccounts) {
		localStorage.setItem('accounts', JSON.stringify(newAccounts));
	}

	async function setContract() {
		// Use web3 to get the user's accounts.
		//accounts = await $provider.listAccounts();

		// Get the contract instance.
		//const networkId = await $provider.net.getId();

		const deployedNetwork = SimpleStorage.networks[$chainId];
		//const deployedNetwork = SimpleStorage.networks[$chainId];
		await evm.attachContract(
			'SimpleStorage',
			deployedNetwork.address,
			SimpleStorage.abi,
			accounts[0] ?? $signerAddress
		);

		//contract = new $web3.eth.Contract(SimpleStorage.abi, deployedNetwork.address);
	}

	async function setStorageData() {
		// Stores a given value, 25 by default.
		//await contract.methods.setStoredData(25).send({ from: accounts[0] });
		//await $contracts.SimpleStorage.methods.setStoredData(25).send({ from: accounts[0] });
		const txn = await $contracts.SimpleStorage.setStoredData(customValue, {
			from: accounts[0] ?? $signerAddress
		});
		try {
			// Wait for the transaction to complete.
			const result = await txn.wait();
			txnHash = result.transactionHash;
			await getBalance();
			await getStorageData();
		} catch (error) {
			// Handle the error.
			console.log('Transaction error!: ', error);
		}
	}

	async function getStorageData() {
		// Get the value from the contract to prove it worked.
		//const response = await contract.methods.getStoredData().call();
		const response = await $contracts.SimpleStorage.getStoredData();
		// set the storageValue
		storageValue = response;
	}

	async function getBalance() {
		const response = await $contracts.SimpleStorage.getYourBalance();
		// set the storageValue
		balance = response;
	}

	async function getDataByTransactionHash() {
		const txnData = await $provider.getTransaction(txnHash);
		valueByHash = iface.decodeFunctionData('setStoredData', txnData.data)[0];
		buildQRCode(txnHash, valueByHash);
	}

	async function getHistoryTransactions() {
		try {
			let recentBlockNumber = await $provider.getBlockNumber();

			historyTransactions = [];
			for (let i = recentBlockNumber; i >= 0; i--) {
				const block = await $provider.getBlockWithTransactions(i);
				block.transactions.forEach((txn) => {
					if (txn.from === $signerAddress) {
						historyTransactions = [...historyTransactions, txn.hash];
					}
				});
			}
		} catch (error) {
			console.error('Error:', error);
		}

		console.log(historyTransactions);
	}

	async function buildQRCode(txnHash, data) {
		QROptions.subTitle = `TEST DATA : ${data}`;
		QROptions.text = `${txnHash}`;
		QRCodeElement.innerHTML = '';
		new QRCode(QRCodeElement, QROptions);
	}

	async function scanSuccessHandler(event) {
		scanSuccess = true;
		scanData = event.detail.txnHash;
	}
</script>

{#if loaded}
	{#if isMetaMaskPresent}
		{#if $connected && accounts[0]}
			<div class="box">
				<div class="col-8 offset-2">
					<h1 class="text-center text-primary">Skeleton SvelteKit with Ether.js</h1>

					<h3>Smart Contract Example</h3>
					<p>get and set to stored data</p>
					<p>The stored value is: {storageValue}</p>
					<p>your balance is:{balance}</p>
					<button on:click={getBalance}>get your balance</button>
					<button on:click={getStorageData}>get storage data</button>
					<input bind:value={customValue} />
					<button on:click={setStorageData}>set {customValue} to storage</button>
					<br />
					<br />
					<input bind:value={txnHash} style="width:30rem" />
					<button on:click={getDataByTransactionHash}>Get data by transaction hash</button>
					<p>data from transaction hash : {valueByHash}</p>
					<div id="qrcode" bind:this={QRCodeElement} />
					<br />
					<button on:click={getHistoryTransactions}>get history transactions</button>
					<h3>History Transactions</h3>
					{#each historyTransactions as txnHash}
						<p>{txnHash}</p>
					{/each}

					<br />
					<br />
					<QrReader on:scanSuccess={scanSuccessHandler} />

					{#if scanSuccess}
						<p style="color:green">Scan Success | txnHash : {scanData}</p>
					{/if}
				</div>
			</div>
		{:else}
			<button on:click={connectWallet}> Connect wallet</button>
		{/if}
	{:else}
		<p>We using MetaMask as wallet provider, Please install MetaMask before using</p>
	{/if}
{:else}
	<p>Loading...</p>
{/if}

<footer>
	{#if $connected && accounts[0]}
		<p style="color:green">Blockchain is connected! | Account : {$signerAddress}</p>
	{/if}
</footer>
