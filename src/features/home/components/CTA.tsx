'use client'

import React from 'react'
import { motion } from 'motion/react'
import { ArrowRight, Phone } from 'lucide-react'

export default function CTA() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-primary rounded-[2.5rem] p-10 md:p-16 text-center text-white shadow-2xl relative overflow-hidden"
        >
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-teal opacity-20 rounded-full blur-3xl -ml-20 -mb-20"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Optimize Your Health?</h2>
            <p className="text-lg md:text-xl text-primary-disabled max-w-2xl mx-auto mb-10 leading-relaxed">
              Join thousands of patients and medical professionals who have already made the switch to scientifically proven wellness.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="inline-flex items-center justify-center gap-2 bg-white text-primary hover:bg-surface-soft px-8 py-4 rounded-full font-bold transition-transform hover:-translate-y-1 shadow-lg">
                Consult a Doctor
                <ArrowRight size={18} />
              </button>
              <button className="inline-flex items-center justify-center gap-2 bg-primary-active border border-primary-disabled/30 text-white hover:bg-primary-active/80 px-8 py-4 rounded-full font-medium transition-colors">
                <Phone size={18} />
                1-800-MEDICAL
              </button>
            </div>
            <p className="mt-6 text-sm text-primary-disabled/80 font-medium uppercase tracking-wider">
              No prescription required • Free standard shipping
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
