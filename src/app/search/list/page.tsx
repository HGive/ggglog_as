'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Loading from '@/components/Loading'
import { getStatusLabel } from '@/lib/status'

interface Application {
  id: number
  title: string
  status: string
  created_at: string
}

export default function SearchListPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const name = searchParams.get('name')
  const phone = searchParams.get('phone')

  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!name || !phone) {
      router.push('/search')
      return
    }

    const fetchApplications = async () => {
      try {
        const params = new URLSearchParams({ name, phone })
        const response = await fetch(`/api/applications?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error('조회에 실패했습니다')
        }

        const data = await response.json()
        setApplications(data.applications || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다')
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [name, phone, router])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}.${month}.${day}`
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

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-center mb-8">
        {name} 건축주님의 에필로그_
      </h1>

      {applications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-6">신청 내역이 없습니다.</p>
          <Link href="/apply" className="text-black underline">
            A/S 신청하기
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-black text-white">
                <th className="py-3 px-4 text-left font-medium">제목</th>
                <th className="py-3 px-4 text-center font-medium whitespace-nowrap">날짜</th>
                <th className="py-3 px-4 text-center font-medium whitespace-nowrap">진행상황</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr
                  key={app.id}
                  className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    const params = new URLSearchParams({ name: name!, phone: phone!, id: String(app.id) })
                    router.push(`/search/detail?${params.toString()}`)
                  }}
                >
                  <td className="py-4 px-4">{app.title}</td>
                  <td className="py-4 px-4 text-center whitespace-nowrap">{formatDate(app.created_at)}</td>
                  <td className="py-4 px-4 text-center whitespace-nowrap">{getStatusLabel(app.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
