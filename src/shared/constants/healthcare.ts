import { HeartPulse, Activity, ShieldPlus, Leaf } from 'lucide-react'

export const benefitsData = [
  {
    title: 'Cardiovascular Support',
    description: 'Scientifically formulated to improve heart health and promote healthy blood circulation.',
    Icon: HeartPulse,
    iconColor: 'text-primary'
  },
  {
    title: 'Enhanced Immunity',
    description: 'Boosts your body’s natural defense systems with clinically proven ingredients.',
    Icon: ShieldPlus,
    iconColor: 'text-accent-teal'
  },
  {
    title: 'Metabolic Balance',
    description: 'Optimizes cellular energy production and maintains healthy metabolic function.',
    Icon: Activity,
    iconColor: 'text-primary'
  },
  {
    title: 'Natural & Pure',
    description: 'Sourced from high-quality, organic compounds without synthetic additives.',
    Icon: Leaf,
    iconColor: 'text-accent-teal'
  },
]

export const ingredientsData = [
  { name: 'Coenzyme Q10 (Ubiquinone)', amount: '100mg', desc: 'Essential for cellular energy production and powerful antioxidant protection.' },
  { name: 'Omega-3 EPA/DHA', amount: '800mg', desc: 'Highly purified marine lipids for cardiovascular and cognitive maintenance.' },
  { name: 'Vitamin D3 (Cholecalciferol)', amount: '2000 IU', desc: 'Crucial for bone density, immune function, and cellular regulation.' },
  { name: 'Magnesium Glycinate', amount: '200mg', desc: 'Highly bioavailable mineral supporting neurological function and muscle recovery.' },
]

export const testimonialsData = [
  {
    quote: "After months of searching for a reliable supplement, I finally found one that delivers measurable results. My latest lab work confirmed the improvements.",
    author: "Dr. Sarah Jenkins",
    role: "Internal Medicine",
  },
  {
    quote: "The transparency regarding their clinical trials and ingredient sourcing is unparalleled in the industry. I confidently recommend this to my patients.",
    author: "James T.",
    role: "Patient since 2023",
  },
  {
    quote: "Remarkable efficacy and absolutely zero adverse side effects. The sustained-release technology truly makes a noticeable difference in daily energy.",
    author: "Elena Rodriguez",
    role: "Clinical Researcher",
  }
]

export const faqData = [
  {
    question: "Is this product FDA approved?",
    answer: "Our manufacturing facilities are FDA registered and strictly adhere to cGMP (current Good Manufacturing Practices) guidelines. The product itself is formulated with FDA-GRAS (Generally Recognized As Safe) ingredients."
  },
  {
    question: "Are there any known side effects or drug interactions?",
    answer: "Our clinical trials have shown a high safety profile with minimal side effects. However, as with any medical supplement, we strongly recommend consulting with your primary care physician before use, especially if you are on prescription medication."
  },
  {
    question: "How long until I see measurable results?",
    answer: "While individual metabolisms vary, clinical data suggests measurable improvements in blood biomarkers within 4-6 weeks of consistent daily use."
  },
  {
    question: "Is this suitable for vegans and allergy sufferers?",
    answer: "Yes, our core product line is 100% plant-based, gluten-free, soy-free, and contains no synthetic dyes or artificial preservatives."
  }
]
