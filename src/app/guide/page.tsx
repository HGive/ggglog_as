'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { SearchInput } from '@/components/Input'

// 가이드 콘텐츠 (실제 콘텐츠로 교체 필요)
const GUIDE_CONTENT = `
# 리빙 가이드

완공 후 건축주님을 위한 주거 관리 가이드입니다.

---

## 건축주 셀프 A/S 대처 방법

### 1. 문 & 창호

**문이 잘 안 닫히는 경우**
- 경첩 나사를 조여보세요
- 습도에 따라 문이 팽창/수축할 수 있습니다
- 계절이 바뀌면 자연스럽게 해결되는 경우가 많습니다

**창문에서 바람이 들어오는 경우**
- 창틀 주변의 실리콘을 확인해주세요
- 창문 잠금장치가 제대로 닫혔는지 확인해주세요
- 창문 레일에 이물질이 있는지 확인해주세요

### 2. 도배 & 페인트

**벽지가 들뜨는 경우**
- 습기가 원인인 경우가 많습니다
- 환기를 자주 해주세요
- 심한 경우 A/S 신청을 해주세요

**페인트가 벗겨지는 경우**
- 습기가 원인인 경우가 많습니다
- 결로 현상이 있는지 확인해주세요

### 3. 바닥 & 타일

**마루 사이에 틈이 생긴 경우**
- 습도 변화에 따른 자연스러운 현상입니다
- 겨울철에 특히 심해질 수 있습니다
- 가습기를 사용하면 도움이 됩니다

**타일에 금이 간 경우**
- 사진을 촬영하여 A/S 신청해주세요

### 4. 수전 & 배수

**수전에서 물이 새는 경우**
- 수전 핸들을 완전히 잠가주세요
- 카트리지 교체가 필요할 수 있습니다 (A/S 신청)

**배수가 느린 경우**
- 배수구 덮개를 열어 이물질을 제거해주세요
- 베이킹소다 + 식초로 청소해보세요

### 5. 전기 & 조명

**전등이 깜빡거리는 경우**
- LED 전구를 새것으로 교체해보세요
- 조광기(디머) 호환성 문제일 수 있습니다

**콘센트가 작동하지 않는 경우**
- 두꺼비집(분전반)을 확인해주세요
- 차단기가 내려가 있으면 올려주세요

---

## A/S 가능 항목

### 무상 A/S 대상
- 시공 하자로 인한 문제
- 자재 불량으로 인한 문제
- 설계 도면과 다른 시공

### 유상 A/S 대상
- 사용자 부주의로 인한 파손
- 자연 마모 및 노화
- 이사 과정에서의 손상
- 무상 A/S 기간 종료 후 발생한 하자

---

## A/S 기간 안내

| 항목 | 무상 A/S 기간 |
|------|-------------|
| 구조체 | 10년 |
| 방수 | 5년 |
| 마감재 | 2년 |
| 설비 (전기, 배관) | 2년 |
| 가전제품 | 제조사 보증기간 |

※ 하자의 종류와 원인에 따라 다를 수 있습니다.

---

## 계절별 주거 관리 팁

### 봄
- 환기를 자주 해주세요
- 황사 시즌에는 창문 필터를 확인해주세요

### 여름
- 에어컨 필터를 정기적으로 청소해주세요
- 제습기를 활용하여 습도를 관리해주세요

### 가을
- 난방 시스템 점검을 해주세요
- 외벽 코킹 상태를 확인해주세요

### 겨울
- 동파 방지를 위해 보일러를 켜두세요
- 결로 방지를 위해 환기를 해주세요
- 외출 시에도 난방을 완전히 끄지 마세요

---

## 긴급 상황 대처

### 누수 발생 시
1. 먼저 수도 밸브를 잠그세요
2. 누수 부위 사진을 촬영하세요
3. A/S 센터에 연락하세요

### 전기 문제 발생 시
1. 분전반에서 해당 차단기를 내리세요
2. 감전 위험이 있으니 물기 있는 손으로 만지지 마세요
3. 전문가 도움을 받으세요

### 가스 냄새가 날 때
1. 가스 밸브를 즉시 잠그세요
2. 환기를 시키세요
3. 불을 사용하지 마세요
4. 가스 회사에 연락하세요

---

문의사항이 있으시면 A/S 신청을 통해 연락해주세요.
건축주님의 쾌적한 주거 생활을 응원합니다.
`

