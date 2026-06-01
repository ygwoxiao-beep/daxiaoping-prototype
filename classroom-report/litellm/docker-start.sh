#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

if [[ ! -f .env ]]; then
  echo "未找到 .env，请先执行：cp .env.example .env 并填写密钥"
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "未找到 docker，请先安装 Docker Desktop：https://www.docker.com/products/docker-desktop/"
  exit 1
fi

COMPOSE="docker compose"
if ! docker compose version >/dev/null 2>&1; then
  COMPOSE="docker-compose"
fi

echo "启动 LiteLLM（Docker）→ http://127.0.0.1:4000"
$COMPOSE up -d

echo ""
echo "查看日志：$COMPOSE logs -f litellm"
echo "停止服务：$COMPOSE down"
