import React from 'react';
import ReactDOM from 'react-dom/client';
import 'antd/dist/reset.css';  // 使用新的导入方式
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);