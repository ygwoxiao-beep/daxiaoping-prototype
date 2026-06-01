#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

if [[ ! -f .env ]]; then
  echo "未找到 .env，请先执行：cp .env.example .env 并填写 ANTHROPIC_API_KEY、LITELLM_MASTER_KEY"
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

# 优先使用本目录下的 venv（uv venv 创建，Python 3.11+）
if [[ -x .venv/bin/litellm ]]; then
  LITELLM_BIN=".venv/bin/litellm"
elif command -v litellm >/dev/null 2>&1; then
  LITELLM_BIN="litellm"
else
  echo "未找到 litellm。请执行：uv venv --python 3.11 .venv && uv pip install --python .venv/bin/python 'litellm[proxy]'"
  exit 1
fi

echo "LiteLLM Proxy → http://127.0.0.1:4000  (OpenAI 兼容 /v1/chat/completions)"
echo "管理 UI（若启用）→ http://127.0.0.1:4000/ui"
exec "$LITELLM_BIN" --config config.yaml --port 4000 --host 127.0.0.1
