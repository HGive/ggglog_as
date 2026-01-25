'use client'

import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()
  
  // 관리자 페이지에서는 푸터 숨김
  if (pathname === '/' || pathname.startsWith('/admin')) {
    return null
  }

  return (
    <footer className="py-12 text-center">
      <p className="font-handwriting text-4xl mb-2">epilogue</p>
      <p className="text-sm text-gray-600">완공 후의 이야기,</p>
      <p className="text-sm text-gray-600">공간기록 애프터서비스 센터</p>
    </footer>
  )
}
