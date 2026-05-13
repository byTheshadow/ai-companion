import type { LLMConfig } from '@/data/types'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LLMResponse {
  content: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export async function callLLM(
  config: LLMConfig,
  messages: ChatMessage[],
  options?: {
    temperature?: number
    max_tokens?: number
    stream?: boolean
    onChunk?: (chunk: string) => void
  }
): Promise<LLMResponse> {
  const { provider, api_key, base_url, model } = config
  const temperature = options?.temperature ??0.8
  const max_tokens = options?.max_tokens ?? 1024

  // 构建请求URL
  let url = base_url.replace(/\/+$/, '')
  if (provider === 'claude') {
    url += '/v1/messages'
  } else {
    url += '/chat/completions'
  }

  // 构建请求头
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (provider === 'claude') {
    headers['x-api-key'] = api_key
    headers['anthropic-version'] = '2023-06-01'// 处理 Claude 格式
    const systemMsg = messages.find(m => m.role === 'system')
    const nonSystemMsgs = messages.filter(m => m.role !== 'system')

    const body = {
      model,
      max_tokens,
      temperature,
      system: systemMsg?.content || '',
      messages: nonSystemMsgs.map(m => ({
        role: m.role,
        content: m.content,
      })),
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Claude API Error: ${res.status} - ${err}`)
    }

    const data = await res.json()
    return {
      content: data.content?.[0]?.text || '',
      usage: data.usage ? {
        prompt_tokens: data.usage.input_tokens,
        completion_tokens: data.usage.output_tokens,
        total_tokens: data.usage.input_tokens + data.usage.output_tokens,
      } : undefined,
    }
  }

  // OpenAI 兼容格式（OpenAI / Gemini / Ollama / Custom）
  headers['Authorization'] = `Bearer ${api_key}`

  const body = {
    model,
    messages,
    temperature,
    max_tokens,
    stream: options?.stream || false,
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`LLM API Error: ${res.status} - ${err}`)
  }

  // 流式响应
  if (options?.stream && options.onChunk && res.body) {
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '))

      for (const line of lines) {
        const data = line.slice(6).trim()
        if (data === '[DONE]') break
        try {
          const parsed = JSON.parse(data)
          const delta = parsed.choices?.[0]?.delta?.content || ''
          fullContent += delta
          options.onChunk(delta)
        } catch {
          // skip
        }
      }
    }

    return { content: fullContent }
  }

  // 非流式
  const data = await res.json()
  return {
    content: data.choices?.[0]?.message?.content || '',
    usage: data.usage,
  }
}
