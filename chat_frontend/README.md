# 丝路宠选 H5 展示前端

这个目录提供一个适合比赛展示的 H5 交互页，用来把“丝路宠选”Coze 工作流包装成一个可直接对话、可跨设备访问、可用于答辩演示的产品化前台。

## 现在已经具备的能力

- 支持自然语言输入需求
- 自动抽取 4 个核心参数
  - `target_market`
  - `budget`
  - `risk_preference`
  - `product_direction`
- 参数缺失时自动补问
- 参数齐全后调用已部署工作流
- 用业务展示形式输出结果
  - 需求摘要
  - Top10 推荐概览
  - 前 3 重点单品
  - 业务汇报正文
- 支持两种运行方式
  - 本地 Node 演示
  - Vercel 公网发布

## 项目结构

```text
chat_frontend/
├─ api/
│  ├─ chat.js
│  └─ health.js
├─ demo/
│  └─ scenario-results.json
├─ lib/
│  ├─ chat-service.js
│  └─ workflow.js
├─ public/
│  ├─ app.js
│  ├─ index.html
│  └─ styles.css
├─ test/
│  ├─ deployment.test.js
│  └─ workflow.test.js
├─ package.json
├─ server.js
└─ vercel.json
```

## 一、本地运行

### 1. 演示模式

不配置 Coze Bearer Token 时，会自动进入演示模式：

```powershell
cd D:\丝路智能体\chat_frontend
node server.js
```

访问地址：

- 本机访问：[http://127.0.0.1:3210](http://127.0.0.1:3210)
- 同一局域网设备访问：`http://你的电脑局域网IP:3210`

### 2. 真实工作流模式

如果你已经拿到 Coze 部署工作流可用的 Bearer Token，可以直接切到真实联调：

```powershell
cd D:\丝路智能体\chat_frontend
$env:COZE_BEARER_TOKEN="你的BearerToken"
$env:COZE_WORKFLOW_RUN_URL="https://bgxb7zbzsz.coze.site/run"
node server.js
```

可选环境变量：

```powershell
$env:PORT="3210"
$env:HOST="0.0.0.0"
```

说明：

- `HOST=0.0.0.0` 时，同一 Wi-Fi 或局域网中的其他设备可以直接访问
- 如果无法访问，请检查 Windows 防火墙是否放行 `3210` 端口

## 二、Vercel 公网发布

这是最适合比赛分享、给老师或评委远程打开的方式。

### 1. 上传项目

把 `D:\丝路智能体\chat_frontend` 这个目录上传到 GitHub，或者直接用 Vercel 导入本地项目仓库。

### 2. 在 Vercel 中导入项目

导入后，Vercel 会自动识别：

- 静态页面：`public/`
- Serverless API：`api/health.js`、`api/chat.js`
- 路由配置：`vercel.json`

### 3. 配置环境变量

如果只是答辩展示，可不配 Token，页面会自动用演示模式上线。

如果要连接真实 Coze 工作流，请在 Vercel 环境变量中添加：

```text
COZE_BEARER_TOKEN=你的BearerToken
COZE_WORKFLOW_RUN_URL=https://bgxb7zbzsz.coze.site/run
```

如需手动指定公开域名展示信息，也可以加：

```text
PUBLIC_BASE_URL=https://你的项目域名.vercel.app
```

### 4. 发布后效果

发布成功后，评委或其他设备可以直接通过公网链接访问，例如：

```text
https://your-project.vercel.app
```

## 三、接口说明

### `GET /api/health`

返回当前运行模式、访问范围、工作流接入方式等状态信息。

### `POST /api/chat`

请求体：

```json
{
  "message": "我想做美国市场的宠物玩具，预算10到20万，偏稳健一点。",
  "slots": {}
}
```

返回：

- 参数未齐时：补问消息
- 参数齐全时：结构化业务报告内容

## 四、测试

运行全部测试：

```powershell
cd D:\丝路智能体\chat_frontend
node --test test/*.test.js
```

当前测试覆盖：

- 参数抽取逻辑
- 多轮补问逻辑
- 结果结构格式化
- 本地 / 公网运行元信息
- Vercel API 入口行为

## 五、适合比赛展示的原因

- 页面观感比 Coze 编辑页更完整，更像一个真正的产品前台
- 支持手机、平板、电脑访问，便于现场演示
- 演示模式下也能稳定输出，适合答辩保底
- 接入 Bearer Token 后可切换成真实工作流，适合展示“真链路能力”

## 六、当前注意事项

- 如果没有有效 `COZE_BEARER_TOKEN`，页面会走演示模式而不是真实 Coze 调用
- 如果要在其他设备上访问本地版本，必须保证设备在同一局域网
- 如果要让任何外部设备都能访问，推荐直接发布到 Vercel
