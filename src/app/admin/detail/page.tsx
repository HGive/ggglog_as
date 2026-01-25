'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Stepper, { STEPS } from '@/components/Stepper'
import Loading from '@/components/Loading'
import { Button } from '@/components/Button'
import ImageModal from '@/components/ImageModal'
import { STATUS_CODES, getStatusLabel } from '@/lib/status'

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
  updated_at: string
  attachments: Attachment[]
}

export default function AdminDetailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (!id) {
      router.push('/admin/dashboard')
      return
    }

    const fetchApplication = async () => {
      try {
        const response = await fetch(`/api/admin/applications/${id}`)
        
        if (response.status === 401) {
          router.push('/admin/login')
          return
        }

        if (!response.ok) {
          throw new Error('조회에 실패했습니다')
        }

        const data = await response.json()
        setApplication(data)
        setSelectedStatus(data.status)
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다')
      } finally {
        setLoading(false)
      }
    }

    fetchApplication()
  }, [id, router])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}.${month}.${day} ${hours}:${minutes}`
  }

  const handleStatusChange = async () => {
    if (!application || selectedStatus === application.status) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/applications/${application.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: selectedStatus }),
      })

      if (!response.ok) {
        throw new Error('상태 변경에 실패했습니다')
      }

      setApplication(prev => prev ? { ...prev, status: selectedStatus } : null)
      alert('진행상황이 변경되었습니다.')
    } catch (err) {
      alert(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setSaving(false)
    }
  }

  const openImageModal = (attachmentIndex: number) => {
    if (!application || !application.attachments) return
    
    // 이미지 파일만 필터링
    const imageAttachments = application.attachments.filter(att => 
      /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(att.file_name)
    )
    
    // 원본 배열의 인덱스를 필터링된 배열의 인덱스로 변환
    const imageIndex = imageAttachments.findIndex(
      img => img.id === application.attachments[attachmentIndex].id
    )
    
    if (imageIndex >= 0) {
      setCurrentImageIndex(imageIndex)
      setModalOpen(true)
    }
  }

  const closeImageModal = () => {
    setModalOpen(false)
  }

  const nextImage = () => {
    if (!application || !application.attachments) return
    
    const imageAttachments = application.attachments.filter(att => 
      /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(att.file_name)
    )
    
    setCurrentImageIndex((prev) => 
      prev < imageAttachments.length - 1 ? prev + 1 : prev
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : prev))
  }

  // 이미지 URL 생성
  const getImageUrl = (attachmentId: number) => {
    const url = `/api/files/${attachmentId}`
    console.log('Image URL:', url)
    return url
  }

  if (loading) return <Loading />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="text-black underline"
        >
          목록으로 돌아가기
        </button>
      </div>
    )
  }

  if (!application) return null

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 뒤로가기 */}
      <button
        onClick={() => router.push('/admin/dashboard')}
        className="mb-6 text-gray-500 hover:text-black flex items-center gap-1"
      >
        ← 목록으로
      </button>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-2">
          {application.name} 건축주님의 에필로그_
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          신청일: {formatDate(application.created_at)}
        </p>

        {/* 진행 상태 스테퍼 */}
        <Stepper currentStatus={application.status} />

        {/* 진행상황 변경 */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium mb-2">진행상황 변경</label>
          <div className="flex gap-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="flex-1 border rounded px-3 py-2"
            >
              {STATUS_CODES.map((code) => (
                <option key={code} value={code}>
                  {getStatusLabel(code)}
                </option>
              ))}
            </select>
            <Button
              onClick={handleStatusChange}
              disabled={selectedStatus === application.status}
              loading={saving}
            >
              변경
            </Button>
          </div>
        </div>

        {/* 신청 정보 */}
        <div className="mt-8 space-y-6">
          <h2 className="text-lg font-bold border-b pb-2">신청 정보</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-500">성함</label>
              <p className="mt-1">{application.name}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-500">연락처</label>
              <p className="mt-1">{application.phone}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-500">이메일</label>
              <p className="mt-1">{application.email}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-500">완공년도</label>
              <p className="mt-1">{application.completion_year}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-500">현장주소</label>
              <p className="mt-1">{application.address}</p>
            </div>
            {application.site_manager && (
              <div>
                <label className="block text-sm text-gray-500">담당 현장소장</label>
                <p className="mt-1">{application.site_manager}</p>
              </div>
            )}
            {application.designer && (
              <div>
                <label className="block text-sm text-gray-500">담당 디자이너</label>
                <p className="mt-1">{application.designer}</p>
              </div>
            )}
          </div>
        </div>

        {/* A/S 신청 내용 */}
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-bold border-b pb-2">A/S 신청 내용</h2>
          
          <div>
            <label className="block text-sm text-gray-500">제목</label>
            <p className="mt-1 font-medium">{application.title}</p>
          </div>
          
          <div>
            <label className="block text-sm text-gray-500">내용</label>
            <p className="mt-1 whitespace-pre-wrap bg-gray-50 p-4 rounded">
              {application.content}
            </p>
          </div>
        </div>

        {/* 첨부파일 */}
        {application.attachments && application.attachments.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-bold border-b pb-2">첨부파일</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {application.attachments.map((attachment, index) => {
                const imageUrl = getImageUrl(attachment.id)
                const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(attachment.file_name)
                
                return (
                  <div
                    key={attachment.id}
                    className="border rounded-lg overflow-hidden cursor-pointer hover:border-gray-400 transition-colors"
                    onClick={() => isImage ? openImageModal(index) : undefined}
                  >
                    <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden relative">
                      {isImage ? (
                        <>
                          <img
                            src={imageUrl}
                            alt={attachment.file_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('Image load error:', imageUrl, e)
                              // 이미지 로드 실패 시 아이콘 표시
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              const parent = target.parentElement
                              if (parent && !parent.querySelector('svg')) {
                                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
                                svg.setAttribute('class', 'w-12 h-12 text-gray-400')
                                svg.setAttribute('fill', 'none')
                                svg.setAttribute('stroke', 'currentColor')
                                svg.setAttribute('viewBox', '0 0 24 24')
                                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
                                path.setAttribute('stroke-linecap', 'round')
                                path.setAttribute('stroke-linejoin', 'round')
                                path.setAttribute('stroke-width', '1.5')
                                path.setAttribute('d', 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z')
                                svg.appendChild(path)
                                parent.appendChild(svg)
                              }
                            }}
                            onLoad={() => {
                              console.log('Image loaded successfully:', imageUrl)
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-20">
                            <span className="text-white text-sm">클릭하여 크게 보기</span>
                          </div>
                        </>
                      ) : (
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-gray-500 truncate">{attachment.file_name}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 이미지 모달 */}
        {modalOpen && application && application.attachments && (
          <ImageModal
            images={application.attachments
              .filter(att => /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(att.file_name))
              .map(att => ({
                id: att.id,
                url: getImageUrl(att.id),
                name: att.file_name,
              }))}
            currentIndex={currentImageIndex}
            onClose={closeImageModal}
            onNext={nextImage}
            onPrev={prevImage}
          />
        )}

        {/* 하단 버튼 */}
        <div className="mt-12 flex gap-4 justify-center">
          <Button
            variant="secondary"
            onClick={() => router.push('/admin/dashboard')}
          >
            목록으로
          </Button>
        </div>
      </div>
    </div>
  )
}
