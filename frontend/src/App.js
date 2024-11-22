import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Upload, 
  Button, 
  List, 
  Card, 
  message, 
  Typography,
  Space,
  Modal 
} from 'antd';
import { 
  FileOutlined, 
  FolderOutlined, 
  UploadOutlined, 
  ScanOutlined,
  DatabaseOutlined,
  LoadingOutlined 
} from '@ant-design/icons';

const { Content, Sider } = Layout;
const { Text, Title } = Typography;

function App() {
  const [path, setPath] = useState('');
  const [output, setOutput] = useState('');
  const [directories, setDirectories] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanTime, setScanTime] = useState(0);
  const [scanInterval, setScanInterval] = useState(null);

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
      message.error('Failed to fetch files');
    }
  };

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
      message.error('Navigation error');
    }
  };

  const handleScan = async (silent = false) => {
    setIsScanning(true);
    setScanTime(0);
    
    const interval = setInterval(() => {
      setScanTime(prevTime => prevTime + 1);
    }, 1000);
    
    setScanInterval(interval);

    try {
      const response = await fetch('http://localhost:5000/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          path: silent ? '/' : currentPath,
          silent: silent
        }),
      });
      const data = await response.json();
      setOutput(data.output || data.error);
    } catch (error) {
      message.error('Scan failed');
    } finally {
      setIsScanning(false);
      clearInterval(interval);
    }
  };

  const handleUpdateVirusDB = async () => {
    try {
      const response = await fetch('http://localhost:5000/update-virus-db', {
        method: 'POST'
      });
      const data = await response.json();
      message.success(data.message || 'Virus database updated successfully');
    } catch (error) {
      message.error('Failed to update virus database');
    }
  };

  const handleFileUpload = async (info) => {
    const { status } = info.file;
    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`);
      fetchFiles();
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const pathSegments = currentPath.split(/[/\\]/);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout>
        <Sider width={250} theme="light">
          <Card 
            title="File Explorer" 
            extra={
              <Upload
                customRequest={({ file, onSuccess, onError }) => {
                  const formData = new FormData();
                  formData.append('file', file);
                  fetch('http://localhost:5000/upload', {
                    method: 'POST',
                    body: formData,
                  })
                    .then(response => response.json())
                    .then(data => {
                      if (data.success) {
                        onSuccess(data);
                        fetchFiles();
                      } else {
                        onError(data);
                      }
                    });
                }}
                showUploadList={false}
                onChange={handleFileUpload}
              >
                <Button icon={<UploadOutlined />}>Upload</Button>
              </Upload>
            }
          >
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <List
                dataSource={[...directories, ...files]}
                renderItem={(item) => (
                  <List.Item
                    onClick={() => {
                      if (directories.includes(item)) {
                        handlePathClick(item);
                      }
                    }}
                    style={{
                      cursor: directories.includes(item) ? 'pointer' : 'default',
                    }}
                  >
                    {directories.includes(item) ? (
                      <Space>
                        <FolderOutlined style={{ color: 'blue' }} />
                        <Text type="secondary">{item}</Text>
                      </Space>
                    ) : (
                      <Space>
                        <FileOutlined />
                        <Text>{item}</Text>
                      </Space>
                    )}
                  </List.Item>
                )}
              />
            </div>
          </Card>
        </Sider>
        <Layout>
          <Content style={{ margin: '16px' }}>
            <Card>
              <Title level={4}>Current Path</Title>
              <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                <Space>
                  {pathSegments.map((segment, index) => (
                    <Button 
                      key={index}
                      type="link"
                      onClick={() => {
                        const pathToNavigate = index === 0 
                          ? '/' 
                          : pathSegments.slice(0, index + 1).join('/');
                        handlePathClick(pathToNavigate);
                      }}
                    >
                      {segment || '/'}
                    </Button>
                  ))}
                </Space>
              </div>
              
              <Space style={{ marginTop: '16px' }}>
                <Button 
                  type="primary" 
                  icon={isScanning ? <LoadingOutlined /> : <ScanOutlined />}
                  onClick={() => handleScan()}
                  disabled={isScanning}
                >
                  {isScanning ? `Scanning (${scanTime}s)` : 'Scan Current Path'}
                </Button>
                <Button 
                  type="default" 
                  onClick={() => handleScan(true)}
                  disabled={isScanning}
                >
                  Silent Scan All
                </Button>
                <Button 
                  type="dashed" 
                  icon={<DatabaseOutlined />}
                  onClick={handleUpdateVirusDB}
                >
                  Update Virus DB
                </Button>
              </Space>
            </Card>

            <Card 
              title="Scan Output" 
              style={{ marginTop: '16px' }}
            >
              <pre>{output}</pre>
            </Card>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default App;