# ---------- 1단계: 빌드 단계 ----------
FROM node:20-alpine AS build
WORKDIR /app
    
COPY package.json package-lock.json ./
RUN npm ci
    
COPY . .
    
RUN PUBLIC_URL=. npm run build
    
    
# ---------- 2단계: 런타임(서빙) 단계 ----------
FROM node:20-alpine AS runner
WORKDIR /app
    
# 정적 파일 서빙용 (nginx 제거)
RUN npm i -g serve
    
COPY --from=build /app/build ./build
    
EXPOSE 80
CMD ["serve", "-s", "build", "-l", "80"]
    