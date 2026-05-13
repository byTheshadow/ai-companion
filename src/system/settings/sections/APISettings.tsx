import { useStore } from '@/core/store'
import type { LLMConfig } from '@/data/types'

const providers = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'claude', label: 'Claude' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'ollama', label: 'Ollama (本地)' },
  { value: 'custom', label: '自定义' },
] as const

export default function APISettings() {
  const { state, dispatch } = useStore()
  const { llm, nai } = state.settings

  const updateLLM = (partial: Partial<LLMConfig>) => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      settings: { llm: { ...llm, ...partial } },
    })
  }

  return (
    <div className="p-4 space-y-6">
      {/* LLM 设置 */}
      <section>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">语言模型 (LLM)</h3>
        <div className="bg-white/60 dark:bg-white/5 rounded-xl overflow-hidden divide-y divide-black/5 dark:divide-white/5">
          {/* Provider */}
          <div className="flex items-center px-4 py-3">
            <span className="text-[15px] w-20 shrink-0">服务商</span>
            <select
              value={llm.provider}
              onChange={e => updateLLM({ provider: e.target.value as LLMConfig['provider'] })}
              className="flex-1 bg-transparent text-right text-[15px] outline-none"
            >
              {providers.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          {/* API Key */}
          <div className="flex items-center px-4 py-3">
            <span className="text-[15px] w-20 shrink-0">API Key</span>
            <input
              type="password"
              value={llm.api_key}
              onChange={e => updateLLM({ api_key: e.target.value })}
              placeholder="sk-..."
              className="flex-1 bg-transparent text-right text-[15px] outline-none placeholder:text-gray-400"
            />
          </div>
          {/* Base URL */}
          <div className="flex items-center px-4 py-3">
            <span className="text-[15px] w-20 shrink-0">Base URL</span>
            <input
              type="text"
              value={llm.base_url}
              onChange={e => updateLLM({ base_url: e.target.value })}
              placeholder="https://api.openai.com/v1"
              className="flex-1 bg-transparent text-right text-[15px] outline-none placeholder:text-gray-400"
            />
          </div>
          {/* Model */}
          <div className="flex items-center px-4 py-3">
            <span className="text-[15px] w-20 shrink-0">模型</span>
            <input
              type="text"
              value={llm.model}
              onChange={e => updateLLM({ model: e.target.value })}
              placeholder="gpt-4o-mini"
              className="flex-1 bg-transparent text-right text-[15px] outline-none placeholder:text-gray-400"
            />
          </div>
        </div>
      </section>

      {/* NAI 设置 */}
      <section>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">NovelAI 图片生成</h3>
        <div className="bg-white/60 dark:bg-white/5 rounded-xl overflow-hidden divide-y divide-black/5 dark:divide-white/5">
          <div className="flex items-center px-4 py-3">
            <span className="text-[15px] w-20 shrink-0">API Key</span>
            <input
              type="password"
              value={nai.api_key}
              onChange={e =>
                dispatch({
                  type: 'UPDATE_SETTINGS',
                  settings: { nai: { ...nai, api_key: e.target.value } },
                })
              }
              placeholder="输入 NovelAI API Key"
              className="flex-1 bg-transparent text-right text-[15px] outline-none placeholder:text-gray-400"
            />
          </div>
        </div>
      </section><p className="text-xs text-gray-400 px-1">
        所有 API Key仅存储在你的浏览器本地，不会发送到任何第三方服务器。
      </p>
    </div>
  )
}
