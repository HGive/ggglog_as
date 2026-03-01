import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { GUIDE_CONTENT } from '@/lib/guide-content'

const SYSTEM_PROMPT = `당신은 완공 후 건축주를 위한 주거 관리 도우미입니다.
반드시 아래의 리빙가이드 내용만을 참고하여 답변하세요.

리빙가이드 내용과 무관한 질문(요리, 날씨, 다른 업체, 일반 상식, 코딩 등 주거 관리 외 모든 주제)에는 절대 답변하지 말고, 다음과 같이만 안내해주세요:
"저는 주거 관리에 관련된 질문만 답변드릴 수 있어요. 리빙가이드에 관한 내용을 질문해 주세요 :)"

답변은 항상 친절하고 간결하게 한국어로 작성해주세요.
불필요한 인사말은 생략하고 핵심 내용 위주로 답변해주세요.

=== 리빙가이드 내용 ===
${GUIDE_CONTENT}
===================`

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!process.env.OPENAI_API_KEY) {
      return new Response('OpenAI API 키가 설정되지 않았습니다.', { status: 500 })
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      stream: true,
      temperature: 0.3,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? ''
            if (text) {
              controller.enqueue(encoder.encode(text))
            }
          }
        } catch (err) {
          controller.error(err)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('오류가 발생했습니다. 잠시 후 다시 시도해주세요.', { status: 500 })
  }
}
