import { useCallback, useEffect, useState } from 'react'
import { formatEther } from '@ethersproject/units'
import { isAddress } from '../utils'

import { useActiveWeb3React } from './index'
import { getPresaleContract } from '../utils/contractHelpers'
import { toast } from 'react-toastify';
import { buy } from '../utils/callHelpers'

const PRESALE_ADDRESS = "0x62FFfbbACE9d37d3f31F4be87B6319C41E9b60ab"

export const useFetchDetails = () => {
    const { provider, account, chainId } = useActiveWeb3React()
    const presaleContract = getPresaleContract(PRESALE_ADDRESS, provider, account)

    const handleFetchDetails = useCallback(async () => {
        try {
            if(!presaleContract) return null
            const saleToken = await presaleContract?.saleToken()
            const price: any = (await presaleContract?.price())
            const tokenReserveAddress = await presaleContract?.tokenReserveAddress()
            const collectionAddress = await presaleContract?.collectionAddress()
            const min = await presaleContract?.min()
            const max = await presaleContract?.max()
            const tokenForSale = await presaleContract?.tokenForSale()
            const tokenSold = await presaleContract?.tokenSold()
            let purchased = 0
            if(account) {
                purchased = await presaleContract?.userPurchased(account)
            }
            return {
                saleToken: saleToken,
                tokenReserveAddress: tokenReserveAddress,
                collectionAddress: collectionAddress,
                min: formatEther(min),
                max: formatEther(max),
                tokenForSale: formatEther(tokenForSale),
                price: 1 / Number(price),
                tokenSold: formatEther(tokenSold),
                purchased: formatEther(purchased)
            }
        } catch (e: any) {
            toast.error(e.reason || e.message)
            return false
        }
    }, [account, chainId, presaleContract, provider])

    return { onFetchDetails: handleFetchDetails }
}

export const useBuy = () => {
    const { provider, account, chainId } = useActiveWeb3React()
    const presaleContract = getPresaleContract(PRESALE_ADDRESS, provider, account)

    const handleBuy = useCallback(async (referralAddress: string | null, buyAmount: string) => {
        console.log(referralAddress, buyAmount)
        if(!account) {
            toast.error("Please connect wallet")
            return null
        }
        try {
            let _referralAddress = "0x0000000000000000000000000000000000000000"
            if(referralAddress) {
                if(isAddress(referralAddress)) {
                    _referralAddress = referralAddress
                } else {
                    toast.error('Invalid referral address')
                }
            }
            if (!provider || !account || !chainId || !presaleContract) return false
            const tx = await buy(presaleContract, buyAmount, _referralAddress)
            return tx
        } catch (e: any) {
            console.log(e)
            toast.error(e.reason || (e.data && e.data.message) || e.message)
            return false
        }
    }, [account, chainId, presaleContract, provider])

    return { onBuy: handleBuy }
}