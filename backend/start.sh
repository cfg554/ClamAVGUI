#!/bin/bash
# 启动 Flask 后端
cd /app/backend
python3 app.py &
# 启动 React 前端
cd /app/frontend
npm start
