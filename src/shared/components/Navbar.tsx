'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Cross } from 'lucide-react'
import { cn } from '../utils/cn'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3 border-b border-hairline' : 'bg-transparent py-5'
      )}
    >
      <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary text-white p-1.5 rounded-lg group-hover:bg-primary-active transition-colors">
            <Cross size={24} />
          </div>
          <span className="text-xl font-bold text-ink tracking-tight">Medi<span className="text-primary">Core</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#science" className="text-sm font-medium text-body hover:text-primary transition-colors">The Science</Link>
          <Link href="#ingredients" className="text-sm font-medium text-body hover:text-primary transition-colors">Ingredients</Link>
          <Link href="#trials" className="text-sm font-medium text-body hover:text-primary transition-colors">Clinical Trials</Link>
          <Link href="#about" className="text-sm font-medium text-body hover:text-primary transition-colors">About Us</Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-ink hover:text-primary transition-colors">Patient Portal</Link>
          <button className="bg-primary hover:bg-primary-active text-white px-5 py-2 rounded-full text-sm font-medium transition-colors shadow-sm">
            Consult a Doctor
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-ink p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-hairline shadow-lg py-4 px-6 flex flex-col gap-4 md:hidden">
          <Link href="#science" className="text-base font-medium text-body py-2 border-b border-hairline-soft">The Science</Link>
          <Link href="#ingredients" className="text-base font-medium text-body py-2 border-b border-hairline-soft">Ingredients</Link>
          <Link href="#trials" className="text-base font-medium text-body py-2 border-b border-hairline-soft">Clinical Trials</Link>
          <Link href="#about" className="text-base font-medium text-body py-2 border-b border-hairline-soft">About Us</Link>
          <div className="pt-2 flex flex-col gap-3">
            <Link href="/login" className="text-center font-medium text-ink py-2">Patient Portal</Link>
            <button className="bg-primary text-white w-full py-3 rounded-full font-medium">
              Consult a Doctor
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
