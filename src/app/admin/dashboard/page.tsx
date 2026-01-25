'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Loading from '@/components/Loading'
import { getStatusLabel } from '@/lib/status'

interface Application {
  id: number
  name: string
  phone: string
  email: string
  title: string
  status: string
  created_at: string
}

interface Filters {
  name: string
  phone: string
  title: string
  startDate: string
  endDate: string
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>({
    name: '',
    phone: '',
    title: '',
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch('/api/admin/applications')
        
        if (response.status === 401) {
          router.push('/admin/login')
          return
        }

        if (!response.ok) {
          throw new Error('조회에 실패했습니다')
        }

        const data = await response.json()
        setApplications(data.applications || [])
        setFilteredApplications(data.applications || [])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [router])

  // 필터링
  useEffect(() => {
    let result = [...applications]

    if (filters.name) {
      result = result.filter(app => 
        app.name.toLowerCase().includes(filters.name.toLowerCase())
      )
    }

    if (filters.phone) {
      result = result.filter(app => 
        app.phone.includes(filters.phone)
      )
    }

    if (filters.title) {
      result = result.filter(app => 
        app.title.toLowerCase().includes(filters.title.toLowerCase())
      )
    }

    if (filters.startDate) {
      result = result.filter(app => 
        new Date(app.created_at) >= new Date(filters.startDate)
      )
    }

    if (filters.endDate) {
      result = result.filter(app => 
        new Date(app.created_at) <= new Date(filters.endDate + 'T23:59:59')
      )
    }

    setFilteredApplications(result)
  }, [filters, applications])

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const clearFilters = () => {
    setFilters({
      name: '',
      phone: '',
      title: '',
      startDate: '',
      endDate: '',
    })
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}.${month}.${day}`
  }

  if (loading) return <Loading />

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">A/S 신청 관리</h1>
      </div>

      {/* 검색 필터 */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="hidden md:block text-sm text-gray-600 mb-1">이름</label>
            <input
              type="text"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
              placeholder="이름 검색"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="hidden md:block text-sm text-gray-600 mb-1">연락처</label>
            <input
              type="text"
              name="phone"
              value={filters.phone}
              onChange={handleFilterChange}
              placeholder="연락처 검색"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="hidden md:block text-sm text-gray-600 mb-1">제목</label>
            <input
              type="text"
              name="title"
              value={filters.title}
              onChange={handleFilterChange}
              placeholder="제목 검색"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="hidden md:block text-sm text-gray-600 mb-1">시작일</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              placeholder="시작일"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="hidden md:block text-sm text-gray-600 mb-1">종료일</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              placeholder="종료일"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-black"
          >
            필터 초기화
          </button>
        </div>
      </div>

      {/* 결과 카운트 */}
      <div className="mb-4 text-sm text-gray-600">
        총 {filteredApplications.length}건
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="py-3 px-4 text-left font-medium text-sm">이름</th>
                <th className="py-3 px-4 text-left font-medium text-sm">연락처</th>
                <th className="py-3 px-4 text-left font-medium text-sm">제목</th>
                <th className="py-3 px-4 text-center font-medium text-sm">신청일</th>
                <th className="py-3 px-4 text-center font-medium text-sm">진행상황</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    신청 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr
                    key={app.id}
                    className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/detail?id=${app.id}`)}
                  >
                    <td className="py-3 px-4">{app.name}</td>
                    <td className="py-3 px-4">{app.phone}</td>
                    <td className="py-3 px-4">{app.title}</td>
                    <td className="py-3 px-4 text-center">{formatDate(app.created_at)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        app.status === '01' ? 'bg-gray-100 text-gray-800' :
                        ['02', '03', '04'].includes(app.status) ? 'bg-blue-100 text-blue-800' :
                        ['05', '06'].includes(app.status) ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getStatusLabel(app.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
