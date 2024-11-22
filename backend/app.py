from flask import Flask, request, jsonify
import os
import subprocess
import os
from flask import Flask, jsonify, request
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

@app.route('/update-virus-db', methods=['POST'])
def update_virus_db():
    try:
        # 执行 freshclam 更新病毒库
        result = subprocess.run(['freshclam'], capture_output=True, text=True)
        return jsonify({
            'message': 'Virus database updated successfully',
            'output': result.stdout
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/scan', methods=['POST'])
def scan():
    data = request.json
    path = data.get('path', '.')
    silent = data.get('silent', False)
    
    try:
        # 根据参数决定扫描方式
        scan_command = ['clamscan', '-r']
        if silent:
            scan_command.append('-q')  # 静默模式
        scan_command.append(path)
        
        result = subprocess.run(scan_command, capture_output=True, text=True)
        return jsonify({'output': result.stdout, 'error': result.stderr})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/list-paths', methods=['GET'])
def list_paths():
    current_path = os.getcwd()  # 获取当前工作目录
    try:
        # 获取当前目录下所有文件和文件夹
        all_items = os.listdir(current_path)
        
        # 区分文件和文件夹
        directories = [
            f for f in all_items 
            if os.path.isdir(os.path.join(current_path, f))
        ]
        files = [
            f for f in all_items 
            if os.path.isfile(os.path.join(current_path, f))
        ]
        
        return jsonify({
            'paths': directories, 
            'files': files,  # 新增文件列表
            'currentPath': current_path
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/navigate', methods=['POST']) 
def navigate():
    data = request.json
    dir_name = data.get('dir', '')
    
    # 直接使用完整路径，而不是相对路径
    new_path = dir_name if os.path.isabs(dir_name) else os.path.join(os.getcwd(), dir_name)
    
    if os.path.isdir(new_path):
        os.chdir(new_path)
        
        all_items = os.listdir(new_path)
        updated_directories = [
            f for f in all_items 
            if os.path.isdir(os.path.join(new_path, f))
        ]
        updated_files = [
            f for f in all_items 
            if os.path.isfile(os.path.join(new_path, f))
        ]
        
        return jsonify({
            'message': f'Changed to directory {new_path}',
            'currentPath': new_path,
            'paths': updated_directories,
            'files': updated_files
        })
    else:
        return jsonify({'error': 'Invalid directory'}), 400
    

# 文件上传路由
@app.route('/upload', methods=['POST'])
def upload_file():
    print("Upload request received")  # 调试日志
    
    if 'file' not in request.files:
        print("No file part in request")  # 调试日志
        return jsonify({'success': False, 'error': 'No file part'})
    
    file = request.files['file']
    
    if file.filename == '':
        print("No selected file")  # 调试日志
        return jsonify({'success': False, 'error': 'No selected file'})
    
    current_path = os.getcwd()
    file_path = os.path.join(current_path, file.filename)
    
    try:
        file.save(file_path)
        print(f"File saved at {file_path}")  # 调试日志
        return jsonify({
            'success': True, 
            'message': f'File {file.filename} uploaded successfully'
        })
    except Exception as e:
        print(f"Error saving file: {str(e)}")  # 调试日志
        return jsonify({
            'success': False, 
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

