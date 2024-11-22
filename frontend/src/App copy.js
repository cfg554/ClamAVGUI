import React, { useState, useEffect } from 'react';

function App() {
  const [path, setPath] = useState('');
  const [output, setOutput] = useState('');
  const [directories, setDirectories] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState('');

  // 获取目录列表
  const fetchFiles = async () => {
    try {
      const response = await fetch('http://localhost:5000/list-paths');
      const data = await response.json();
      if (data.paths && data.files) {
        setDirectories(data.paths);
        setFiles(data.files);
        setCurrentPath(data.currentPath);
      }
    } catch (error) {
      setFiles([]);
      setDirectories([]);
    }
  };

  // 路径点击事件，支持父目录和子目录导航
  const handlePathClick = async (dir) => {
    try {
      const response = await fetch('http://localhost:5000/navigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dir }),
      });
      const data = await response.json();
      if (data.currentPath) {
        setCurrentPath(data.currentPath);
        setDirectories(data.paths);
        setFiles(data.files);
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  // 扫描功能
  const handleScan = async () => {
    try {
      const response = await fetch('http://localhost:5000/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: currentPath }),
      });
      const data = await response.json();
      setOutput(data.output || data.error);
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  // 文件上传功能
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('http://localhost:5000/upload', {
          method: 'POST',
          body: formData,
        });
        
        const data = await response.json();
        
        if (data.success) {
          fetchFiles();
          setOutput(data.message);
        } else {
          setOutput(data.error || 'Upload failed');
        }
      } catch (error) {
        console.error('Upload error:', error);
        setOutput(`Error: ${error.message}`);
      }
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // 拆分当前路径
  const pathSegments = currentPath.split(/[/\\]/);

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <h1>ClamAV Scanner</h1>
      
      {/* 父目录导航 */}
      <div>
        <strong>Current Path: </strong>
        {pathSegments.map((segment, index) => (
          <span key={index}>
            {index > 0 && ' / '}
            <span
              onClick={() => {
                const pathToNavigate = index === 0 
                  ? '/' 
                  : pathSegments.slice(0, index + 1).join('/');
                handlePathClick(pathToNavigate);
              }}
              style={{ 
                cursor: 'pointer', 
                color: 'blue', 
                textDecoration: 'underline' 
              }}
            >
              {segment || '/'}
            </span>
          </span>
        ))}
      </div>

      {/* 目录和文件列表 */}
      <div style={{ 
        display: 'flex', 
        flexGrow: 1, 
        overflow: 'hidden', 
        marginTop: '10px' 
      }}>
        <div style={{ 
          flexGrow: 1, 
          overflowY: 'auto', 
          border: '1px solid #ddd', 
          padding: '10px' 
        }}>
          <strong>Contents:</strong>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {[...directories, ...files].map((item, index) => (
              <li 
                key={index}
                style={{
                  cursor: directories.includes(item) ? 'pointer' : 'default',
                  color: directories.includes(item) ? 'blue' : 'black',
                  textDecoration: directories.includes(item) ? 'underline' : 'none'
                }}
                onClick={() => {
                  if (directories.includes(item)) {
                    handlePathClick(item);
                  }
                }}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 文件上传和扫描功能 */}
      <div style={{ marginTop: '10px' }}>
        <div>
          <h3>Upload File</h3>
          <input 
            type="file" 
            onChange={handleFileUpload} 
            style={{ marginBottom: '10px' }} 
          />
        </div>

        <button 
          onClick={handleScan} 
          style={{ padding: '5px 10px', marginTop: '10px' }}
        >
          Scan Current Path
        </button>
      </div>

      {/* 扫描输出 */}
      <pre 
        style={{ 
          marginTop: '20px', 
          background: '#f0f0f0', 
          padding: '10px', 
          overflowY: 'auto', 
          maxHeight: '200px' 
        }}
      >
        {output}
      </pre>
    </div>
  );
}

export default App;