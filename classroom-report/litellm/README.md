# LiteLLM 网关 · 课堂报告

用 [LiteLLM Proxy](https://github.com/BerriAI/litellm) 统一管理 **OpenAI API Key**，前端只连本机 OpenAI 兼容接口，不把官方 Key 写进浏览器。

## 架构

```
浏览器 (classroom-report/index.html)
  → Authorization: Bearer <LITELLM_MASTER_KEY>
  → http://127.0.0.1:4000/v1/chat/completions
       LiteLLM Proxy（保管 OPENAI_API_KEY）
         → OpenAI API
```

- **OPENAI_API_KEY**：只放在 `litellm/.env`，由 LiteLLM 读取。
- **LITELLM_MASTER_KEY**：代理鉴权 Key（须 `sk-` 开头）；与 `ai-config.js` 里 `litellm.key` 相同。

## 快速开始

### 方式 A：Docker（推荐，免装 Python）

```bash
cd classroom-report/litellm
cp .env.example .env
# 编辑 .env：ANTHROPIC_API_KEY、OPENAI_API_KEY、LITELLM_MASTER_KEY

chmod +x docker-start.sh
./docker-start.sh
```

常用命令：

```bash
docker compose logs -f litellm   # 看日志
docker compose down              # 停止
docker compose pull && docker compose up -d   # 更新镜像
```

### 方式 B：本机 Python

```bash
# 1. 安装
pip install 'litellm[proxy]'

# 2. 配置密钥
cd classroom-report/litellm
cp .env.example .env
# 编辑 .env：OPENAI_API_KEY、LITELLM_MASTER_KEY

# 3. 启动网关（默认 4000 端口）
chmod +x start.sh
./start.sh
```

另开终端启动静态页：

```bash
cd classroom-report
python3 -m http.server 8081
# http://127.0.0.1:8081/
```

确认 `ai-config.js` 中：

```js
litellm: {
  base: "http://127.0.0.1:4000/v1",
  model: "gpt-4o",  // 与 config.yaml 中 model_name 一致
  key: "与 .env 中 LITELLM_MASTER_KEY 相同",
}
```

## 换模型 / 加路由

编辑 `config.yaml` 的 `model_list`，`model_name` 即前端 `litellm.model` 填写的名称。官方文档：[Proxy Configs](https://docs.litellm.ai/docs/proxy/configs)。

## V2 深度诊断报告 · qwen3.7-Max 专用通道

V2 报告默认走本地代理 `http://127.0.0.1:4000` 上的 `qwen3-vl-plus` 路由（上游打到阿里 DashScope 的 `qwen-max-latest`），需要三步开通：

1. **申请 DashScope Key**：[https://dashscope.console.aliyun.com/](https://dashscope.console.aliyun.com/) → 「API-KEY 管理」→ 创建。
2. **填入 `.env`**：把 `DASHSCOPE_API_KEY=sk-请替换为...` 改成你的真实 Key。
3. **启动本地代理**：`cd classroom-report/litellm && ./start.sh`（已启动则需重启，让新 Key 生效）。

验证：

```bash
curl -sS -X POST http://127.0.0.1:4000/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen3-vl-plus","messages":[{"role":"user","content":"ping"}],"max_tokens":16}'
# 期望 HTTP 200，返回 choices[0].message.content
```

> **未启动本地代理时**：前端 V2 会自动降级回 V1 通道（Claude Opus 4.6），不会阻塞演示，但状态条会提示「主通道暂时不可用…」并显示当前实际使用的 provider。

## 虚拟 Key（可选）

在 Admin UI 或 API 为不同人签发虚拟 Key，限制模型与额度，见 [Virtual Keys](https://docs.litellm.ai/docs/proxy/virtual_keys)。

## Docker 说明

| 对比项 | `./start.sh`（本机） | `./docker-start.sh` |
|--------|----------------------|---------------------|
| 依赖 | Python 3.11+、`litellm[proxy]` | 仅 Docker Desktop |
| 配置 | 同目录 `config.yaml` + `.env` | 完全相同，挂载进容器 |
| 访问地址 | `http://127.0.0.1:4000` | 相同（端口映射 `4000:4000`） |
| Key 存放 | `.env` 在本机 | `.env` 仍在宿主机，通过 `env_file` 注入容器 |

`ai-config.js` 无需改动，继续填：

```js
litellm: {
  base: "http://127.0.0.1:4000/v1",
  model: "claude-opus-4-5",  // 与 config.yaml 中 model_name 一致
  key: "与 .env 中 LITELLM_MASTER_KEY 相同",
}
```

## 常见问题

| 现象 | 处理 |
|------|------|
| Docker 启动失败 | 确认已安装 Docker Desktop 且已启动；执行 `docker compose logs litellm` 看报错 |
| 端口 4000 被占用 | 修改 `docker-compose.yml` 中 `ports` 为 `"4001:4000"`，并同步改 `ai-config.js` 的 `base` |
| CORS 报错 | 浏览器直连本机 4000 一般无跨域；若部署到其它域名，需在 LiteLLM 或前置 Nginx 配置 CORS |
| 401 Unauthorized | `ai-config.js` 的 `litellm.key` 与 `LITELLM_MASTER_KEY` 不一致 |
| 模型不存在 | `litellm.model` 必须与 `config.yaml` 里 `model_name` 一致 |
| Word 含图解析失败 | 使用支持视觉的模型（如 `gpt-4o`） |
