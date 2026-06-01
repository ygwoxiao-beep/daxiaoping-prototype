/**
 * 项目级 AI 配置 · 见 ai-config.example.js
 *
 * 本地 Key 填在 window.__AI_ENV__.DASHSCOPE_API_KEY（或 v1/v2 的 key）。
 * 勿用 fetch .env：静态服务器通常不提供该文件，控制台会报 404。
 */
window.__AI_ENV__ = {
  DASHSCOPE_API_KEY: "",
  V1_MODEL: "qwen3-vl-plus",
  V2_MODEL: "qwen3-vl-plus",
};

window.__BUILT_IN_AI_CONFIG__ = {
  v1: {
    base: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    model: "qwen3-vl-plus",
    key: "sk-2a26e622e54d41a68b9f99baa34988d1",
  },

  v2: {
    base: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    model: "qwen3-vl-plus",
    key: "sk-2a26e622e54d41a68b9f99baa34988d1",
  },

  qwen: {
    base: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    model: "qwen-vl-plus",
    key: "sk-2a26e622e54d41a68b9f99baa34988d1",
  },
};
