import { ethers } from 'ethers';

/** @param {string} wallet_address */
export default async function isWalletValid(wallet_address) {
    return await ethers.utils.isAddress(wallet_address);
}