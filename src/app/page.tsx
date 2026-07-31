import {
  Hero,
  Benefits,
  ProductInfo,
  Ingredients,
  Features,
  Testimonials,
  FAQ,
  CTA,
} from '../features/home'
import Footer from '../shared/components/Footer'
import Navbar from '../shared/components/Navbar'

export default function Home() {
  return (
    <main className="min-h-screen bg-white selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <Hero />
      <Benefits />
      <ProductInfo />
      <Ingredients />
      <Features />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  )
}
