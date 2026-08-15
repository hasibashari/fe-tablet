'use client'

import Image from 'next/image'
import { motion } from 'motion/react'
import { ArrowRight, ShieldCheck, Star, Users } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-20 pb-20 md:pt-24 md:pb-24 lg:pt-28 lg:pb-28 xl:pt-36 xl:pb-36">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-40 blur-[100px]"></div>

      <div className="container relative mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-12 xl:gap-16">
          <div className="lg:w-1/2 flex flex-col items-start text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-soft border border-hairline text-xs sm:text-sm text-primary mb-4 sm:mb-6 shadow-sm"
            >
              <ShieldCheck size={16} className="text-accent-teal shrink-0" />
              <span className="font-medium">Clinically Proven & Doctor Recommended</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-ink leading-[1.15] mb-4 sm:mb-6"
            >
              Advanced Healthcare <br />
              <span className="text-primary">For a Better Tomorrow</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg lg:text-lg xl:text-xl text-body mb-6 sm:mb-8 max-w-lg leading-relaxed"
            >
              Experience the next generation of wellness with our scientifically backed, high-purity medical solutions designed to improve your quality of life.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto"
            >
              <button className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-active text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-medium transition-all shadow-[0_4px_14px_0_rgba(14,165,233,0.39)] hover:shadow-[0_6px_20px_rgba(14,165,233,0.23)] hover:-translate-y-0.5 cursor-pointer text-sm sm:text-base">
                Consult a Specialist
                <ArrowRight size={18} />
              </button>
              <button className="inline-flex items-center justify-center gap-2 bg-white border border-hairline hover:border-muted-soft hover:bg-surface-soft text-ink px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-medium transition-all shadow-sm cursor-pointer text-sm sm:text-base">
                View Clinical Data
              </button>
            </motion.div>

            {/* Micro stats banner */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center gap-4 sm:gap-6 mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-hairline w-full"
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <span className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-primary/20 overflow-hidden relative">
                    <Image
                      src="https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=150"
                      alt="Doctor avatar"
                      fill
                      className="object-cover object-top"
                      sizes="32px"
                    />
                  </span>
                  <span className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-accent-teal/20 overflow-hidden relative">
                    <Image
                      src="https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=150"
                      alt="Doctor avatar"
                      fill
                      className="object-cover object-top"
                      sizes="32px"
                    />
                  </span>
                  <span className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-accent-amber/20 overflow-hidden relative">
                    <Image
                      src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150"
                      alt="Patient avatar"
                      fill
                      className="object-cover object-top"
                      sizes="32px"
                    />
                  </span>
                </div>
                <div className="text-xs">
                  <div className="flex items-center gap-1 font-bold text-ink">
                    <span>4.9/5.0</span>
                    <Star size={12} className="fill-accent-amber text-accent-amber" />
                  </div>
                  <span className="text-muted">10k+ active patients</span>
                </div>
              </div>

              <div className="h-8 w-px bg-hairline"></div>

              <div className="flex items-center gap-2 text-xs text-body">
                <Users size={16} className="text-primary" />
                <span><strong>50+</strong> Medical Specialists</span>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:w-1/2 relative w-full mt-10 lg:mt-0"
          >
            {/* Ambient background glow */}
            <div className="absolute -inset-2 bg-gradient-to-tr from-primary/30 via-accent-teal/20 to-primary/10 rounded-3xl blur-2xl -z-10 opacity-75"></div>

            {/* Main Image Container */}
            <div className="aspect-[4/3] sm:aspect-[4/3] lg:aspect-[5/4] rounded-3xl overflow-hidden shadow-2xl border border-hairline bg-surface-soft relative group">
              <Image
                src="https://images.pexels.com/photos/8376277/pexels-photo-8376277.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Doctor specialist with digital medical tablet"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-[center_20%] group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Floating Top Right Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="absolute -top-4 -right-4 sm:-right-6 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-hairline items-center gap-3 hidden sm:flex"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-teal opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-teal"></span>
              </span>
              <div>
                <p className="text-xs font-semibold text-ink">Specialist Available</p>
                <p className="text-[11px] text-muted">Ready for telehealth</p>
              </div>
            </motion.div>

            {/* Floating Bottom Left Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="absolute -bottom-6 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-hairline flex items-center gap-4"
            >
              <div className="h-12 w-12 rounded-full bg-accent-teal/10 flex items-center justify-center">
                <ShieldCheck className="text-accent-teal" size={24} />
              </div>
              <div>
                <p className="text-xs font-medium text-body">Certified Facility</p>
                <p className="font-bold text-ink text-sm sm:text-base">FDA Registered & cGMP</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

