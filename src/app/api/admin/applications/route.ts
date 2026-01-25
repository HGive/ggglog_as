import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getCurrentAdmin } from '@/lib/auth'
import { RowDataPacket } from 'mysql2'

export const dynamic = 'force-dynamic'

// GET: 전체 신청 목록 조회 (관리자용)
export async function GET() {
  try {
    // 관리자 인증 확인
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json(
        { message: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, name, phone, email, title, status, created_at 
       FROM applications 
       ORDER BY created_at DESC`
    )

    return NextResponse.json({ applications: rows })
  } catch (error) {
    console.error('Admin applications GET error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
