import BigNumber from 'bignumber.js'
// import { ethers } from 'ethers'
import { Contract } from '@ethersproject/contracts'
import { MaxUint256 } from '@ethersproject/constants'
import { parseEther } from '@ethersproject/units'

export const buy = async (presaleContract: Contract, buyAmount: string, referralAddress: string) => {
    return presaleContract.buy(referralAddress, {
        value: parseEther(buyAmount)
    })
}