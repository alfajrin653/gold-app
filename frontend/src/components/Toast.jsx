import { createContext, useCallback, useContext, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, CheckCircle2, XCircle } from 'lucide-react'
const Ctx = createContext(() => {})
export const useToast = () => useContext(Ctx)
const styles = { info: ['bg-sky-50 text-sky-700', Bell], success: ['bg-emerald-50 text-emerald-700', CheckCircle2], error: ['bg-rose-50 text-rose-600', XCircle] }
export function ToastProvider({ children }) {
  const [list, setList] = useState([])
  const toast = useCallback((msg, type = 'info') => {
    const id = Math.random()
    setList((l) => [...l, { id, msg, type }])
    setTimeout(() => setList((l) => l.filter((t) => t.id !== id)), 5000)
  }, [])
  return (
    <Ctx.Provider value={toast}>
      {children}
      <div className="fixed right-4 top-4 z-[100] flex w-80 flex-col gap-2">
        <AnimatePresence>
          {list.map((t) => {
            const [cls, Icon] = styles[t.type]
            return (
              <motion.div key={t.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
                className={`flex items-start gap-3 rounded-2xl border border-white p-4 text-sm font-medium shadow-lg ${cls}`}>
                <Icon size={18} className="mt-0.5 shrink-0" /> <span>{t.msg}</span>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  )
}
