import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { compare } from 'bcryptjs'
import { createToken, setTokenCookie } from '@/lib/auth'
import { RowDataPacket } from 'mysql2'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { message: '아이디와 비밀번호를 입력해주세요' },
        { status: 400 }
      )
    }

    // 관리자 조회
    const [admins] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM admins WHERE username = ?`,
      [username]
    )

    if (admins.length === 0) {
      return NextResponse.json(
        { message: '아이디 또는 비밀번호가 일치하지 않습니다' },
        { status: 401 }
      )
    }

    const admin = admins[0]

    // 비밀번호 검증
    const isValid = await compare(password, admin.password)
    if (!isValid) {
      return NextResponse.json(
        { message: '아이디 또는 비밀번호가 일치하지 않습니다' },
        { status: 401 }
      )
    }

    // JWT 토큰 생성 및 쿠키 설정
    const token = await createToken({
      adminId: admin.id,
      username: admin.username,
    })

    await setTokenCookie(token)

    return NextResponse.json({
      message: '로그인 성공',
      admin: {
        id: admin.id,
        username: admin.username,
      },
    })
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
