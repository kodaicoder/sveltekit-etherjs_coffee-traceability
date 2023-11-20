import { ethers } from 'ethers';
/**
 * @param {any} _interface
  * @param {string} methodName
 * @param {string} txnData
 */
export default async function decodeTxnData(_interface, methodName, txnData) {
    return await _interface.decodeFunctionData(methodName, txnData)[0];
}

/**
 * @param {any} _interface
  * @param {string} methodName
 * @param {string} txnData
 */
export async function decodeTxnDataArray(_interface, methodName, txnData) {
    return await _interface.decodeFunctionData(methodName, txnData);
}



/**
 * @param {(string | ethers.utils.ParamType)[]} arrayOfDataType
 * @param {ethers.utils.BytesLike} txnData
 */
export async function decodeDefault(arrayOfDataType, txnData) {
    return await ethers.utils.defaultAbiCoder.decode(arrayOfDataType, txnData);
}