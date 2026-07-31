'use client'

import React from 'react'
import { motion } from 'motion/react'


import { benefitsData } from '../../../shared/constants/healthcare'

export default function Benefits() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-ink mb-4">Comprehensive Health Benefits</h2>
          <p className="text-lg text-body">
            Our specialized formula addresses multiple aspects of your well-being, providing a holistic approach to long-term health.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefitsData.map((benefit, index) => {
            const IconComponent = benefit.Icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-surface-soft rounded-2xl p-8 border border-hairline hover:shadow-lg transition-shadow"
              >
                <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-6">
                  <IconComponent size={24} className={benefit.iconColor} />
                </div>
                <h3 className="text-xl font-semibold text-ink mb-3">{benefit.title}</h3>
                <p className="text-body leading-relaxed">{benefit.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
