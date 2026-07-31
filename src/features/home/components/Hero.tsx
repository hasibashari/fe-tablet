'use client'

import { motion } from 'motion/react'
import { ArrowRight, ShieldCheck } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-24 pb-32 lg:pt-36 lg:pb-40">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-40 blur-[100px]"></div>

      <div className="container relative mx-auto px-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 flex flex-col items-start text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-soft border border-hairline text-sm text-primary mb-6"
            >
              <ShieldCheck size={16} className="text-accent-teal" />
              <span className="font-medium">Clinically Proven & Doctor Recommended</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl lg:text-6xl font-bold tracking-tight text-ink leading-[1.1] mb-6"
            >
              Advanced Healthcare <br />
              <span className="text-primary">For a Better Tomorrow</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg lg:text-xl text-body mb-8 max-w-lg leading-relaxed"
            >
              Experience the next generation of wellness with our scientifically backed, high-purity medical solutions designed to improve your quality of life.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <button className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-active text-white px-8 py-3.5 rounded-full font-medium transition-all shadow-[0_4px_14px_0_rgba(14,165,233,0.39)] hover:shadow-[0_6px_20px_rgba(14,165,233,0.23)] hover:-translate-y-0.5">
                Consult a Specialist
                <ArrowRight size={18} />
              </button>
              <button className="inline-flex items-center justify-center gap-2 bg-white border border-hairline hover:border-muted-soft hover:bg-surface-soft text-ink px-8 py-3.5 rounded-full font-medium transition-all shadow-sm">
                View Clinical Data
              </button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:w-1/2 relative w-full mt-10 lg:mt-0"
          >
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-hairline bg-surface-soft relative flex items-center justify-center text-muted-soft">
              <span className="text-sm font-medium tracking-widest uppercase">High-Quality Medical Imagery</span>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-hairline flex items-center gap-4 hidden sm:flex">
              <div className="h-12 w-12 rounded-full bg-accent-teal/10 flex items-center justify-center">
                <ShieldCheck className="text-accent-teal" size={24} />
              </div>
              <div>
                <p className="text-sm text-body">Certified</p>
                <p className="font-bold text-ink">FDA Approved</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
