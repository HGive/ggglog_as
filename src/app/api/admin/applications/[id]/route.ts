import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getCurrentAdmin } from '@/lib/auth'
import { sendStatusUpdateNotification } from '@/lib/email'
import { STATUS_CODES, getStatusLabel } from '@/lib/status'
import { RowDataPacket } from 'mysql2'

// GET: 신청 상세 조회 (관리자용)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 관리자 인증 확인
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json(
        { message: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    const id = params.id

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

    // 첨부파일 조회
    const [attachments] = await pool.execute<RowDataPacket[]>(
      `SELECT id, file_name, file_path, file_size FROM attachments WHERE application_id = ?`,
      [id]
    )

    return NextResponse.json({
      ...applications[0],
      attachments,
    })
  } catch (error) {
    console.error('Admin application GET error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// PATCH: 진행상황 수정 (관리자용)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 관리자 인증 확인
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json(
        { message: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    const id = params.id
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { message: '진행상황을 선택해주세요' },
        { status: 400 }
      )
    }

    // 유효한 상태 코드 확인
    if (!STATUS_CODES.includes(status as any)) {
      return NextResponse.json(
        { message: '유효하지 않은 상태 코드입니다' },
        { status: 400 }
      )
    }

    // 기존 신청 정보 조회 (이메일 알림용)
    const [applications] = await pool.execute<RowDataPacket[]>(
      `SELECT name, email, title, status as old_status FROM applications WHERE id = ?`,
      [id]
    )

    if (applications.length === 0) {
      return NextResponse.json(
        { message: '신청 내역을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    const application = applications[0]

    // 상태 업데이트
    await pool.execute(
      `UPDATE applications SET status = ? WHERE id = ?`,
      [status, id]
    )

    // 신청자에게 이메일 알림 (비동기, 실패해도 업데이트는 성공)
    if (application.old_status !== status) {
      sendStatusUpdateNotification(application.email, {
        name: application.name,
        title: application.title,
        newStatus: getStatusLabel(status), // 상태 코드를 한글명으로 변환
      }).catch(console.error)
    }

    return NextResponse.json({
      message: '진행상황이 변경되었습니다',
      status,
    })
  } catch (error) {
    console.error('Admin application PATCH error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
