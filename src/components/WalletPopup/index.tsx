import React, { useEffect, useRef, useState } from 'react'
import { Modal } from 'react-bootstrap'
import './walletPopup.scss'

import IconCross from './images/cross.svg'
import IconMetamask from './images/metamask.png'
import IconWalletConnect from './images/walletconnect.png'
import IconUnisat from './images/unisat-wallet.png'
import { useWeb3React } from '@web3-react/core'
import { toast } from 'react-toastify'
import { getName } from '../../utils'

function WalletPopup(props: any) {
    const { isActive, chainId, connector, account, isActivating } = useWeb3React()

    const handleConnect = async function (connectorName: string) {
        // if (isActive || isActivating) {
        //     toast.error(`${getName(connector)} is already connected`)
        //     return
        // }
        props.onHide()
        try {
            if (connectorName === 'metaMask') {
                let { metaMask } = await require('../../connectors/metaMask')
                await metaMask.activate(97)
                localStorage.setItem('wallet', 'metaMask');
                props.onWallet()
            } 
        } catch (e: any) {
            console.log(e)
            toast.error(e.message)
        }
    }

    return (
        <Modal
            size="sm"
            {...props}
            className='wallet-popup-model'
            centered
        >
            <Modal.Body>
                <div className='header-container d-flex justify-content-between align-items-center'>
                    <h6>Connect Wallet</h6>
                    <img className='close-img' src={IconCross} onClick={props.onHide}></img>
                </div>
                <div className='wallet-list d-flex justify-content-between'>
                    <div className='wallet-item d-flex align-items-center' onClick={() => handleConnect('metaMask')}>
                        <div className='wallet-img-container mr-4'><img src={IconMetamask} width={'50px'}></img></div>
                        <p className='wallet-name'>Metamask</p>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    )
}

export default WalletPopup