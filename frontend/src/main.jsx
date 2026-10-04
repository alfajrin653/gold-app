import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import Lenis from 'lenis'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { ToastProvider } from './components/Toast'
import './index.css'

const lenis = new Lenis({ duration: 1.1, smoothWheel: true })
const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf) }
requestAnimationFrame(raf)

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider><SocketProvider><ToastProvider><App /></ToastProvider></SocketProvider></AuthProvider>
  </BrowserRouter>
)
