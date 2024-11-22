# ClamAV 文件扫描图形化界面开发

## 项目概述

这是一个基于网页的文件扫描应用，前端使用 React，后端使用 Flask，并集成 ClamAV 实现病毒检测和文件管理功能。

## 功能特点

- 交互式文件浏览器
- 文件上传功能
- 病毒扫描功能
- 病毒数据库更新选项
- 路径导航系统

## 前置条件

- Docker
- 推荐安装 Docker Compose

## 安装步骤

### 1. 克隆仓库

```bash
git clone <your-repository-url>
cd <project-directory>
```

### 2. 使用 Docker 构建和运行

```bash
docker build -t clamav-file-scanner .
docker run -p 3000:3000 -p 5000:5000 clamav-file-scanner
```

### 3. 访问应用

打开浏览器并访问以下地址：
- 前端：`http://localhost:3000`
- 后端 API：`http://localhost:5000`

## 应用组件

### 前端 (React)
- 使用 Ant Design 组件构建
- 文件浏览器，支持目录导航
- 文件上传功能
- 扫描控制和结果展示

### 后端 (Flask)
- 处理文件系统操作
- 管理 ClamAV 扫描任务
- 提供 RESTful API 接口

### 功能详情

- **文件浏览器**：浏览和导航目录
- **文件上传**：通过网页界面上传文件
- **病毒扫描**：
  - 扫描当前目录
  - 静默执行系统范围扫描
- **病毒数据库**：更新 ClamAV 病毒定义文件

## API 接口

- `GET /list-paths`：获取当前目录内容
- `POST /navigate`：更改当前目录
- `POST /scan`：执行病毒扫描
- `POST /upload`：上传文件
- `POST /update-virus-db`：更新病毒数据库

## 安全注意事项

- 使用 ClamAV 进行病毒扫描
- 支持系统范围和目标路径扫描
- 提供病毒数据库更新机制

## 常见问题

- 确保 Docker 已启动
- 检查端口是否被占用（3000, 5000）
- 验证网络连接是否正常


## 许可证

MIT License.