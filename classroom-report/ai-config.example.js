/**
 * 复制为 ai-config.js 后按需修改（ai-config.js 建议加入 .gitignore）
 *
 * 纯静态页面无法通过 fetch 读取 .env（会 404，且 Key 会暴露在浏览器里）。
 * 本地演示请把 Key 写在下方 window.__AI_ENV__ 或各通道的 key 字段。
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
    key: "",
  },

  v2: {
    base: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    model: "qwen3-vl-plus",
    key: "",
  },

  qwen: {
    base: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    model: "qwen-vl-plus",
    key: "",
  },
};
