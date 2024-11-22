FROM clamav/clamav-debian:latest

# 安装必要的依赖
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    curl wget \
    npm \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*



# 创建虚拟环境
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# 设置工作目录
WORKDIR /app

# 将前后端代码复制到容器中
COPY backend /app/backend
COPY frontend /app/frontend


# 安装后端依赖
WORKDIR /app/backend
COPY backend /app/backend
RUN pip3 install flask flask-cors

# 安装前端依赖
WORKDIR /app/frontend
COPY frontend /app/frontend
RUN npm install
RUN npm install antd

# 给 start.sh 添加可执行权限
RUN chmod +x /app/backend/start.sh


# 暴露前后端所需端口
EXPOSE 5000 3000

# 启动脚本（前后端同时运行）
CMD ["/app/backend/start.sh"]
