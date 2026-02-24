# Badminton Flash Frontend

校园羽毛球约场平台前端项目，基于 Vue 3 + TypeScript + Vite 构建。

## 技术栈

- Vue 3
- TypeScript
- Vite
- Naive UI
- Pinia
- Axios
- Tailwind CSS 4

## 功能概览

- 认证：登录、注册
- 用户端：场次浏览、球场浏览、时间槽筛选与预约、订单管理、个人信息维护
- 管理端（ADMIN）：系统配置、场次管理、用户管理
- 权限控制：基于 JWT 的登录态与角色路由控制

## 目录结构

```text
frontend/
  public/
  src/
    api/          # 接口请求封装
    components/   # 业务组件（user/admin/common）
    router/       # 路由与前置守卫
    stores/       # Pinia 状态
    types/        # TS 类型定义
    utils/        # 工具函数
    views/        # 页面级视图
```

## 环境要求

- Node.js 20+
- npm 10+

## 本地开发

1. 启动后端服务（默认 `http://localhost:25001`）。
2. 在 `frontend` 目录安装依赖并启动：

```bash
npm install
npm run dev
```

3. 打开 `http://localhost:50096`。

## API 地址与代理说明

项目请求基于 `src/api/http.ts`：

- `VITE_API_BASE_URL` 未设置时：使用相对路径（如 `/auth/login`），在开发模式下由 Vite 代理转发。
- `VITE_API_BASE_URL` 已设置时：直接请求该地址（可用于联调远程后端或生产部署）。

开发环境默认代理（`vite.config.ts`）：

- 目标后端：`http://localhost:25001`
- 代理前缀：`/auth`、`/user`、`/browse`、`/reserve`、`/pay`、`/admin`

可在 `frontend/.env.local` 中配置：

```bash
VITE_API_BASE_URL=http://localhost:25001
```

## 构建与预览

```bash
npm run build
npm run preview
```

- 构建产物目录：`dist/`
- `preview` 不会使用开发代理；如需访问后端，请配置 `VITE_API_BASE_URL` 或在网关/Nginx 做反向代理。

## 认证与状态

- Token 持久化键：`localStorage['bf_token']`
- 主题模式键：`localStorage['bf_theme_mode']`
- 路由守卫规则：
    - 未登录访问业务页会跳转到 `/auth`
    - 已登录访问 `/auth` 会跳转到 `/`

## 接口响应约定

前端按统一响应结构处理：

```ts
interface ApiResponse<T> {
    code: number;
    enumCode: string;
    message: string;
    data: T;
}
```

- `code === 200`：返回 `data`
- 非 200：统一弹错并抛出 `ApiError`

## 常见问题

- 页面请求失败或 404：
    - 检查后端是否运行在 `25001`
    - 检查是否配置了 `VITE_API_BASE_URL`
- 登录后立刻掉线：
    - 检查后端返回的 `Authorization: Bearer <token>` 是否正确
- 生产环境跨域：
    - 优先使用统一网关反代前后端，或正确配置后端 CORS
