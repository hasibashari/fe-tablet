'use client'

import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import {
  Search,
  BookOpen,
  Sparkles,
  Clock,
  User,
  ArrowRight,
  X,
} from 'lucide-react'
import { Card } from '@/src/shared/components/ui/Card'
import { Chip } from '@/src/shared/components/ui/Chip'
import { Button } from '@/src/shared/components/ui/Button'
import {
  MOCK_EDUCATION_ARTICLES,
  EducationArticleMock,
} from '@/src/shared/mock/feTabletData'

const CATEGORIES = ['Semua', 'Anemia', 'TTD', 'Nutrisi', 'Gaya Hidup', 'Mitos & Fakta']

export default function EducationView() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [selectedArticle, setSelectedArticle] = useState<EducationArticleMock | null>(null)

  const filteredArticles = useMemo(() => {
    return MOCK_EDUCATION_ARTICLES.filter((art) => {
      const matchCategory =
        selectedCategory === 'Semua' || art.category === selectedCategory
      const matchSearch =
        searchQuery === '' ||
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.summary.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCategory && matchSearch
    })
  }, [searchQuery, selectedCategory])

  const featuredArticle = MOCK_EDUCATION_ARTICLES.find((a) => a.isFeatured)

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Screen Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#1e293b] tracking-tight">
          Edukasi & Literasi Anemia
        </h2>
        <p className="text-xs sm:text-sm text-[#64748b]">
          Pelajari fakta medis, tips konsumsi TTD, dan panduan gizi seimbang
        </p>
      </div>

      {/* Search Bar & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 flex items-center">
          <Search size={16} className="absolute left-3.5 text-[#94a3b8] pointer-events-none" />
          <input
            type="text"
            placeholder="Cari materi, tips mual, makanan zat besi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-[#1e293b] placeholder-[#94a3b8] text-xs sm:text-sm rounded-2xl border border-[#fce7f3] focus:border-[#e11d48] pl-10 pr-4 py-3 outline-none shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 text-[#94a3b8] hover:text-[#e11d48]"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Category Chips Scroll/Wrap */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              size="sm"
              active={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
              className="shrink-0"
            >
              {cat}
            </Chip>
          ))}
        </div>
      </div>

      {/* Featured Article Banner */}
      {!searchQuery && selectedCategory === 'Semua' && featuredArticle && (
        <Card
          padding="none"
          className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setSelectedArticle(featuredArticle)}
        >
          <div className="relative h-44 sm:h-60 w-full">
            <Image
              src={featuredArticle.imageUrl}
              alt={featuredArticle.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1200px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-4 sm:p-6">
              <span className="text-[10px] sm:text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={13} />
                <span>Featured Article • {featuredArticle.readTime}</span>
              </span>
              <h3 className="text-base sm:text-2xl font-bold text-white leading-snug mt-1 max-w-2xl">
                {featuredArticle.title}
              </h3>
            </div>
          </div>
          <div className="p-4 sm:p-5 bg-white">
            <p className="text-xs sm:text-sm text-[#475569] line-clamp-2 leading-relaxed">
              {featuredArticle.summary}
            </p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#fce7f3]">
              <span className="text-xs text-[#94a3b8]">
                Oleh <strong>{featuredArticle.author}</strong> • {featuredArticle.publishDate}
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#e11d48] flex items-center gap-1">
                <span>Baca Lengkap</span>
                <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Responsive Articles Grid: 1 col (mobile) -> 2 col (tablet) -> 3 col (desktop) */}
      <div>
        <h4 className="text-sm sm:text-base font-bold text-[#1e293b] mb-3">
          {searchQuery ? `Hasil Pencarian (${filteredArticles.length})` : 'Materi Populer'}
        </h4>

        {filteredArticles.length === 0 ? (
          <Card padding="lg" className="text-center py-12">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-[#e11d48] flex items-center justify-center mx-auto mb-3">
              <BookOpen size={28} />
            </div>
            <p className="text-base font-bold text-[#1e293b]">Materi Tidak Ditemukan</p>
            <p className="text-xs sm:text-sm text-[#64748b] mt-1 max-w-sm mx-auto">
              Coba gunakan kata kunci lain seperti &quot;Zat Besi&quot;, &quot;Mual&quot;, atau &quot;Jeruk&quot;.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredArticles.map((article) => (
              <Card
                key={article.id}
                padding="none"
                hoverable
                className="overflow-hidden cursor-pointer flex flex-col justify-between"
                onClick={() => setSelectedArticle(article)}
              >
                {/* Thumbnail */}
                <div className="relative h-40 w-full shrink-0">
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <span className="absolute top-3 left-3 text-[10px] font-bold text-white bg-slate-950/70 backdrop-blur-xs px-2.5 py-0.5 rounded-full">
                    {article.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-[#94a3b8] flex items-center gap-1 mb-1">
                      <Clock size={11} />
                      {article.readTime}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-[#1e293b] line-clamp-2 leading-snug">
                      {article.title}
                    </h4>
                    <p className="text-xs text-[#64748b] line-clamp-2 mt-1.5 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-[#fce7f3] flex items-center justify-between text-[11px] text-[#94a3b8]">
                    <span>{article.publishDate}</span>
                    <span className="text-[#e11d48] font-bold flex items-center gap-0.5">
                      <span>Baca</span>
                      <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Article Detail Reader Modal (Responsive max-w-2xl) */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl border border-[#fce7f3] max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#fce7f3] mb-4">
              <span className="text-xs font-bold text-[#e11d48] bg-[#ffe4e6] px-3 py-1 rounded-full">
                {selectedArticle.category}
              </span>
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="w-8 h-8 rounded-full bg-[#f1f5f9] text-[#64748b] hover:text-[#1e293b] flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Article Image */}
            <div className="relative h-56 sm:h-72 w-full rounded-2xl overflow-hidden mb-4">
              <Image
                src={selectedArticle.imageUrl}
                alt={selectedArticle.title}
                fill
                className="object-cover"
              />
            </div>

            <h3 className="text-lg sm:text-2xl font-extrabold text-[#1e293b] leading-tight mb-2">
              {selectedArticle.title}
            </h3>

            <div className="flex items-center gap-3 text-xs text-[#94a3b8] mb-5 pb-3 border-b border-[#fce7f3]">
              <div className="flex items-center gap-1">
                <User size={13} />
                <span>{selectedArticle.author}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock size={13} />
                <span>{selectedArticle.readTime}</span>
              </div>
              <span>•</span>
              <span>{selectedArticle.publishDate}</span>
            </div>

            <div className="text-xs sm:text-sm text-[#475569] space-y-4 leading-relaxed">
              <p className="text-sm sm:text-base font-semibold text-[#1e293b]">
                {selectedArticle.summary}
              </p>
              <p>
                Tablet Tambah Darah (TTD) mengandung zat besi fero dan asam folat yang sangat esensial untuk regenerasi sel darah merah baru. Mengonsumsinya secara teratur 1 kali seminggu memastikan cadangan hemoglobin tubuh tetap prima, khususnya saat pubertas dan siklus haid.
              </p>
              <p className="p-4 bg-[#fff5f7] rounded-2xl border border-[#fce7f3] text-[#be123c] font-medium leading-relaxed">
                💡 <strong>Anjuran Dokter:</strong> Utamakan selalu meminum TTD bersama air putih atau buah bervitamin C tinggi seperti jeruk, jambu biji, atau tomat, dan hindari minum bersama kopi atau teh manis.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#fce7f3]">
              <Button
                variant="primary"
                size="md"
                shape="pill"
                fullWidth
                onClick={() => setSelectedArticle(null)}
              >
                Tutup Bacaan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
