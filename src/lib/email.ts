import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}

// 새 신청 알림 (관리자에게)
export async function sendNewApplicationNotification(application: {
  name: string
  title: string
  phone: string
  email: string
}) {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) {
    console.warn('ADMIN_EMAIL not configured')
    return
  }

  await sendEmail({
    to: adminEmail,
    subject: `[GGGLog A/S] 새로운 신청: ${application.title}`,
    html: `
      <div style="font-family: 'Pretendard', sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #000;">새로운 A/S 신청이 접수되었습니다</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>신청자:</strong> ${application.name}</p>
          <p><strong>연락처:</strong> ${application.phone}</p>
          <p><strong>이메일:</strong> ${application.email}</p>
          <p><strong>제목:</strong> ${application.title}</p>
        </div>
        <p>관리자 페이지에서 상세 내용을 확인하세요.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">공간기록 애프터서비스 센터</p>
      </div>
    `,
  })
}

// 진행상황 변경 알림 (신청자에게)
export async function sendStatusUpdateNotification(
  email: string,
  application: {
    name: string
    title: string
    newStatus: string
  }
) {
  const statusMessages: Record<string, string> = {
    '접수완료': '접수가 완료되었습니다. 빠르게 해결해드릴게요.',
    '담당자 배정': '담당자가 배정되었습니다.',
    '일정 조율 중': '일정 조율 중입니다. 곧 연락드리겠습니다.',
    'A/S 완료': 'A/S가 완료되었습니다.',
    '처리완료': '모든 처리가 완료되었습니다. 감사합니다.',
  }

  const message = statusMessages[application.newStatus] || `진행상황이 '${application.newStatus}'(으)로 변경되었습니다.`

  await sendEmail({
    to: email,
    subject: `[GGGLog A/S] ${application.title} - ${application.newStatus}`,
    html: `
      <div style="font-family: 'Pretendard', sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #000;">${application.name}님, 안녕하세요.</h2>
        <p>신청하신 A/S 건의 진행상황을 알려드립니다.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>제목:</strong> ${application.title}</p>
          <p><strong>현재 상태:</strong> <span style="color: #000; font-weight: bold;">${application.newStatus}</span></p>
        </div>
        
        <p style="font-size: 18px; color: #333;">${message}</p>
        
        <p style="margin-top: 30px;">신청 내역은 <a href="${process.env.NEXT_PUBLIC_BASE_URL}/search" style="color: #000;">신청 조회</a> 페이지에서 확인하실 수 있습니다.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">공간기록 애프터서비스 센터</p>
      </div>
    `,
  })
}
