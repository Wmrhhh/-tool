# AI 教培营销配图生成器

基于 React + TypeScript + Vite 构建的 AI 驱动教培行业营销配图生成工具，集成通义万相文生图 API 和通义千问对话 API，支持意图驱动生成、批量生成、图片美化等功能。

## ✨ 功能特性

### 🎯 意图驱动配图生成器
- **自然语言意图描述**：用日常语言描述营销目标，AI 自动转化为精准提示词
- **AI 对话完善意图**：通过 3 轮对话让 AI 理解需求，自动优化意图描述
- **6 种营销阶段**：招新 / 留存 / 询问需求 / 塑造孩子 / 传播 / 决策
- **4 种视觉风格**：设计感 / 信息图 / 知识点形 / 隐喻形
- **批量生成 4 种风格**：一次生成 4 张不同风格的配图，并发请求，独立加载
- **多种图片尺寸**：1:1 / 16:9 / 9:16 / 3:4
- **关键变量注入**：课程名称、核心数据、品牌名自动融入提示词

### 🖼️ 智能美化（图生图）
- 支持点击或拖拽上传本地图片（最大 10MB）
- 描述美化意图，AI 自动优化图片风格
- 变化强度可调（0.1~0.9）
- 原图与美化结果并排对比

### 📱 通用功能
- 暗色主题界面，护眼舒适
- 生成历史记录（本地存储）
- 一键下载生成的图片
- 完善的错误处理和加载动画
- 响应式布局，支持移动端

## 🛠️ 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite 6
- **样式**: Tailwind CSS 3
- **图标**: Lucide React
- **状态管理**: Zustand
- **路由**: React Router DOM

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 环境配置

在项目根目录创建 `.env` 文件（可参考 `.env.example`）：

```env
# 通义万相 API Key（仅服务端使用，不会暴露给浏览器）
DASHSCOPE_API_KEY=your-api-key

# 通义万相 Workspace ID
DASHSCOPE_WORKSPACE_ID=your-workspace-id
```

> **安全说明**：API Key 通过服务端代理注入，前端请求不再携带密钥。开发环境由 Vite 代理处理，生产环境由 Netlify Functions 处理。部署到 Netlify 时，请在 Netlify 后台 **Site settings → Environment variables** 中配置以上两个变量。

### 启动开发服务器

```bash
pnpm run dev
```

访问 http://localhost:5173/ 即可使用。

### 构建生产版本

```bash
pnpm run build
```

## 📁 项目结构

```
src/
├── components/
│   ├── BatchImageGrid.tsx    # 批量生成网格组件
│   ├── EnhanceForm.tsx       # 智能美化表单
│   ├── HistoryPanel.tsx      # 历史记录面板
│   ├── ImageGenerator.tsx    # 图片生成器核心组件
│   ├── IntentChat.tsx        # AI 意图优化对话组件
│   ├── Navbar.tsx            # 导航栏
│   ├── PosterCanvas.tsx      # 海报画布（已停用）
│   ├── PromotionForm.tsx     # 推广物料表单
│   └── WorkbenchForm.tsx     # 意图驱动表单
├── hooks/
│   └── useTheme.ts           # 主题切换 Hook
├── lib/
│   └── utils.ts              # 工具函数
├── pages/
│   └── Home.tsx              # 主页面
├── utils/
│   └── imageApi.ts           # 图片生成 API 工具
├── App.tsx                   # 应用入口
└── main.tsx                  # React 挂载点
```

## 🔌 API 集成

### 通义万相（文生图）

代理路径：`/dashscope` → 服务端代理 → `https://{workspaceId}.cn-beijing.maas.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation`

- 模型：`wan2.7-image-pro`
- 支持文生图和图生图（传入 `image` 参数）
- 参数：`size`、`n`、`watermark`、`thinking_mode`、`ref_strength`

### 通义千问（对话）

代理路径：`/qwen-chat` → 服务端代理 → `https://{workspaceId}.cn-beijing.maas.aliyuncs.com/compatible-mode/v1/chat/completions`

- 模型：`qwen3.7-plus`
- 用于意图优化对话
- 参数：`messages`、`temperature`

## 📝 使用说明

### 意图驱动生成流程

1. 进入「意图驱动配图生成器」
2. 描述意图（如："让家长意识到大班课孩子没人管，突出小班优势"）
3. （可选）点击「AI帮我完善意图」进行对话优化
4. 选择营销阶段和视觉风格
5. 选择图片尺寸
6. 输入关键变量（课程名、核心数据、品牌名）
7. 选择「单张生成」或「批量生成 4 种风格」
8. 等待生成，下载喜欢的图片

### 智能美化流程

1. 进入「智能美化」
2. 上传本地图片
3. 描述美化意图（如："换成温暖色调，加一些学习元素"）
4. 调整变化强度
5. 点击「开始美化」
6. 对比原图和美化结果，下载

## 📄 许可证

MIT License
