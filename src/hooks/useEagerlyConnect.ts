import { Connector } from '@web3-react/types'
import { gnosisSafe } from '../connectors/gnosisSafe'
import { network } from '../connectors/network'
import { useEffect } from 'react'

async function connect(connector: Connector) {
  try {
    if (connector.connectEagerly) {
      await connector.connectEagerly()
    } else {
      await connector.activate()
    }
  } catch (error) {
    console.debug(`web3-react eager connection error: ${error}`)
  }
}

export default function useEagerlyConnect() {
  useEffect(() => {
    try {
      connect(gnosisSafe)
      connect(network)
    } catch (e: any) {
      console.log(e)
      return
    }
  }, [])
}
