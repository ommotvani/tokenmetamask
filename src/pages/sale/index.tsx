import React, { Suspense, useCallback, useEffect, useState } from 'react';
import './sale.scss';
import { Col, Row, Form } from 'react-bootstrap';
import FlipClockCountdown from '@leenguyen/react-flip-clock-countdown';
import '@leenguyen/react-flip-clock-countdown/dist/index.css';
import { useWeb3React } from '@web3-react/core';

import IconDown from './images/down.svg';
import IconCopy from './images/copy.svg';

import { toast } from 'react-toastify';
import { useBuy, useFetchDetails } from '../../hooks/presale';
import { getChainDataById, getName, isAddress } from '../../utils';
import { useParams, useNavigate } from 'react-router-dom';

function Sale() {
    const IDO_START_DATE = '2023-09-30T09:00:00Z'
    const IDO_END_DATE = '2023-10-15T09:00:00Z'

    const [selectedInputToken, setSelectedInputToken] = useState<any>();
    const [inputValue, setInputValue] = useState<any>();
    let { referralAddress } = useParams<{ referralAddress: string }>();
    const navigate = useNavigate();

    const [min, setMin] = useState<Number>(0);
    const [max, setMax] = useState<Number>(0);
    const [tokenPriceBnb, setTokenPriceBnb] = useState<Number>();
    const [saleProgress, setSaleProgress] = useState<Number>();
    const [purchased, setPurchased] = useState<Number>(0);

    const [selectedOutputToken, setSelectedOutputToken] = useState<any>();
    const [outputValue, setOutputValue] = useState<any>();

    const [poolType, setPoolType] = useState<'NA' | 'OPENALL' | 'CLOSED'>('NA');

    const { isActive, chainId, connector, account, isActivating, provider } = useWeb3React();

    const { onFetchDetails } = useFetchDetails()
    const { onBuy } = useBuy()

    const MINIMUM = 0.04
    const MAXIMUM = 10


    const INPUT_TOKEN = [
        {
            id: 1,
            icon: 'https://assets.coingecko.com/coins/images/825/thumb/bnb-icon2_2x.png?1644979850',
            ticker: 'BNB',
            type: 'BNB',
            peggedPrice: 215
        }
    ]

    const OUTPUT_TOKEN = [
        {
            id: 1,
            icon: 'https://assets.coingecko.com/coins/images/825/thumb/bnb-icon2_2x.png?1644979850',
            ticker: 'MMK',
            type: 'MMK'
        }
    ]

    useEffect(() => {
        setCurrentPoolType()
        setSelectedInputToken(INPUT_TOKEN[0])
        setSelectedOutputToken(OUTPUT_TOKEN[0])
        if(referralAddress) {
            const _referralAddress = isAddress(referralAddress)
            if (!_referralAddress) {
                toast.error("Invalid referral address")
                navigate('/')
                return
            }
        }
    }, [])

    useEffect(() => {
        const _referralAddress = isAddress(referralAddress)
        if(_referralAddress && _referralAddress == account) {
            navigate('/')
        }
    }, [account])

    useEffect(() => {
        fetchDetails()
    }, [account, provider])

    let fetchDetails = async function () {
        let details = await onFetchDetails()
        if (!details) return
        setMin(Number(details.min))
        setMax(Number(details.max))
        setTokenPriceBnb(Number(details.price))
        setPurchased(Number(details.purchased))
        let progress = Number(details.tokenSold) * 100 / (Number(details.tokenForSale) + Number(details.tokenSold))
        setSaleProgress(progress)
        console.log(details)
    }

    const setCurrentPoolType = async function () {
        let time = Date.now()
        if (time < new Date(IDO_START_DATE).getTime()) {
            setPoolType('NA')
            console.log('NA', time, new Date(IDO_START_DATE).getTime())
        } else if (time > new Date(IDO_START_DATE).getTime() && time < new Date(IDO_END_DATE).getTime()) {
            setPoolType('OPENALL')
            console.log('OPENALL')
        } else if (time > new Date(IDO_END_DATE).getTime()) {
            setPoolType('CLOSED')
            console.log('CLOSED')
        }
    }

    useEffect(() => {
        if (isNaN(Number(inputValue))) return
        if (!tokenPriceBnb) return
        if (Number(inputValue) <= 0 || !inputValue) {
            setOutputValue('')
            return
        }
        let outToken = ((inputValue) / Number(tokenPriceBnb)).toFixed(4)
        setOutputValue(outToken)
    }, [inputValue, selectedInputToken, tokenPriceBnb])

    async function onBuyClick() {
        if(!validateInput(inputValue)) return;
        let tx = await onBuy(referralAddress ?? null, inputValue)
        if (!tx) {
            // toast.error("Oops! somthing went wrong")
            return;
        } 
        toast.success("🔗 View on Explorer", {
            onClick: (() => window.open(`${getChainDataById(chainId)?.explorerUrl}/tx/${tx?.hash}`)),
            closeOnClick: false,
            autoClose: 30000
        })
        await tx.wait()
        await fetchDetails()
    }

    let validateInput = function (inputValue: any) {
        console.log(inputValue, min, max, purchased, min || purchased === undefined || max)
        if(min === null || purchased === undefined || max === null) {
            return false;
        }
        if(Number(min) > Number(inputValue) + Number(purchased)) {
            toast.error(`Minimum amount is ${min}BNB`)
            return false
        }
        if(Number(inputValue) + Number(purchased) > Number(max)) {
            toast.error(`Maximum amount is ${max}BNB`)
            return false
        }
        return true
    }

    let getReferLink = function () {
        if(!account) return ''
        return `http://localhost:3000/${account}`
    }

    let copyReferLinkToClipboard = function () {
        navigator.clipboard.writeText(getReferLink())
        toast.success("Copied to clipboard")
    }

    return (
        <div className='sale-page'>
            <div className='sale-container header-margin container'>
                <div className=''>
                    <Row>
                        <Col xs={12} lg={8}></Col>
                        <Col xs={12} lg={4}>
                            <div className='sale-interface-container'>
                                <div className='sale-interface'>
                                    <div className='sale-header'>
                                        <div className='timer'>
                                            {poolType === 'NA' && (
                                                <>
                                                    <p className='sale-timer-title'>Sale Starts In</p>
                                                    <FlipClockCountdown
                                                        to={new Date(IDO_START_DATE).getTime()}
                                                        labelStyle={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase' }}
                                                        digitBlockStyle={{ width: 20, height: 30, fontSize: 15 }}
                                                        dividerStyle={{ color: '#A8ADDC0f', height: '0.1px' }}
                                                        className='flip-clock'
                                                        onComplete={() => setTimeout(() => { setCurrentPoolType() }, 1000)}
                                                    />
                                                </>
                                            )}
                                            {poolType === 'OPENALL' && (
                                                <>
                                                    <p className='sale-timer-title'>PreSale Ends In</p>
                                                    <FlipClockCountdown
                                                        to={new Date(IDO_END_DATE).getTime()}
                                                        labelStyle={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase' }}
                                                        digitBlockStyle={{ width: 20, height: 30, fontSize: 15 }}
                                                        dividerStyle={{ color: '#A8ADDC0f', height: '0.1px' }}
                                                        className='flip-clock'
                                                        onComplete={() => setTimeout(() => { setCurrentPoolType() }, 1000)}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className='sale-box'>
                                        <div className='sale-progress'>
                                            <div className="progress gradient-bk">
                                                <div className="incomplete" style={{ width: ((!saleProgress || Number(saleProgress) < 1) ? 99 : (100 - Number(saleProgress))) + "%" }}></div>
                                            </div>
                                            <div className='sale-statistics'>
                                                <p></p>
                                                {saleProgress == undefined && (
                                                    <div className='price-loader'></div>
                                                )}
                                                {saleProgress != undefined && (
                                                    <p className='progress-status'>Progress: {(saleProgress && Number(saleProgress).toFixed(2))}%/100%</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className='sale-input'>
                                            <div className='sale-input-selector'>
                                                <Form.Control id='sale-input' type="number" pattern="^[0-9]*[.,]?[0-9]*$" maxLength={79} value={inputValue || ''} autoComplete='off'
                                                    onChange={({ target: { value } }) => {
                                                        setInputValue(value)
                                                    }} />
                                                <div>
                                                    {selectedInputToken && selectedInputToken.ticker && (
                                                        <div className='input-selector d-flex align-items-center'>
                                                            <img src={selectedInputToken.icon} width={'24px'}></img>
                                                            <p className='mb-0'>{selectedInputToken && selectedInputToken.ticker}</p>
                                                            {/* <img src={IconDown}></img> */}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className='sale-input-price'>
                                                <div className=''>
                                                    {!!min && (
                                                        <p className='price' onClick={() => setInputValue(Number(min).toFixed(4))}>Min: {Number(min).toFixed(4)} BNB</p>
                                                    )}
                                                    {/* {(!min) && (
                                                        <div className='price-spacer'></div>
                                                    )} */}
                                                    {(!min) && (
                                                        <div className='price-loader'></div>
                                                    )}
                                                </div>
                                                <div className=''>
                                                    {!!max && (
                                                        <p className='price' onClick={() => setInputValue((Number(max) - Number(purchased)).toFixed(4))}>Max: {Number(max).toFixed(4)} BNB</p>
                                                    )}
                                                    {(!max) && (
                                                        <div className='price-loader'></div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className='sale-output'>
                                            <div className='sale-output-selector'>
                                                <Form.Control id='sale-output' type="text" pattern="^[0-9]*[.,]?[0-9]*$" maxLength={79} value={outputValue || ''} autoComplete='off' readOnly />
                                                <div>
                                                    {selectedOutputToken && selectedOutputToken.ticker && (
                                                        <div className='output-selector d-flex align-items-center'>
                                                            <img src={selectedOutputToken.icon} width={'24px'}></img>
                                                            <p className='mb-0'>{selectedInputToken && selectedOutputToken.ticker}</p>
                                                            {/* <img src={IconDown}></img> */}
                                                        </div>
                                                    )}
                                                    {!selectedOutputToken && (
                                                        <div className='output-default-selector d-flex align-items-center'>
                                                            <p className='mb-0'>Select Token</p>
                                                            <img src={IconDown}></img>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className='sale-output-price'>
                                                <div className=''>
                                                    {tokenPriceBnb && (
                                                        <p className='price'>${Number((outputValue ?? 0) * Number(tokenPriceBnb) * selectedInputToken.peggedPrice).toLocaleString()}</p>
                                                    )}
                                                    {(!tokenPriceBnb) && (
                                                        <div className='price-loader'></div>
                                                    )}
                                                </div>
                                                <div className=''>
                                                    {tokenPriceBnb && (
                                                        <p className='price'>1 TEST = ${Number(tokenPriceBnb) * selectedInputToken.peggedPrice}</p>
                                                    )}
                                                    {(!tokenPriceBnb) && (
                                                        <div className='price-loader'></div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className='sale-button-container'>
                                            {(!isActive || (isActive && getName(connector) === 'Network') || isActivating) && <button className='btn' disabled>Wallet Not Connected</button>}
                                            {isActive && getName(connector) !== 'Network' && (<button className='btn' onClick={() => onBuyClick()}>Buy</button>)}
                                        </div>
                                        {Number(purchased) > 0 && getReferLink() && (
                                            <div className='refren-now-container'>
                                                <div className='text'>Refer Link</div>
                                                <div className='link' onClick={() => copyReferLinkToClipboard()}>{getReferLink()}</div>
                                                <div className='copy-button' onClick={() =>copyReferLinkToClipboard()}><img src={IconCopy}></img></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>
        </div>
    )
}

export default Sale;