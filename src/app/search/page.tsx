'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'

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
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = '성함을 입력해주세요'
    if (!formData.phone.trim()) newErrors.phone = '연락처를 입력해주세요'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return

    setLoading(true)

    try {
      // 검색 파라미터를 쿼리스트링으로 전달
      const params = new URLSearchParams({
        name: formData.name,
        phone: formData.phone,
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
          required
          error={errors.name}
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
