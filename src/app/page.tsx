import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] px-6">
      {/* 필기체 로고 */}
      <h1 className="font-handwriting text-8xl md:text-7xl mb-6">
        epilogue
      </h1>
      
      {/* 소개 텍스트 */}
      <p className="text-center text-lg mb-1">완공 후의 이야기,</p>
      <p className="text-center text-lg mb-16">공간기록 애프터서비스 센터</p>
      
      {/* 메뉴 버튼들 */}
      <div className="w-full max-w-md">
        <Link href="/apply" className="menu-item">
          <span className="text-lg font-medium">A/S 신청하기</span>
          <span className="text-xl">›</span>
        </Link>
        
        <Link href="/search" className="menu-item">
          <span className="text-lg font-medium">A/S 신청 조회하기</span>
          <span className="text-xl">›</span>
        </Link>
        
        <Link href="/guide" className="menu-item">
          <span className="text-lg font-medium">리빙가이드</span>
          <span className="text-xl">›</span>
        </Link>
      </div>
    </div>
  )
}
