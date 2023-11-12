
/**
 * @param {any} _interface
  * @param {string} methodName
 * @param {string} txnData
 */
export default async function decodeTxnData(_interface, methodName, txnData) {
    return await _interface.decodeFunctionData(methodName, txnData)[0];
}