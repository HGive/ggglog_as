import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'ggglog',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ggglog_as',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export default pool

// 타입 정의
export interface Application {
  id: number
  name: string
  phone: string
  email: string
  address: string
  completion_year: string
  site_manager: string | null
  designer: string | null
  title: string
  content: string
  status: string
  created_at: Date
  updated_at: Date
}

export interface Attachment {
  id: number
  application_id: number
  file_name: string
  file_path: string
  file_size: number
  created_at: Date
}

export interface Admin {
  id: number
  username: string
  password: string
  email: string
  created_at: Date
}

// 진행 상태 타입
export type ApplicationStatus = 
  | '신청'
  | '접수완료'
  | '담당자 배정'
  | '일정 조율 중'
  | 'A/S 완료'
  | '처리완료'

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  '신청',
  '접수완료',
  '담당자 배정',
  '일정 조율 중',
  'A/S 완료',
  '처리완료'
]
