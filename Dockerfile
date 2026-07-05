# ---- 构建阶段 ----
FROM node:20-slim AS builder

WORKDIR /app

# 启用 pnpm
RUN corepack enable

# 先复制依赖清单以利用缓存
COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile || pnpm install

# 复制源代码并构建
COPY . .

RUN pnpm run build

# ---- 运行阶段 ----
FROM nginx:alpine AS runner

# 复制构建产物
COPY --from=builder /app/dist /app/dist

# 复制 nginx 配置模板
COPY nginx.conf /app/nginx.conf

# 替换 PORT 并启动 nginx
EXPOSE 8080
CMD ["sh", "-c", "envsubst '$PORT' < /app/nginx.conf > /etc/nginx/nginx.conf && nginx -g 'daemon off;'"]
