import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 관리자 페이지 및 API만 체크
  if (pathname.startsWith('/admin')) {
    // 로그인 페이지와 로그인 API는 제외
    if (pathname === '/admin/login' || pathname === '/api/admin/login') {
      return NextResponse.next()
    }

    // 쿠키에서 토큰 가져오기
    const token = request.cookies.get('admin_token')?.value

    if (!token) {
      // 토큰 없음 → 로그인 페이지로 리다이렉트
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json(
          { message: '인증이 필요합니다' },
          { status: 401 }
        )
      }
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // 토큰 검증
    const payload = await verifyToken(token)
    if (!payload) {
      // 토큰 만료 또는 유효하지 않음 → 로그아웃 처리
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json(
          { message: '인증이 만료되었습니다' },
          { status: 401 }
        )
      }
      // 쿠키 삭제하고 로그인 페이지로
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete('admin_token')
      return response
    }
  }

  return NextResponse.next()
}

// 미들웨어가 실행될 경로 지정
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
}
