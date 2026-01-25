import { NextResponse } from 'next/server'
import { removeTokenCookie } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    await removeTokenCookie()
    return NextResponse.json({ message: '로그아웃 되었습니다' })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
