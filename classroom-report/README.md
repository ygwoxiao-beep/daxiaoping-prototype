# Classroom Report · 课堂学习报告（V1 + V2）

这是一个纯静态的课堂学情报告生成工具，支持粘贴 JSON、上传 Word/PDF、加载示例数据。

- **V1 学习记录卡片**：轻量记录，适合发家长群。
- **V2 深度诊断报告**：基于课堂文本和小黑板图片生成知识点、错因、建议与板书回顾。

---

## 一、本地预览

```bash
cd classroom-report
python3 -m http.server 8765
# 访问 http://127.0.0.1:8765/
```

无构建步骤，直接静态预览。

---

## 二、Prompt 管理

V1 和 V2 已拆成两个独立 Markdown prompt，页面运行时会优先读取：

```text
prompts/v1-learning-card.md       # V1 学习记录卡片
prompts/v2-diagnostic-report.md   # V2 深度学情诊断报告
```

修改 prompt 后硬刷新页面即可生效；如果 prompt 文件读取失败，页面会回退到 `index.html` 内置兜底 prompt。

---

## 三、AI 配置

模型调用使用 OpenAI 兼容接口：`/v1/chat/completions`。当前默认直连 DashScope：

- V1 默认模型：`qwen3-vl-plus`
- V2 默认模型：`qwen3-vl-plus`
- 默认 base：`https://dashscope.aliyuncs.com/compatible-mode/v1`

### 推荐方式：使用 `ai-config.js`

复制 `ai-config.example.js` 为 `ai-config.js`（已在 `.gitignore`），填写 Key：

```js
window.__AI_ENV__ = {
  DASHSCOPE_API_KEY: "sk-your-dashscope-api-key",
  V1_MODEL: "qwen3-vl-plus",
  V2_MODEL: "qwen3-vl-plus",
};

window.__BUILT_IN_AI_CONFIG__ = {
  v1: {
    base: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    model: "qwen3-vl-plus",
    key: "", // 也可直接写在这里，会覆盖 __AI_ENV__
  },
  v2: {
    base: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    model: "qwen3-vl-plus",
    key: "",
  },
};
```

页面通过 `<script src="ai-config.js">` 加载配置，**不会**再 `fetch` 根目录的 `.env`，避免控制台出现 `GET .../.env 404`。

仓库里的 `.env.example` 仅作变量名参考；若你本地有 `classroom-report/.env`，请把 `DASHSCOPE_API_KEY` 抄到 `ai-config.js` 的 `__AI_ENV__` 中。

调用顺序：

1. V1 报告优先使用 `v1` 配置。
2. V2 报告优先使用 `v2` 配置。
3. 主通道失败时尝试备用通道。
4. 全部失败时降级为本地启发式解析。

---

## 四、文件导入说明

Word 文档中的小黑板截图会从 `.docx` 的 `word/media/*` 中自动解包，并以 `__DOCX_IMAGE_1__`、`__DOCX_IMAGE_2__` 等图片 ID 传给模型。

V2 prompt 约定：每张图片就是一道题，第 N 张图对应 `QN`，模型输出后前端会把图片 ID 替换为真实图片，用于小黑板逐题回顾。

PDF 只读取内嵌文字层，不做 OCR。扫描版 PDF 建议先转成带文字层的 PDF，或改用 `.docx`。

---

## 五、安全须知

`.env` 在本地静态预览时仍会被浏览器读取，因此只适合：

- 本机开发
- 内网演示
- 有访问控制的私有环境
- 配额受限、可随时作废的演示 Key

不要把真实 Key 暴露到公网。生产环境应由后端代理保管 Key，前端只访问业务后端。

---

## 六、文件结构

```text
classroom-report/
├── index.html
├── .env.example
├── ai-config.example.js
├── prompts/
│   ├── v1-learning-card.md
│   └── v2-diagnostic-report.md
├── sample-data.json
├── images/
│   └── bb-student-work.png
└── README.md
```

---

## 七、数据 Schema（与 AI 输出一致）

```jsonc
{
  "lesson": {
    "subtitle": "五年级数学 · 第 3 讲",
    "date": "2026/4/13",
    "teacher": "张老师",
    "durationMinutes": 88
  },
  "students": [
    {
      "name": "陈思琪",
      "stats": {
        "interactionsParticipated": "6/6",
        "choiceAccuracyPercent": 75,
        "attendanceMinutes": 88,
        "trophies": 3
      },
      "interactions": [
        { "type": "blackboard", "index": 1, "time": "19:35", "image": "...", "caption": "分数加减步骤" },
        { "type": "choice", "index": 2, "time": "19:42", "studentChoice": "B", "correctAnswer": "B" }
      ],
      "teacherComment": "教师评语原文",
      "systemComment": "系统总结评语",
      "diagnosis": {
        "knowledgeList": [{ "name": "分数运算", "status": "已掌握", "difficulty": 3, "diagnosis": "..." }],
        "difficulty": [{ "name": "简单题", "count": 6, "accuracy": 95, "avg": 92 }],
        "profile": { "title": "学生画像标题", "summary": "..." },
        "bottlenecks": [{ "tone": "rose", "title": "...", "desc": "..." }],
        "focus": [{ "title": "...", "desc": "..." }],
        "advice": { "study": ["..."], "teach": ["..."], "family": ["..."] },
        "summaryLine": "总结一句话",
        "boardImages": [{ "src": "url", "caption": "..." }]
      }
    }
  ]
}
```
