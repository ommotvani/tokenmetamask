import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React as useWeb3ReactCore } from '@web3-react/core'
import { Web3ContextType } from '@web3-react/core/dist/provider'

const NetworkContextName = 'NETWORK'

//TODO: add network active call
export function useActiveWeb3React(): Web3ContextType<Web3Provider> & { } {
    const context = useWeb3ReactCore<Web3Provider>()
    return context
}