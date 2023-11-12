import { writable } from 'svelte/store';
import { ethers } from 'ethers';
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

/** @param {AbiObject[]} contractABI */
function createContractInterface(contractABI) {
    /** @type {any} */
    let _interface = null;
    if (contractABI) {
        _interface = setInterface(contractABI);
    }
    const { subscribe, set, update } = writable(_interface);

    return {
        subscribe,
        /** @param {any} contractABI */
        updateContract: (contractABI) => {
            const c_interface = setInterface(contractABI);
            update(() => c_interface);
        },
        clearInterface: () => set(null)
    };
}
/** @param {AbiObject[]} contractABI */
function setInterface(contractABI) {
    return new ethers.utils.Interface(contractABI);
}

export const contractInterfaceStore = createContractInterface([]);