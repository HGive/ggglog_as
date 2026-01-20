import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { sendNewApplicationNotification } from '@/lib/email'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { RowDataPacket } from 'mysql2'

// GET: 신청 목록 조회 (성함+연락처로 필터링)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const name = searchParams.get('name')
    const phone = searchParams.get('phone')

    if (!name || !phone) {
      return NextResponse.json(
        { message: '성함과 연락처를 입력해주세요' },
        { status: 400 }
      )
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, title, status, created_at 
       FROM applications 
       WHERE name = ? AND phone = ? 
       ORDER BY created_at DESC`,
      [name, phone]
    )

    return NextResponse.json({ applications: rows })
  } catch (error) {
    console.error('Applications GET error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// POST: 새 신청 등록
export async function POST(request: NextRequest) {
  const connection = await pool.getConnection()
  
  try {
    const formData = await request.formData()
    
    // 폼 데이터 추출
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const address = formData.get('address') as string
    const completion_year = formData.get('completion_year') as string
    const site_manager = formData.get('site_manager') as string || null
    const designer = formData.get('designer') as string || null
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const files = formData.getAll('files') as File[]

    // 필수 필드 검증
    if (!name || !phone || !email || !address || !completion_year || !title || !content) {
      return NextResponse.json(
        { message: '필수 항목을 모두 입력해주세요' },
        { status: 400 }
      )
    }

    if (files.length === 0) {
      return NextResponse.json(
        { message: '사진을 첨부해주세요' },
        { status: 400 }
      )
    }

    await connection.beginTransaction()

    // 신청 데이터 저장
    const [result] = await connection.execute(
      `INSERT INTO applications 
       (name, phone, email, address, completion_year, site_manager, designer, title, content, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '신청')`,
      [name, phone, email, address, completion_year, site_manager, designer, title, content]
    )

    const applicationId = (result as any).insertId

    // 업로드 디렉토리 생성
    const uploadDir = path.join(process.cwd(), 'uploads', String(applicationId))
    await mkdir(uploadDir, { recursive: true })

    // 파일 저장
    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // 파일명 생성 (UUID + 원본 확장자)
      const ext = path.extname(file.name)
      const fileName = `${uuidv4()}${ext}`
      const filePath = path.join(uploadDir, fileName)
      
      await writeFile(filePath, buffer)

      // 첨부파일 정보 저장
      await connection.execute(
        `INSERT INTO attachments (application_id, file_name, file_path, file_size, mime_type)
         VALUES (?, ?, ?, ?, ?)`,
        [applicationId, file.name, filePath, file.size, file.type]
      )
    }

    await connection.commit()

    // 관리자에게 이메일 알림 (비동기, 실패해도 신청은 성공)
    sendNewApplicationNotification({ name, title, phone, email }).catch(console.error)

    return NextResponse.json(
      { message: '신청이 완료되었습니다', id: applicationId },
      { status: 201 }
    )
  } catch (error) {
    await connection.rollback()
    console.error('Application POST error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  } finally {
    connection.release()
  }
}
