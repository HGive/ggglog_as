'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Stepper from '@/components/Stepper'
import Loading from '@/components/Loading'

interface Attachment {
  id: number
  file_name: string
  file_path: string
  file_size: number
}

interface Application {
  id: number
  name: string
  phone: string
  email: string
  address: string
  completion_year: string
  site_manager: string | null
  designer: string | null
  title: string
  content: string
  status: string
  created_at: string
  attachments: Attachment[]
}

export default function SearchDetailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const name = searchParams.get('name')
  const phone = searchParams.get('phone')
  const id = searchParams.get('id')

  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!name || !phone || !id) {
      router.push('/search')
      return
    }

    const fetchApplication = async () => {
      try {
        const params = new URLSearchParams({ name, phone })
        const response = await fetch(`/api/applications/${id}?${params.toString()}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('신청 내역을 찾을 수 없습니다')
          }
          if (response.status === 403) {
            throw new Error('권한이 없습니다')
          }
          throw new Error('조회에 실패했습니다')
        }

        const data = await response.json()
        setApplication(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다')
      } finally {
        setLoading(false)
      }
    }

    fetchApplication()
  }, [name, phone, id, router])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\. /g, '.').replace('.', '')
  }

  const getStatusMessage = (status: string) => {
    const messages: Record<string, string> = {
      '신청': '신청이 접수되었습니다.',
      '접수완료': '접수완료! 빠르게 해결해드릴게요.',
      '담당자 배정': '담당자가 배정되었습니다.',
      '일정 조율 중': '일정 조율 중입니다.',
      'A/S 완료': 'A/S가 완료되었습니다.',
      '처리완료': '모든 처리가 완료되었습니다.',
    }
    return messages[status] || '처리 중입니다.'
  }

  const handleDownload = async (attachment: Attachment) => {
    try {
      const response = await fetch(`/api/files/${attachment.id}`)
      if (!response.ok) throw new Error('다운로드 실패')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = attachment.file_name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      alert('파일 다운로드에 실패했습니다')
    }
  }

  if (loading) return <Loading />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-6">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => router.push('/search')}
          className="text-black underline"
        >
          다시 조회하기
        </button>
      </div>
    )
  }

  if (!application) return null

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-center mb-4">
        {application.name} 건축주님의 에필로그_
      </h1>

      {/* 상태 메시지 */}
      <p className="text-center text-gray-600 mb-8">
        {getStatusMessage(application.status)}
      </p>

      {/* 진행 상태 스테퍼 */}
      <Stepper currentStatus={application.status} />

      {/* 신청 내용 */}
      <div className="mt-12 space-y-6">
        {/* 제목과 날짜 */}
        <div className="flex justify-between items-start border-b border-black pb-4">
          <h2 className="text-lg font-medium">{application.title}</h2>
          <span className="text-gray-500 whitespace-nowrap ml-4">{formatDate(application.created_at)}</span>
        </div>

        {/* 내용 */}
        <div className="py-4 whitespace-pre-wrap text-gray-700">
          {application.content}
        </div>

        {/* 첨부파일 */}
        {application.attachments && application.attachments.length > 0 && (
          <div className="pt-4">
            <div className="grid grid-cols-2 gap-4">
              {application.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-gray-400 transition-colors"
                  onClick={() => handleDownload(attachment)}
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="p-2 text-xs text-gray-500 truncate">{attachment.file_name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 목록으로 돌아가기 */}
      <div className="mt-12 text-center">
        <button
          onClick={() => {
            const params = new URLSearchParams({ name: name!, phone: phone! })
            router.push(`/search/list?${params.toString()}`)
          }}
          className="text-gray-500 hover:text-black underline"
        >
          목록으로 돌아가기
        </button>
      </div>
    </div>
  )
}
