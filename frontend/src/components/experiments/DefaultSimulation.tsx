import { motion } from 'framer-motion'
import { Beaker } from 'lucide-react'

const DefaultSimulation = () => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-lab-accent/10 flex items-center justify-center">
          <Beaker className="w-10 h-10 text-lab-accent" />
        </div>
        <h3 className="text-xl text-lab-text font-medium mb-3">实验模拟开发中</h3>
        <p className="text-lab-muted max-w-md">
          该实验的交互式模拟正在开发中，敬请期待。
          您可以先阅读右侧的实验说明了解实验原理。
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-lab-accent animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-lab-accent animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 rounded-full bg-lab-accent animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </motion.div>
    </div>
  )
}

export default DefaultSimulation
