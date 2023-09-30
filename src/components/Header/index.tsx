import React, { useEffect, useRef, useState } from 'react'
import { Container, Nav, Navbar } from 'react-bootstrap'
import { toast } from 'react-toastify';
import WalletPopup from '../WalletPopup'

import './header.scss'
import Logo from './images/logo_placeholder.svg'
import { useWeb3React } from '@web3-react/core';
import { getName } from '../../utils';

const Header = () => {
    const [attempt, setAttempted] = useState<any>();
    const { isActive, chainId, connector, account, isActivating, provider } = useWeb3React()


    const [walletPopupShow, setWalletPopupShow] = useState(false);
    const [connected, setConnected] = useState(false);
    const [address, setAddress] = useState<any>("");

    const getShortAddress = (address: string) => {
        return `${address.substring(0, 5)}...${address.substring(address.length - 5, address.length)}`
    }

    useEffect(() => {
        (async () => {
            let wallet = localStorage.getItem("wallet")
            if (!wallet) return
            if (wallet == 'metaMask') {
                if (isActive) {
                    setConnected(true);
                    setAddress(account);
                } else {
                    connector.connectEagerly && await connector.connectEagerly()
                }
            }
        })();

    }, [attempt, account])

    let callAdd = async function () {
        try {
            await provider?.send('wallet_watchAsset', {
                // @ts-ignore
                "type": "ERC20",
                "options": {
                    "address": "0x7478a78a0bae897399aa348c1f95289ce18749b3",
                    "symbol": "MMK",
                    "decimals": 18,
                },
            })
        } catch (e: any) {
            console.log(e.reason || e.message)
            toast.error(e.reason || e.message)
        }
    }

    return (
        <>
            <Navbar expand="lg" className='header'>
                <Container>
                    <Navbar.Brand href="./">
                        <img alt='logo' src={Logo} className='logo'></img>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="align-items-center navbar-item-list">
                            
                            {getName(connector) == "MetaMask" && (<Nav.Link className='nav-item' onClick={callAdd}>Add MMK To MetaMask</Nav.Link>)}
                            {/* <Nav.Link className='nav-item' href='/'>Link 2</Nav.Link> */}
                            <a className='nav-item social-menu' href="#" target="blank">
                                <i className="fab fa-telegram-plane"></i>
                            </a>
                            <a className='nav-item social-menu' href="#" target="blank">
                                <i className="fab fa-twitter"></i>
                            </a>
                            <Nav.Link className='btn' onClick={async () => {
                                try {
                                    if (connected) {
                                        setConnected(false)
                                        setAttempted(false)
                                        localStorage.setItem('wallet', '');
                                        console.log(isActive, connector, connector.deactivate)
                                        if (isActive) {
                                            if (connector?.deactivate) {
                                                connector.deactivate()
                                            } else {
                                                connector.resetState()
                                            }
                                        }
                                    } else {
                                        setWalletPopupShow(true)
                                    }
                                } catch (err: any) {
                                    toast.error(err.message)
                                }
                            }}>{connected ? getShortAddress(address) : "Connect Wallet"}</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <WalletPopup
                show={walletPopupShow}
                onHide={() => setWalletPopupShow(false)}
                onWallet={() => {
                    setAttempted(Date.now())
                }}
            />
        </>
    )
}

export default Header