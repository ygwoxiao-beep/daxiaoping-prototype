# Classroom Report · 课堂学习报告（V1 + V2）

一个纯静态的课堂学情报告生成工具：

- **V1 学习记录卡片**：与主原型第 5 模块一致，绿色风格，单生一卡，方便发家长群。
- **V2 深度诊断报告**：indigo 主色，看板/表现/分析/诊断/执行/回顾六层结构，支持难度柱状图、知识点表、板书相册等。

用户使用面板只有 3 个动作：

1. **直接粘贴 JSON**
2. **上传 Word / PDF**（系统自动智能解析为标准 JSON 并渲染）
3. **点击「加载示例」** 体验

AI 解析在后台静默运行，**用户感知不到 Key 配置存在**；只要 `ai-config.js` 中填了 Key 就自动调用 LLM，没有/失败则自动降级本地规则解析。

---

## 一、本地预览

```bash
cd classroom-report
python3 -m http.server 8765
# 访问 http://127.0.0.1:8765/
```

无构建步骤，纯静态。

---

## 二、AI 解析配置（**部署前必读**）

LLM 调用走 **OpenAI 兼容协议**（`/v1/chat/completions`）。

### 推荐：LiteLLM 网关 + OpenAI（Key 不进浏览器）

用 [LiteLLM](https://github.com/BerriAI/litellm) 在本机起代理，**OpenAI 官方 Key 只放在 `litellm/.env`**，页面里只填代理鉴权 Key。

```bash
pip install 'litellm[proxy]'
cd classroom-report/litellm
cp .env.example .env   # 填写 OPENAI_API_KEY、LITELLM_MASTER_KEY
./start.sh             # http://127.0.0.1:4000
```

详见 [`litellm/README.md`](litellm/README.md)。

`ai-config.js` 示例（也可从 `ai-config.example.js` 复制）：

```js
window.__BUILT_IN_AI_CONFIG__ = {
  litellm: {
    base: "http://127.0.0.1:4000/v1",
    model: "Claude Opus 4.7",
    key: "与 litellm/.env 中 LITELLM_MASTER_KEY 相同",
  },
  doubao: { base: "...", model: "...", key: "" },
  qwen: { base: "...", model: "...", key: "" },
};
```

**调用顺序**：已配置的 `litellm` → `qwen`，前者失败自动切下一个。

- **通义**：`https://dashscope.aliyuncs.com/compatible-mode/v1`，`qwen3.7-Max`（须支持图片）

**主失败自动切备用**，全部失败则降级为启发式解析。

### 项目级配置（唯一配置方式）

把 Key 填入 `classroom-report/ai-config.js`（或复制 `ai-config.example.js`）。前端 UI 无 Key 入口。

> Word 文档中的小黑板截图 / 手写板书会从 `.docx` 的 `word/media/*` 中自动解包，并作为多模态图片输入传给模型。模型输出中使用 `__DOCX_IMAGE_1__` 这类图片 ID，前端会自动替换为真实图片用于 V1 小黑板和 V2 证据归档。

填好之后访问页面即可使用，**用户无需在 UI 上配置**。

### ⚠⚠⚠ 安全须知（必读）

1. **`ai-config.js` 中的 Key 会随静态资源下发到每个访问者的浏览器**，任何人在开发者工具里都能看到。
2. **严禁把真实 Key 部署到公网**或可被陌生人访问的环境。仅适合：
   - 个人电脑离线 / 内网 / 局域网
   - 受访问控制保护的私有部署
   - 配额受限、可随时作废的演示 Key
3. **生产正确做法**：后端反向代理。后端保管真实 Key，把 `ai-config.js` 的 `base` 改成代理地址、`key` 改成代理鉴权 token（或留空），前端就不会暴露真实 Key。
4. **加入 `.gitignore`**：建议把 `ai-config.js` 加入 `.gitignore`，再用 `ai-config.example.js` 之类的模板入库。本仓库已留空 Key，可直接照旧使用。

### 维护者如何快速换 Key / 换模型

直接修改 `ai-config.js`，刷新页面即可生效。无需重启、无需重新构建。  
如果同时填了主、备两家，主模型失败会**自动**切到备用；两家都失败再降级到本地启发式解析。整个过程对用户透明。

---

## 三、V2 报告分析模式

- **严格诚实（默认）**：只展示真实数据；缺失字段显示"暂未采集"占位。
- **规则推断**：在真实数据基础上，用通用规则补足图表/雷达/建议，并明确标注「规则推断」。

---

## 四、文件结构

```
classroom-report/
├── index.html         # 主应用（V1 / V2 渲染 + 文件导入 + AI 调用）
├── ai-config.js       # 项目级 AI 配置（建议 .gitignore）
├── ai-config.example.js
├── litellm/           # LiteLLM 网关（OpenAI Key 放 .env）
│   ├── config.yaml
│   ├── .env.example
│   └── start.sh
├── sample-data.json   # 示例数据
├── images/
│   └── bb-student-work.png
└── README.md
```

---

## 五、数据 Schema（与 AI 输出一致）

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
        "knowledgeRadar": [{ "subject": "分数运算", "score": 88 }],
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
