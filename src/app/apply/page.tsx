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

// 전화번호 포맷팅 함수 (010-0000-0000)
const formatPhoneNumber = (value: string): string => {
  const numbers = value.replace(/[^\d]/g, '')
  if (numbers.length <= 3) return numbers
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
}

// 전화번호 검증 함수
const isValidPhoneNumber = (phone: string): boolean => {
  const numbers = phone.replace(/[^\d]/g, '')
  return /^01[016789]\d{7,8}$/.test(numbers)
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
    
    // 전화번호 자동 하이픈 포맷팅
    if (name === 'phone') {
      const formattedPhone = formatPhoneNumber(value)
      setFormData(prev => ({ ...prev, [name]: formattedPhone }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    
    // 입력 시 해당 필드 에러 클리어
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    // 이름: 필수, 10자 이하
    if (!formData.name.trim()) {
      newErrors.name = '성함을 입력해주세요'
    } else if (formData.name.trim().length > 10) {
      newErrors.name = '성함은 10자 이하로 입력해주세요'
    }

    // 연락처: 필수, 휴대폰 형식
    if (!formData.phone.trim()) {
      newErrors.phone = '연락처를 입력해주세요'
    } else if (!isValidPhoneNumber(formData.phone)) {
      newErrors.phone = '올바른 휴대폰 번호 형식이 아닙니다 (예: 010-1234-5678)'
    }

    // 이메일: 필수, 이메일 형식 (영문, 숫자, 특수문자만 허용)
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요'
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다 (영문, 숫자만 사용 가능)'
    }

    // 현장주소: 필수, 100자 이하
    if (!formData.address.trim()) {
      newErrors.address = '현장주소를 입력해주세요'
    } else if (formData.address.trim().length > 100) {
      newErrors.address = '현장주소는 100자 이하로 입력해주세요'
    }

    // 완공년도: 필수, 숫자 4자리
    if (!formData.completion_year.trim()) {
      newErrors.completion_year = '완공년도를 입력해주세요'
    } else if (!/^\d{4}$/.test(formData.completion_year.trim())) {
      newErrors.completion_year = '완공년도는 4자리 숫자로 입력해주세요 (예: 2024)'
    }

    // 디자이너 이름: 20자 이하 (선택 필드)
    if (formData.designer.trim().length > 20) {
      newErrors.designer = '디자이너 이름은 20자 이하로 입력해주세요'
    }

    // 현장소장 이름: 20자 이하 (선택 필드)
    if (formData.site_manager.trim().length > 20) {
      newErrors.site_manager = '현장소장 이름은 20자 이하로 입력해주세요'
    }

    // 제목: 필수, 50자 이하
    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요'
    } else if (formData.title.trim().length > 50) {
      newErrors.title = '제목은 50자 이하로 입력해주세요'
    }

    // 신청내용: 필수, 1000자 이하
    if (!formData.content.trim()) {
      newErrors.content = 'A/S 신청 내용을 입력해주세요'
    } else if (formData.content.trim().length > 1000) {
      newErrors.content = '신청 내용은 1000자 이하로 입력해주세요'
    }

    // 사진: 필수
    if (files.length === 0) {
      newErrors.files = '사진을 첨부해주세요'
    }

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
        // 전화번호는 하이픈 제거 후 전송
        if (key === 'phone') {
          submitData.append(key, value.replace(/[^\d]/g, ''))
        } else {
          submitData.append(key, value)
        }
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
            maxLength={10}
            required
            error={errors.name}
            helperText={`${formData.name.length}/10`}
            data-error={!!errors.name}
          />

          <Input
            label="연락처"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="010-0000-0000"
            maxLength={13}
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
            maxLength={100}
            required
            error={errors.address}
            helperText={`${formData.address.length}/100`}
            data-error={!!errors.address}
          />

          <Input
            label="완공년도"
            name="completion_year"
            value={formData.completion_year}
            onChange={handleChange}
            placeholder="예: 2024"
            maxLength={4}
            required
            error={errors.completion_year}
            helperText="4자리 숫자 입력"
            data-error={!!errors.completion_year}
          />

          <Input
            label="담당 현장소장"
            name="site_manager"
            value={formData.site_manager}
            onChange={handleChange}
            placeholder="담당 현장소장 이름"
            maxLength={20}
            error={errors.site_manager}
            helperText={`${formData.site_manager.length}/20`}
          />

          <Input
            label="담당 디자이너"
            name="designer"
            value={formData.designer}
            onChange={handleChange}
            placeholder="담당 디자이너 이름"
            maxLength={20}
            error={errors.designer}
            helperText={`${formData.designer.length}/20`}
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
              maxLength={50}
              error={errors.title}
              helperText={`${formData.title.length}/50`}
              data-error={!!errors.title}
            />
            <Textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="A/S 신청 내용을 자세히 작성해주세요"
              rows={6}
              maxLength={1000}
              error={errors.content}
              helperText={`${formData.content.length}/1000`}
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
