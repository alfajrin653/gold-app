import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { API } from '../lib/api'
import { useAuth } from './AuthContext'
const Ctx = createContext(null)
export const useSocket = () => useContext(Ctx)
export function SocketProvider({ children }) {
  const { user } = useAuth()
  const [socket, setSocket] = useState(null)
  useEffect(() => {
    if (!user) return
    const s = io(API, { auth: { token: localStorage.getItem('token') } })
    setSocket(s)
    return () => { s.disconnect(); setSocket(null) }
  }, [user])
  return <Ctx.Provider value={socket}>{children}</Ctx.Provider>
}
