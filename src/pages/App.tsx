import React, { Suspense, useState } from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './App.scss';

import Sale from './sale';

import Header from '../components/Header';

function App() {
    return (
        <Suspense fallback={null}>
            <Header></Header>
            <div className='body-content'>
                <BrowserRouter>
                    <Routes>
                        <Route path='/' Component={Sale}></Route>
                        <Route path='/:referralAddress' Component={Sale}></Route>
                    </Routes>
                </BrowserRouter>
            </div>
            <ToastContainer />
        </Suspense>
    )
}

export default App;