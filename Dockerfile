# ---------- 1단계: 빌드 단계 ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build


# ---------- 2단계: 런타임(서빙) 단계 ----------
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

COPY docker/frontend-nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/build ./

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
