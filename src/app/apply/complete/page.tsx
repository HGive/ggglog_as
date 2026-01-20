import Link from 'next/link'

export default function ApplyCompletePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-6">
      <div className="text-center mb-16">
        <p className="text-xl font-medium mb-4">접수 처리 되었습니다.</p>
        <p className="text-gray-600 mb-2">담당자 배정까지 영업일 기준 2일 정도 소요됩니다.</p>
        <p className="text-gray-600 mt-8">건축주님들의 불편을 덜어드릴 수 있게</p>
        <p className="text-gray-600">빠르게 연락드리겠습니다.</p>
      </div>
      
      {/* 메뉴 버튼들 */}
      <div className="w-full max-w-md">
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
