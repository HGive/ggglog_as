'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input, Textarea } from '@/components/Input'
import { Button } from '@/components/Button'
import FileUpload from '@/components/FileUpload'
import { LoadingOverlay } from '@/components/Loading'

interface FormData {
  name: string
  phone: string
  email: string
  address: string
  completion_year: string
  site_manager: string
  designer: string
  title: string
  content: string
}

export default function ApplyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    address: '',
    completion_year: '',
    site_manager: '',
    designer: '',
    title: '',
    content: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // 입력 시 해당 필드 에러 클리어
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = '성함을 입력해주세요'
    if (!formData.phone.trim()) newErrors.phone = '연락처를 입력해주세요'
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다'
    }
    if (!formData.address.trim()) newErrors.address = '현장주소를 입력해주세요'
    if (!formData.completion_year.trim()) newErrors.completion_year = '완공년도를 입력해주세요'
    if (!formData.title.trim()) newErrors.title = '제목을 입력해주세요'
    if (!formData.content.trim()) newErrors.content = 'A/S 신청 내용을 입력해주세요'
    if (files.length === 0) newErrors.files = '사진을 첨부해주세요'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) {
      // 첫 번째 에러 필드로 스크롤
      const firstErrorField = document.querySelector('[data-error="true"]')
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setLoading(true)

    try {
      // FormData 생성
      const submitData = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value)
      })
      files.forEach((file) => {
        submitData.append('files', file)
      })

      const response = await fetch('/api/applications', {
        method: 'POST',
        body: submitData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '신청에 실패했습니다')
      }

      // 성공 시 완료 페이지로 이동
      router.push('/apply/complete')
    } catch (error) {
      alert(error instanceof Error ? error.message : '신청 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {loading && <LoadingOverlay />}
      
      <div className="max-w-lg mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-center mb-12">
          당신의 이야기를 들려주세요
        </h1>

        <form onSubmit={handleSubmit}>
          <Input
            label="성함"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="성함을 입력해주세요"
            required
            error={errors.name}
            data-error={!!errors.name}
          />

          <Input
            label="연락처"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="010-0000-0000"
            required
            error={errors.phone}
            data-error={!!errors.phone}
          />

          <Input
            label="이메일"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@email.com"
            helperText="*A/S 진행사항은 이메일로 확인하실 수 있습니다"
            required
            error={errors.email}
            data-error={!!errors.email}
          />

          <Input
            label="현장주소"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="현장 주소를 입력해주세요"
            required
            error={errors.address}
            data-error={!!errors.address}
          />

          <Input
            label="완공년도"
            name="completion_year"
            value={formData.completion_year}
            onChange={handleChange}
            placeholder="예: 2024"
            required
            error={errors.completion_year}
            data-error={!!errors.completion_year}
          />

          <Input
            label="담당 현장소장"
            name="site_manager"
            value={formData.site_manager}
            onChange={handleChange}
            placeholder="담당 현장소장 이름"
          />

          <Input
            label="담당 디자이너"
            name="designer"
            value={formData.designer}
            onChange={handleChange}
            placeholder="담당 디자이너 이름"
          />

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              A/S 신청내용 <span className="text-red-500">*</span>
            </label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="제목을 입력해주세요"
              error={errors.title}
              data-error={!!errors.title}
            />
            <Textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="A/S 신청 내용을 자세히 작성해주세요"
              rows={6}
              error={errors.content}
              data-error={!!errors.content}
            />
          </div>

          <FileUpload
            onFilesChange={setFiles}
            maxSize={50}
            maxFiles={10}
            accept="image/*"
            error={errors.files}
          />

          <div className="flex gap-4 mt-10">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => router.push('/')}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              loading={loading}
            >
              신청하기
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
