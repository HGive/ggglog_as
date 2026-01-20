'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  
  // 관리자 페이지에서는 다른 헤더 사용
  if (pathname.startsWith('/admin')) {
    return (
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-6 py-4">
          <Link href="/admin/dashboard" className="text-xl font-bold tracking-wide">
            ㄱㄱㄱ트
          </Link>
          <span className="text-sm text-gray-500">관리자</span>
        </div>
      </header>
    )
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          {/* 로고 */}
          <Link href="/" className="text-xl font-bold tracking-wide">
            ㄱㄱㄱ트
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
            <Link href="/" className="text-xl font-bold tracking-wide" onClick={() => setIsMenuOpen(false)}>
              ㄱㄱㄱ트
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
