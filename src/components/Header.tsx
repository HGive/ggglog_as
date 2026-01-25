'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  
  // 관리자 로그인 상태 확인
  useEffect(() => {
    if (pathname.startsWith('/admin')) {
      const checkAuth = async () => {
        try {
          const response = await fetch('/api/admin/applications', {
            method: 'GET',
            credentials: 'include',
          })
          setIsAdminLoggedIn(response.ok)
        } catch {
          setIsAdminLoggedIn(false)
        }
      }
      checkAuth()
    }
  }, [pathname])

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
  
  // 관리자 페이지에서는 다른 헤더 사용
  if (pathname.startsWith('/admin')) {
    return (
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-6 py-4">
          <Link href="/admin/dashboard">
            <Image
              src="/images/ggglog-logo.png"
              alt="공간기록"
              width={120}
              height={40}
              style={{ width: 80, height: 'auto' }}
              priority
            />
          </Link>
          {isAdminLoggedIn && (
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-black transition-colors"
            >
              로그아웃
            </button>
          )}
        </div>
      </header>
    )
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          {/* 로고 */}
          <Link href="/">
            <Image
              src="/images/ggglog-logo.png"
              alt="공간기록"
              width={140}
              height={40}
              style={{ width: 120, height: 'auto' }}
              priority
            />
          </Link>
          
          {/* 햄버거 메뉴 버튼 */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex flex-col gap-1.5 p-2"
            aria-label="메뉴 열기"
          >
            <span className="block w-6 h-0.5 bg-black"></span>
            <span className="block w-6 h-0.5 bg-black"></span>
            <span className="block w-6 h-0.5 bg-black"></span>
          </button>
        </div>
      </header>

      {/* 모바일 메뉴 오버레이 */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="flex items-center justify-between px-6 py-4">
            <Link href="/" onClick={() => setIsMenuOpen(false)}>
              <Image
                src="/images/ggglog-logo.png"
                alt="공간기록"
                width={120}
                height={40}
                style={{ width: 140, height: 'auto' }}
              />
            </Link>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 text-2xl"
              aria-label="메뉴 닫기"
            >
              ✕
            </button>
          </div>
          
          <nav className="px-6 py-8">
            <ul className="space-y-6">
              <li>
                <Link
                  href="/"
                  className="block text-2xl font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  홈
                </Link>
              </li>
              <li>
                <Link
                  href="/apply"
                  className="block text-2xl font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  A/S 신청하기
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className="block text-2xl font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  A/S 신청 조회하기
                </Link>
              </li>
              <li>
                <Link
                  href="/guide"
                  className="block text-2xl font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  리빙가이드
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  )
}
