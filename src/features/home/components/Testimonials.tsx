'use client'

import React from 'react'
import { motion } from 'motion/react'
import { Star } from 'lucide-react'

import { testimonialsData } from '../../../shared/constants/healthcare'
export default function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-ink mb-4">Trusted by Professionals & Patients</h2>
          <p className="text-lg text-body max-w-2xl mx-auto">
            Read what the medical community and our long-term users have to say about our healthcare solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonialsData.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-8 rounded-2xl bg-surface-soft border border-hairline relative"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, idx) => (
                  <Star key={idx} size={18} className="fill-accent-amber text-accent-amber" />
                ))}
              </div>
              <p className="text-body italic mb-8 leading-relaxed">&quot;{review.quote}&quot;</p>
              <div className="mt-auto">
                <p className="font-bold text-ink">{review.author}</p>
                <p className="text-sm text-muted-soft">{review.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
