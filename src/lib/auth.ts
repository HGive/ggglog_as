import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default_secret_key_change_in_production'
)

const TOKEN_NAME = 'admin_token'
const TOKEN_EXPIRY = '24h'

export interface JWTPayload {
  adminId: number
  username: string
}

// JWT 토큰 생성
export async function createToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET)
}

// JWT 토큰 검증
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

// 쿠키에서 토큰 가져오기
export async function getTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(TOKEN_NAME)
  return token?.value || null
}

// 쿠키에 토큰 저장
export async function setTokenCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24시간
    path: '/',
  })
}

// 쿠키에서 토큰 삭제
export async function removeTokenCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(TOKEN_NAME)
}

// 현재 로그인된 관리자 정보 가져오기
export async function getCurrentAdmin(): Promise<JWTPayload | null> {
  const token = await getTokenFromCookies()
  if (!token) return null
  return await verifyToken(token)
}

// 관리자 인증 확인
export async function isAuthenticated(): Promise<boolean> {
  const admin = await getCurrentAdmin()
  return admin !== null
}