export default function GuidePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedContent, setHighlightedContent] = useState(GUIDE_CONTENT)
  const [matchCount, setMatchCount] = useState(0)
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)
  const matchRefs = useRef<(HTMLSpanElement | null)[]>([])

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
    
    if (!term.trim()) {
      setHighlightedContent(GUIDE_CONTENT)
      setMatchCount(0)
      setCurrentMatchIndex(0)
      return
    }

    // 검색어 하이라이트
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const matches = GUIDE_CONTENT.match(regex)
    const count = matches ? matches.length : 0
    setMatchCount(count)
    setCurrentMatchIndex(count > 0 ? 1 : 0)

    const highlighted = GUIDE_CONTENT.replace(regex, '<mark class="search-highlight">$1</mark>')
    setHighlightedContent(highlighted)

    // 첫 번째 매치로 스크롤
    setTimeout(() => {
      const firstMatch = contentRef.current?.querySelector('.search-highlight')
      if (firstMatch) {
        firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  }, [])

  const goToNextMatch = () => {
    if (matchCount === 0) return
    
    const newIndex = currentMatchIndex >= matchCount ? 1 : currentMatchIndex + 1
    setCurrentMatchIndex(newIndex)
    
    const matches = contentRef.current?.querySelectorAll('.search-highlight')
    if (matches && matches[newIndex - 1]) {
      matches[newIndex - 1].scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const goToPrevMatch = () => {
    if (matchCount === 0) return
    
    const newIndex = currentMatchIndex <= 1 ? matchCount : currentMatchIndex - 1
    setCurrentMatchIndex(newIndex)
    
    const matches = contentRef.current?.querySelectorAll('.search-highlight')
    if (matches && matches[newIndex - 1]) {
      matches[newIndex - 1].scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  // 마크다운을 HTML로 변환하는 간단한 함수
  const renderContent = (content: string) => {
    return content
      // 제목 변환
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-8 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-10 mb-4 border-b pb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-6">$1</h1>')
      // 굵은 글씨
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // 수평선
      .replace(/^---$/gim, '<hr class="my-8 border-gray-200">')
      // 리스트
      .replace(/^- (.*$)/gim, '<li class="ml-4 mb-1">• $1</li>')
      // 테이블 (간단한 처리)
      .replace(/\| (.*) \|/g, (match) => {
        const cells = match.split('|').filter(c => c.trim())
        if (cells[0]?.includes('---')) {
          return ''
        }
        const isHeader = cells.some(c => c.includes('항목') || c.includes('기간'))
        const tag = isHeader ? 'th' : 'td'
        const style = isHeader ? 'class="bg-gray-100 font-medium p-2 text-left"' : 'class="p-2 border-t"'
        return `<tr>${cells.map(c => `<${tag} ${style}>${c.trim()}</${tag}>`).join('')}</tr>`
      })
      // 테이블 래퍼
      .replace(/<tr>/g, (match, offset, string) => {
        const before = string.substring(0, offset)
        const after = string.substring(offset)
        if (!before.includes('<table') || before.lastIndexOf('</table>') > before.lastIndexOf('<table')) {
          return '<table class="w-full border-collapse my-4 border border-gray-200 rounded"><tbody>' + match
        }
        return match
      })
      .replace(/<\/tr>(?![^]*<tr>)/g, '</tr></tbody></table>')
      // 줄바꿈
      .replace(/\n\n/g, '</p><p class="my-4">')
      .replace(/\n/g, '<br>')
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* 타이틀 */}
      <h1 className="font-handwriting text-5xl text-center mb-8">
        living guide
      </h1>

      {/* 검색 영역 */}
      <div className="sticky top-16 bg-white py-4 z-10">
        <SearchInput
          placeholder="검색어를 입력하세요"
          onSearch={handleSearch}
          onChange={(e) => {
            if (!e.target.value) {
              handleSearch('')
            }
          }}
        />
        
        {matchCount > 0 && (
          <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
            <span>{currentMatchIndex} / {matchCount}개 결과</span>
            <div className="flex gap-2">
              <button
                onClick={goToPrevMatch}
                className="px-3 py-1 border rounded hover:bg-gray-50"
              >
                ← 이전
              </button>
              <button
                onClick={goToNextMatch}
                className="px-3 py-1 border rounded hover:bg-gray-50"
              >
                다음 →
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-gray-500 mt-4">
          집짓기 관리의 모든것, 무엇이 궁금하세요?
        </p>
      </div>

      {/* 콘텐츠 */}
      <div
        ref={contentRef}
        className="prose prose-gray max-w-none mt-8"
        dangerouslySetInnerHTML={{ __html: renderContent(highlightedContent) }}
      />
    </div>
  )
}
