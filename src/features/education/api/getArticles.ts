import { Article } from '../types'

const MOCK_ARTICLES: Article[] = [
  {
    id: 'art_1',
    title: 'The Importance of Daily Hydration for Cellular Health',
    summary: 'Learn why drinking enough water is crucial for your cellular health, cognitive performance, and sustainable energy levels.',
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?q=80&w=1200&auto=format&fit=crop',
    imageCaption: 'Maintaining adequate hydration supports cellular regeneration and optimizes metabolic functions.',
    readTime: '4 min read',
    category: 'Wellness',
    publishedAt: '2026-07-28',
    author: {
      name: 'Dr. Sarah Jenkins',
      role: 'Clinical Nutritionist & Wellness Specialist',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&auto=format&fit=crop',
      bio: 'Dr. Sarah Jenkins is a board-certified clinical nutritionist with over 12 years of experience in metabolic wellness and preventative medicine.'
    },
    leadParagraph: 'Water makes up roughly 60% of the human adult body, playing a pivotal role in every physiological function from temperature regulation to nutrient transport. Yet, mild chronic dehydration remains one of the most overlooked health culprits today.',
    sections: [
      {
        heading: 'Why Water Is Essential for Cellular Metabolism',
        paragraphs: [
          'Every cell, tissue, and organ in your body requires adequate hydration to function correctly. When cellular water content drops by as little as 1.5%, cellular enzymatic processes slow down, impairing energy production and toxin clearance.',
          'Hydration directly influences blood volume, meaning that when dehydrated, your heart must pump harder to deliver oxygen and essential nutrients across your body.'
        ],
        callout: {
          type: 'tip',
          title: 'Morning Hydration Protocol',
          text: 'Drink 400–500ml of room-temperature water with a pinch of mineral salt immediately upon waking to restore fluids lost overnight.'
        }
      },
      {
        heading: 'Cognitive Function and Energy Levels',
        paragraphs: [
          'Clinical studies demonstrate that even mild dehydration can trigger headaches, fatigue, mood swings, and marked reductions in memory and attention span.',
          'Instead of reaching for another cup of coffee when the afternoon slump hits, a glass of cold water often provides a faster and more restorative lift to mental acuity.'
        ],
        bulletPoints: [
          'Improves concentration and mental clarity throughout working hours',
          'Prevents tension headaches and eases joint friction through synovial fluid lubrication',
          'Aids gastrointestinal digestion and prevents metabolic sluggishness',
          'Enhances dermal elasticity and natural skin barrier moisture'
        ]
      },
      {
        heading: 'How Much Water Do You Really Need?',
        paragraphs: [
          'While the generic recommendation is 8 glasses (approx. 2 liters) per day, optimal intake varies depending on your body weight, climate, and daily physical exertion.',
          'A simple calculation is aiming for approximately 30-35 ml of water per kilogram of body weight each day.'
        ],
        callout: {
          type: 'quote',
          text: '“Hydration is not merely about quenching thirst; it is the fundamental solvent in which all biological processes occur.”'
        }
      }
    ],
    keyTakeaways: [
      'Dehydration of just 1–2% noticeably impairs cognitive focus and physical energy.',
      'Begin each morning with a glass of water to kickstart metabolic clearance.',
      'Incorporate water-rich whole foods such as cucumbers, berries, and melons into your daily diet.',
      'Monitor urine color: pale straw yellow indicates optimal hydration levels.'
    ],
    tags: ['Hydration', 'Wellness', 'Cellular Health', 'Nutrition']
  },
  {
    id: 'art_2',
    title: 'Managing Blood Pressure Naturally Through Lifestyle & Diet',
    summary: 'Discover evidence-based dietary modifications, movement protocols, and stress reduction methods that help maintain healthy cardiovascular pressure.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop',
    imageCaption: 'Daily moderate aerobic exercise combined with nutrient-rich foods supports arterial flexibility.',
    readTime: '6 min read',
    category: 'Cardiovascular',
    publishedAt: '2026-07-25',
    author: {
      name: 'Dr. Michael Chen, MD',
      role: 'Cardiologist & Preventive Medicine Fellow',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop',
      bio: 'Dr. Michael Chen specializes in non-pharmacological blood pressure management and lifestyle cardiology.'
    },
    leadParagraph: 'Hypertension is often called the "silent killer" because it frequently develops without noticeable symptoms while steadily straining the cardiovascular system. Fortunately, targeted lifestyle modifications can yield measurable reductions in arterial pressure within weeks.',
    sections: [
      {
        heading: 'The DASH Framework: Potassium vs. Sodium Balance',
        paragraphs: [
          'The Dietary Approaches to Stop Hypertension (DASH) diet is celebrated globally for its clinical efficacy. The cornerstone of this approach is restoring the balance between sodium and potassium.',
          'Potassium encourages the kidneys to excrete excess sodium and promotes vasodilation, naturally softening the tension inside arterial walls.'
        ],
        bulletPoints: [
          'Increase intake of leafy greens, avocados, bananas, and sweet potatoes',
          'Limit heavily processed, sodium-dense convenience foods and canned condiments',
          'Incorporate magnesium-rich seeds, almonds, and raw dark chocolate'
        ],
        callout: {
          type: 'tip',
          title: 'Actionable Dietary Swap',
          text: 'Swap standard table salt for mineralized sea salt and enrich meals with herbs like garlic, rosemary, and oregano for natural vascular support.'
        }
      },
      {
        heading: 'The Power of Zone 2 Aerobic Movement',
        paragraphs: [
          'Consistent, moderate-intensity cardiovascular training stimulates the release of nitric oxide (NO) in the endothelium, promoting vascular relaxation and reducing systemic resistance.',
          'Aim for 150 minutes per week of conversational-pace walking, cycling, or swimming.'
        ],
        callout: {
          type: 'warning',
          title: 'Consultation Note',
          text: 'Always consult your healthcare provider before adjusting any prescribed antihypertensive medication.'
        }
      }
    ],
    keyTakeaways: [
      'Prioritize potassium-rich whole foods to assist natural sodium excretion.',
      'Commit to 30 minutes of low-to-moderate aerobic exercise 5 days a week.',
      'Incorporate 5 minutes of deep diaphragmatic breathing to dampen sympathetic nervous arousal.'
    ],
    tags: ['Blood Pressure', 'Heart Health', 'DASH Diet', 'Cardiovascular']
  },
  {
    id: 'art_3',
    title: 'Understanding Vitamin D Deficiency & Immune Resilience',
    summary: 'How lack of sunlight affects your bone density, immune regulation, and mood — and practical steps to optimize your vitamin D status.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1200&auto=format&fit=crop',
    imageCaption: 'Sunlight exposure triggers natural vitamin D3 synthesis in the epidermal layers.',
    readTime: '5 min read',
    category: 'Nutrition',
    publishedAt: '2026-07-20',
    author: {
      name: 'Dr. Elena Rostova',
      role: 'Immunologist & Biochemical Researcher',
      avatar: 'https://images.unsplash.com/photo-1594824813589-cf9b009e4d0b?q=80&w=200&auto=format&fit=crop',
      bio: 'Dr. Elena Rostova conducts research on micronutrient immunology and autoimmune disease prevention.'
    },
    leadParagraph: 'Technically a secosteroid hormone rather than a standard vitamin, Vitamin D receptor sites exist in nearly every cell in the body, governing immune modulation, calcium homeostasis, and gene expression.',
    sections: [
      {
        heading: 'The Sunshine Hormone and Immune Defense',
        paragraphs: [
          'Vitamin D activates vital immune peptides known as cathelicidins and defensins, which protect respiratory tissues against viral and bacterial invasion.',
          'Individuals with low circulating 25-hydroxyvitamin D levels often report higher rates of seasonal infections and prolonged recovery times.'
        ],
        callout: {
          type: 'tip',
          title: 'Safe Sun Exposure Guidelines',
          text: '15–20 minutes of midday sunlight on arms and legs without sunscreen provides sufficient natural synthesis without burning risk for most skin types.'
        }
      },
      {
        heading: 'Synergistic Nutrients: Vitamin K2 and Magnesium',
        paragraphs: [
          'When supplementing with Vitamin D3, pairing it with Vitamin K2 (MK-7) ensures that absorbed calcium is directed into bones and teeth rather than calcifying in blood vessels.',
          'Magnesium is also required as a co-factor to enzymatically convert Vitamin D into its active circulating form.'
        ]
      }
    ],
    keyTakeaways: [
      'Test your 25(OH)D blood levels annually to establish a safe baseline.',
      'Combine Vitamin D3 supplementation with Vitamin K2 and dietary Magnesium.',
      'Take Vitamin D with a fat-containing meal to maximize gastrointestinal absorption.'
    ],
    tags: ['Vitamin D', 'Immunity', 'Bone Health', 'Micronutrients']
  },
  {
    id: 'art_4',
    title: 'Optimizing Your Sleep Architecture for Peak Recovery',
    summary: 'Discover how REM and Deep Sleep cycles restore neural pathways, balance hormones, and reinforce your immune system.',
    imageUrl: 'https://images.unsplash.com/photo-1511295742362-92c96b124e52?q=80&w=1200&auto=format&fit=crop',
    imageCaption: 'Consistent sleep timing aligns your master circadian clock located in the hypothalamus.',
    readTime: '5 min read',
    category: 'Wellness',
    publishedAt: '2026-07-15',
    author: {
      name: 'Dr. Sarah Jenkins',
      role: 'Clinical Nutritionist & Wellness Specialist',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&auto=format&fit=crop',
      bio: 'Dr. Sarah Jenkins is a board-certified clinical nutritionist with over 12 years of experience in metabolic wellness.'
    },
    leadParagraph: 'Sleep is not an inert state of rest, but an active, metabolically demanding phase where your brain clears neurotoxic waste and your body repairs muscle tissue.',
    sections: [
      {
        heading: 'Circadian Anchors: Light and Temperature',
        paragraphs: [
          'Your circadian rhythm is anchored primarily by two external cues: sunlight exposure in the morning and core body temperature drops in the evening.',
          'Keeping your sleeping quarters cool (around 18-20°C) facilitates the natural drop in body temperature required to initiate and maintain deep slow-wave sleep.'
        ],
        callout: {
          type: 'tip',
          title: 'The 10-3-2-1 Sleep Rule',
          text: '10 hours before bed: No caffeine. 3 hours before: No food or alcohol. 2 hours before: No intense work. 1 hour before: No digital screens.'
        }
      }
    ],
    keyTakeaways: [
      'Prioritize consistency over duration: wake up at the same hour every morning.',
      'Dim ambient lights 90 minutes before bedtime to trigger natural melatonin release.',
      'Avoid blue-light emitting devices or use blue-blocking filters in the evening.'
    ],
    tags: ['Sleep', 'Circadian Rhythm', 'Recovery', 'Mental Health']
  },
  {
    id: 'art_5',
    title: 'The Science of Gut Microbiome & Mental Health',
    summary: 'Understand the gut-brain axis and how dietary prebiotic fibers support neurotransmitter balance and mood stability.',
    imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=1200&auto=format&fit=crop',
    imageCaption: 'A diverse array of plant foods cultivates a resilient and balanced microbiome ecosystem.',
    readTime: '6 min read',
    category: 'Nutrition',
    publishedAt: '2026-07-10',
    author: {
      name: 'Dr. Michael Chen, MD',
      role: 'Cardiologist & Preventive Medicine Fellow',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop'
    },
    leadParagraph: 'Over 90% of the body’s serotonin and roughly 50% of dopamine are synthesized in the gastrointestinal tract, making gut health a foundational determinant of psychological well-being.',
    sections: [
      {
        heading: 'The Vagus Nerve: Direct Communication Channel',
        paragraphs: [
          'The vagus nerve serves as a bi-directional information superhighway connecting trillions of gut microbes directly to the central nervous system.',
          'Consuming fermented foods such as kefir, kimchi, and sauerkraut introduces beneficial probiotics that synthesize short-chain fatty acids (SCFAs) like butyrate, calming neuro-inflammation.'
        ]
      }
    ],
    keyTakeaways: [
      'Aim for 30 different plant varieties per week to diversify bacterial strains.',
      'Include naturally fermented foods daily.',
      'Limit artificial sweeteners and ultra-processed additives that degrade the mucosal lining.'
    ],
    tags: ['Gut Health', 'Microbiome', 'Mental Clarity', 'Nutrition']
  },
  {
    id: 'art_6',
    title: 'Mindfulness & Diaphragmatic Breathwork for Stress',
    summary: 'Practical breathing techniques to down-regulate the sympathetic nervous system and induce rapid physical calm.',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop',
    imageCaption: 'Controlled breathing stimulates vagal tone, lowering heart rate and blood cortisol levels.',
    readTime: '4 min read',
    category: 'Wellness',
    publishedAt: '2026-07-05',
    author: {
      name: 'Dr. Elena Rostova',
      role: 'Immunologist & Biochemical Researcher',
      avatar: 'https://images.unsplash.com/photo-1594824813589-cf9b009e4d0b?q=80&w=200&auto=format&fit=crop'
    },
    leadParagraph: 'Chronic low-grade stress elevates circulating cortisol, depleting immune reserves and promoting systemic inflammation. Breathwork is the fastest conscious tool to reset autonomic equilibrium.',
    sections: [
      {
        heading: 'Box Breathing: The Tactical Calming Protocol',
        paragraphs: [
          'Used by high-performance athletes and first responders, Box Breathing (4 seconds in, 4 seconds hold, 4 seconds out, 4 seconds hold) stabilizes cardiac rhythm and restores executive cognitive function in moments of acute pressure.'
        ],
        callout: {
          type: 'tip',
          title: 'Quick 2-Minute Reset',
          text: 'Perform 5 cycles of Box Breathing whenever you feel overwhelmed before meetings or demanding tasks.'
        }
      }
    ],
    keyTakeaways: [
      'Breathing through the nose filters air and promotes nitric oxide absorption.',
      'Prolonged exhalations trigger parasympathetic nervous dominance.',
      'Daily 5-minute sessions build long-term stress resilience.'
    ],
    tags: ['Mindfulness', 'Stress Management', 'Breathwork', 'Wellness']
  }
]

export const getArticles = async (): Promise<Article[]> => {
  await new Promise(resolve => setTimeout(resolve, 300))
  return MOCK_ARTICLES
}

export const getArticleById = async (id: string): Promise<Article | null> => {
  await new Promise(resolve => setTimeout(resolve, 250))
  const found = MOCK_ARTICLES.find(article => article.id === id)
  return found || null
}

export const getRelatedArticles = async (currentId: string, limit: number = 3): Promise<Article[]> => {
  await new Promise(resolve => setTimeout(resolve, 150))
  const current = MOCK_ARTICLES.find(a => a.id === currentId)
  if (!current) return MOCK_ARTICLES.slice(0, limit)
  
  // Prefer same category, then fallback
  const sameCategory = MOCK_ARTICLES.filter(a => a.id !== currentId && a.category === current.category)
  const others = MOCK_ARTICLES.filter(a => a.id !== currentId && a.category !== current.category)
  
  return [...sameCategory, ...others].slice(0, limit)
}
