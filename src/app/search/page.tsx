'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'

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

export default function SearchPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // 전화번호 자동 하이픈 포맷팅
    if (name === 'phone') {
      const formattedPhone = formatPhoneNumber(value)
      setFormData(prev => ({ ...prev, [name]: formattedPhone }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    
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
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return

    setLoading(true)

    try {
      // 검색 파라미터를 쿼리스트링으로 전달 (전화번호는 하이픈 제거)
      const params = new URLSearchParams({
        name: formData.name,
        phone: formData.phone.replace(/[^\d]/g, ''),
      })
      router.push(`/search/list?${params.toString()}`)
    } catch (error) {
      alert('조회 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-6">
      <h1 className="text-2xl font-bold text-center mb-12">
        A/S 신청 조회하기
      </h1>

      <form onSubmit={handleSubmit} className="w-full max-w-md">
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
            조회하기
          </Button>
        </div>
      </form>
    </div>
  )
}
