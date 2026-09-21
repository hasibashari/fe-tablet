'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Bot,
  Send,
  Sparkles,
  AlertCircle,
  RotateCcw,
  User,
  Info,
  ChevronRight,
} from 'lucide-react'
import { Card } from '@/src/shared/components/ui/Card'
import {
  MOCK_CONSULTATION_TOPICS,
  MOCK_INITIAL_CHAT,
  ChatMessageMock,
} from '@/src/shared/mock/feTabletData'

export default function ConsultationPage() {
  const [messages, setMessages] = useState<ChatMessageMock[]>(MOCK_INITIAL_CHAT)
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim()
    if (!text) return

    const userMsg: ChatMessageMock = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
    }

    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInputText('')
    setIsTyping(true)

    // Simulate smart AI response after 700ms
    setTimeout(() => {
      const matchedTopic = MOCK_CONSULTATION_TOPICS.find((t) =>
        t.prompt.toLowerCase().includes(text.toLowerCase()) || text.toLowerCase().includes(t.title.toLowerCase())
      )

      let answer = matchedTopic?.initialAnswer

      if (!answer) {
        if (text.toLowerCase().includes('mual') || text.toLowerCase().includes('efek')) {
          answer =
            'Rasa mual adalah reaksi adaptasi normal tubuh terhadap zat besi. Untuk mengatasinya: 1) Minum TTD tepat setelah makan malam atau sebelum tidur, 2) Jangan minum saat perut kosong, 3) Minum bersama segelas air putih hangat.'
        } else if (text.toLowerCase().includes('jeruk') || text.toLowerCase().includes('vitamin')) {
          answer =
            'Sangat boleh dan dianjurkan! Vitamin C yang terkandung dalam air jeruk, lemon, atau buah segar membantu meningkatkan penyerapan zat besi di lambung hingga 2-3 kali lipat.'
        } else if (text.toLowerCase().includes('teh') || text.toLowerCase().includes('kopi') || text.toLowerCase().includes('susu')) {
          answer =
            'Teh dan kopi mengandung senyawa tanin dan polifenol yang dapat mengikat zat besi sebelum sempat diserap oleh usus. Beri jeda minimal 2 jam jika ingin menikmati teh/kopi.'
        } else {
          answer =
            'Terima kasih atas pertanyaannya! Untuk hasil terbaik, pastikan kamu rutin mengonsumsi 1 tablet TTD setiap minggu pada hari yang sama, konsumsi makanan kaya zat besi seperti bayam dan hati, serta jaga tidur cukup minimal 8 jam.'
        }
      }

      const assistantMsg: ChatMessageMock = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: answer,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      }

      setMessages((prev) => [...prev, assistantMsg])
      setIsTyping(false)
    }, 800)
  }

  const handleTopicClick = (promptText: string) => {
    handleSendMessage(promptText)
  }

  const handleResetChat = () => {
    setMessages(MOCK_INITIAL_CHAT)
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Screen Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1e293b] tracking-tight">
            Konsultasi AI (Asisten Fe-Tablet)
          </h2>
          <p className="text-xs sm:text-sm text-[#64748b]">
            Tanya jawab pintar seputar anemia & tips minum tablet
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetChat}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#64748b] hover:text-[#e11d48] rounded-xl hover:bg-rose-50 transition-colors border border-[#fce7f3] bg-white cursor-pointer"
          title="Reset Percakapan"
        >
          <RotateCcw size={14} />
          <span>Reset Chat</span>
        </button>
      </div>

      {/* Main Responsive Layout: Mobile Full / Desktop Split Panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-start h-[calc(100vh-210px)] min-h-[520px] max-h-[750px]">
        {/* LEFT PANEL: Suggested Questions & Topics (Visible stacked on mobile, left sidebar on md+) */}
        <div className="hidden md:flex md:col-span-4 flex-col gap-4 h-full overflow-y-auto">
          <Card padding="md" className="bg-gradient-to-br from-[#fff5f7] to-[#ffe4e6]">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-400 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
                <Bot size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1e293b]">Asisten Pintar Fe</h4>
                <span className="text-[10px] text-[#059669] font-semibold">● Online 24/7</span>
              </div>
            </div>
            <p className="text-xs text-[#475569] leading-relaxed">
              Siap memberikan penjelasan medis edukatif seputar efek samping, cara minum, dan nutrisi penambah darah.
            </p>
          </Card>

          <Card padding="md" className="flex-1 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-[#1e293b] mb-3 flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#e11d48]" />
                <span>Pertanyaan Populer:</span>
              </h4>

              <div className="space-y-2">
                {MOCK_CONSULTATION_TOPICS.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => handleTopicClick(topic.prompt)}
                    className="w-full text-left p-2.5 bg-[#fff5f7] hover:bg-[#ffe4e6] rounded-xl border border-[#fce7f3] transition-all text-xs font-medium text-[#1e293b] flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 pr-2">
                      <span className="text-base">{topic.icon}</span>
                      <span className="line-clamp-2">{topic.title}</span>
                    </div>
                    <ChevronRight size={14} className="text-[#94a3b8] group-hover:text-[#e11d48] shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#fce7f3] flex items-start gap-1.5 text-[10px] text-[#64748b]">
              <Info size={13} className="text-rose-500 shrink-0 mt-0.5" />
              <span>Jawaban disesuaikan dengan pedoman Kemenkes RI untuk suplementasi TTD remaja.</span>
            </div>
          </Card>
        </div>

        {/* RIGHT PANEL: Chat Conversation (md:col-span-8) */}
        <div className="md:col-span-8 h-full flex flex-col">
          {/* Mobile-Only Horizontal Chips Bar */}
          <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-2 mb-2 no-scrollbar">
            {MOCK_CONSULTATION_TOPICS.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => handleTopicClick(topic.prompt)}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-[#475569] text-[11px] font-medium rounded-full border border-[#fce7f3] hover:bg-[#fff1f2] hover:text-[#e11d48] transition-all shrink-0 cursor-pointer shadow-2xs"
              >
                <span>{topic.icon}</span>
                <span>{topic.title}</span>
              </button>
            ))}
          </div>

          <Card padding="md" className="flex-1 flex flex-col justify-between overflow-hidden bg-[#fffdfd] shadow-sm">
            {/* Scrollable Message List */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 pb-2">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user'

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar Icon */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white ${
                        isUser
                          ? 'bg-rose-500'
                          : 'bg-gradient-to-tr from-rose-600 to-rose-400 shadow-xs'
                      }`}
                    >
                      {isUser ? <User size={16} /> : <Bot size={16} />}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                        isUser
                          ? 'bg-[#e11d48] text-white rounded-tr-none'
                          : 'bg-white text-[#1e293b] border border-[#fce7f3] rounded-tl-none'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span
                        className={`text-[10px] block mt-1.5 ${
                          isUser ? 'text-rose-100 text-right' : 'text-[#94a3b8]'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                )
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="bg-white border border-[#fce7f3] rounded-2xl rounded-tl-none px-4 py-2.5 text-xs text-[#94a3b8] flex items-center gap-1.5 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e11d48] animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e11d48] animate-bounce delay-150" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e11d48] animate-bounce delay-300" />
                    <span className="text-xs font-medium ml-1">Asisten sedang mengetik...</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Medical Disclaimer Banner */}
            <div className="bg-[#fff5f7] border border-[#fce7f3] rounded-xl p-2.5 my-2 flex items-center gap-2">
              <AlertCircle size={14} className="text-[#e11d48] shrink-0" />
              <p className="text-[11px] text-[#64748b]">
                Informasi ini bersifat edukatif dan bukan pengganti saran, resep, atau diagnosa medis dokter.
              </p>
            </div>

            {/* Input Message Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="flex items-center gap-2.5 pt-2 border-t border-[#fce7f3]"
            >
              <input
                type="text"
                placeholder="Ketik pertanyaan seputar Tablet Tambah Darah..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-[#fff5f7] text-[#1e293b] placeholder-[#94a3b8] text-xs sm:text-sm rounded-full border border-[#fce7f3] focus:border-[#e11d48] px-4 py-3 outline-none"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="w-11 h-11 rounded-full bg-[#e11d48] text-white hover:bg-[#be123c] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0 shadow-sm shadow-rose-500/20 transition-all cursor-pointer"
              >
                <Send size={17} />
              </button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
