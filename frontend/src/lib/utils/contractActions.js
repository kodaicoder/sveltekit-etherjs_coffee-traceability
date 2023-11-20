import {
    provider,
    signerAddress,
    contracts
} from 'svelte-ethers-store';
import { get } from 'svelte/store';
import { decodeDefault } from './decodeTxnData';


/**
 * @param {string} abiName
 * @param {string} address
 * @param {number} role
 * @param {number} workplace
*/
export async function setRoles(abiName, workplace, role, address) {
    const txn = await get(contracts)[abiName]["register"](workplace, role, address, {
        from: get(signerAddress)
    });
    try {
        // Wait for the transaction to complete.
        const result = await txn.wait();
        const txnHash = result.transactionHash;
        return await get(provider).getTransaction(txnHash);
    } catch (ex) {
        // Handle the error.
        alert(`Transaction error!: ${ex}`);
        return false;
    }
}

/**
 * @param {string} abiName
 * @param {number} traceId
 */
export async function getTraceability(abiName, traceId) {
    return await get(contracts)[abiName]["getCoffeeTraceability"](traceId);
}

/**
 * @param {string} abiName
 * @param {string} farmName
 * @param {string} harvestingAreaName
 * @param {string} dateStamp
 * @param {number} coffeeSpecie
 */
export async function startTraceability(abiName, farmName, harvestingAreaName, dateStamp, coffeeSpecie) {
    const txn = await get(contracts)[abiName]["startCoffeeTraceability"](farmName, harvestingAreaName, dateStamp, coffeeSpecie, {
        from: get(signerAddress)
    });
    try {
        // Wait for the transaction to complete.
        const result = await txn.wait();
        const txnHash = result.transactionHash;
        return await get(provider).getTransactionReceipt(txnHash);
        //return await get(provider).getTransaction(txnHash);
    } catch (ex) {
        // Handle the error.
        alert(`Transaction error!: ${ex}`);
        return false;
    }
}

/**
 * @param {string } abiName
 * @param {number} coffeeId
 * @param {string} dateStamp
 * @param {string} previousTransaction
 */
export async function updateTraceability(abiName, coffeeId, dateStamp, previousTransaction) {
    const txn = await get(contracts)[abiName]["updateCoffeeTraceability"](coffeeId, dateStamp, previousTransaction, {
        from: get(signerAddress)
    });
    try {
        // Wait for the transaction to complete.
        const result = await txn.wait();
        const txnHash = result.transactionHash;
        return await get(provider).getTransactionReceipt(txnHash);
    } catch (ex) {
        // Handle the error.
        alert(`Transaction error!: ${ex}`);
        return false;
    }
}


/**
 * @param {string} abiName
 * @param {string} methodName
 */
export async function getData(abiName, methodName) {
    return await get(contracts)[abiName][methodName]();
}


export async function getTxnDataHistory() {
    /**
     * @typedef {object[]} historyTransactionType
     * @property {string=} hash - The name property of each object.
     * @property {string=} data - The name property of each object.
     * @property {string=} error - The name property of each object.
     */

    /**
        * @type {historyTransactionType} - The array of objects with names.
    */
    let historyTransactions = [];
    try {
        const recentBlockNumber = await get(provider).getBlockNumber();
        for (let i = recentBlockNumber; i >= 0; i--) {
            const block = await get(provider).getBlockWithTransactions(i);
            block.transactions.forEach((txn) => {
                const signer = get(signerAddress);
                if (txn.from === signer && txn.to !== null && txn.data !== '0x') {
                    historyTransactions = [...historyTransactions, { hash: txn.hash, data: txn.data }];
                }
            });
        }
    } catch (error) {
        console.error('Error:', error);
        historyTransactions = [{ error: "Error on getting transaction history." }];
    }
    return historyTransactions;
}


/**
 * @param {string} traceId
 * @param {string} txnHash
 */
export async function verifyTxHashAndTraceId(traceId, txnHash) {
    const txData = await get(provider).getTransactionReceipt(txnHash);
    const dataHashFromtx = txData.logs[0].data.toString();
    const traceIdFromtx = (await decodeDefault(['uint256'], dataHashFromtx)).toString();
    return traceId == traceIdFromtx;
}