'use client'

import React from 'react'
import { motion } from 'motion/react'
import { CheckCircle2 } from 'lucide-react'

export default function ProductInfo() {
  return (
    <section className="py-24 bg-surface-soft">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/2 w-full"
          >
            <div className="aspect-square md:aspect-[4/3] lg:aspect-square rounded-3xl overflow-hidden shadow-lg border border-hairline bg-white relative flex items-center justify-center text-muted-soft">
              <span className="text-sm font-medium uppercase tracking-widest">Product Display Image</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/2 w-full"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-ink mb-6">
              Precision Medicine for Your Unique Needs
            </h2>
            <p className="text-lg text-body mb-8 leading-relaxed">
              Developed by leading researchers and medical professionals, our core product utilizes advanced delivery mechanisms to ensure maximum bioavailability and efficacy. We maintain the highest standards of pharmaceutical manufacturing.
            </p>

            <ul className="space-y-4 mb-10">
              {[
                'FDA Registered Facility Manufacturing',
                'Third-party tested for purity and potency',
                'Sustained-release technology for all-day support',
                'Hypoallergenic and free from common allergens'
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="text-accent-teal shrink-0 mt-1" size={20} />
                  <span className="text-body font-medium">{item}</span>
                </li>
              ))}
            </ul>

            <button className="bg-primary hover:bg-primary-active text-white px-8 py-3 rounded-full font-medium transition-colors">
              Read the Research
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
