#!/bin/bash
# 加载环境变量并启动 Drizzle Studio

# 加载 .env.local
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# 启动 Drizzle Studio
drizzle-kit studio




