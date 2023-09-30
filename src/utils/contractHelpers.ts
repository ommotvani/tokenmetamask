import { Contract } from '@ethersproject/contracts'
import PRESALE_ABI from '../constants/abis/presale.json'
import { getContract } from './index'

export function getPresaleContract(presaleAddress?: string, library?: any, account?: string | null, withSignerIfPossible = true): Contract | null {
    if (!presaleAddress || !library) return null
    return getContract(presaleAddress, PRESALE_ABI, library, withSignerIfPossible && account ? account : undefined)
}