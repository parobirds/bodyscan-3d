# ---- 构建阶段 ----
FROM node:20-slim AS builder

WORKDIR /app

# 启用 pnpm
RUN corepack enable

# 复制依赖清单（利用 Docker 缓存）
COPY package.json pnpm-lock.yaml* ./

# 安装依赖
RUN pnpm install --frozen-lockfile || pnpm install

# 复制源代码
COPY . .

# 构建
RUN pnpm run build

# ---- 运行阶段 ----
FROM nginx:alpine AS runner

# 复制构建产物到 nginx 默认目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制自定义 nginx 配置
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Railway 会注入 PORT 环境变量，nginx 镜像默认支持 envsubst 模板
EXPOSE 8080

# nginx:alpine 官方镜像入口已配置为 nginx -g 'daemon off;'
# 只需通过 ENV PORT 指定监听端口（nginx 模板会引用 $PORT）
ENV PORT=8080
