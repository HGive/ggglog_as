'use client'

import { useState, useRef, useEffect } from 'react'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

const WELCOME_MESSAGE: Message = {
  role: 'assistant',
  content: '안녕하세요? 저는\n완공 후 건축주님을 위한 주거 관리 도우미입니다.\n건축 관리에 대해서 무엇이든 물어보세요.',
}

export default function GuidePage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showGuideModal, setShowGuideModal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  const handleSubmit = async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    const userMsg: Message = { role: 'user', content: trimmed }
    // 웰컴 메시지 제외하고 API에 전달할 실제 대화 이력
    const apiMessages = [...messages.slice(1), userMsg].map(m => ({
      role: m.role,
      content: m.content,
    }))

    setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '' }])
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    setIsLoading(true)

    try {
      const response = await fetch('/api/guide/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      })

      if (!response.ok || !response.body) {
        throw new Error('API error')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: accumulated }
          return updated
        })
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: '죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.',
        }
        return updated
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const isLastMessageLoading =
    isLoading &&
    messages[messages.length - 1]?.role === 'assistant' &&
    messages[messages.length - 1]?.content === ''

  return (
    <>
      <div className="max-w-2xl mx-auto px-6 pb-36">
        {/* 상단 헤더 */}
        <div className="sticky top-0 bg-white z-20 -mx-6 px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100">
          <h1 className="font-handwriting text-4xl">living guide</h1>
          <button
            onClick={() => setShowGuideModal(true)}
            className="text-sm text-gray-500 border border-gray-200 rounded-full px-4 py-1.5 hover:bg-gray-50 transition-colors"
          >
            가이드 보기
          </button>
        </div>

        {/* 메시지 목록 */}
        <div className="pt-6 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && msg.content === '' && isLastMessageLoading ? (
                /* 타이핑 인디케이터 */
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              ) : (
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-black text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 고정 입력창 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-end gap-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요... (Shift+Enter로 줄바꿈)"
              disabled={isLoading}
              className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50 min-h-[44px] max-h-[120px]"
              rows={1}
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className="bg-black text-white rounded-xl px-5 py-3 text-sm font-medium disabled:opacity-30 hover:opacity-80 transition-opacity shrink-0"
            >
              전송
            </button>
          </div>
        </div>
      </div>

      {/* PDF 가이드 모달 - 전체 화면 너비 */}
      {showGuideModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowGuideModal(false) }}
        >
          <div className="bg-white rounded-2xl w-full h-full max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h2 className="font-handwriting text-3xl">living guide</h2>
              <button
                onClick={() => setShowGuideModal(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors text-xl w-8 h-8 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <iframe
              src="/living-guide.pdf"
              className="flex-1 w-full rounded-b-2xl"
              title="공간기록 리빙가이드"
            />
          </div>
        </div>
      )}
    </>
  )
}
