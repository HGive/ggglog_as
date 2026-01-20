import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { RowDataPacket } from 'mysql2'

// GET: 신청 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const searchParams = request.nextUrl.searchParams
    const name = searchParams.get('name')
    const phone = searchParams.get('phone')

    // 사용자 조회: 성함+연락처 필수
    if (!name || !phone) {
      return NextResponse.json(
        { message: '성함과 연락처를 입력해주세요' },
        { status: 400 }
      )
    }

    // 신청 정보 조회
    const [applications] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM applications WHERE id = ?`,
      [id]
    )

    if (applications.length === 0) {
      return NextResponse.json(
        { message: '신청 내역을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    const application = applications[0]

    // 본인 확인
    if (application.name !== name || application.phone !== phone) {
      return NextResponse.json(
        { message: '권한이 없습니다' },
        { status: 403 }
      )
    }

    // 첨부파일 조회
    const [attachments] = await pool.execute<RowDataPacket[]>(
      `SELECT id, file_name, file_path, file_size FROM attachments WHERE application_id = ?`,
      [id]
    )

    return NextResponse.json({
      ...application,
      attachments,
    })
  } catch (error) {
    console.error('Application GET error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
