import mysql.connector
from flask import Flask, jsonify, request
from flask_cors import CORS

# Menyimpan vrm > blob
def save_vrm_to_db(file_path, file_name):
    with open(file_path, 'rb') as f:
        vrm_data = f.read()

    conn = mysql.connector.connect(
        host='127.0.0.1',
        port=3307,               # Sesuaikan dengan port XAMPP kamu
        user='root',
        password='',             # Kosongkan jika default XAMPP
        database='asset3d_storage' # Ganti dengan nama database kamu
    )

    cursor = conn.cursor()
    sql = "INSERT INTO vrm_models (name, file_data) VALUES (%s, %s)"
    cursor.execute(sql, (file_name, vrm_data))
    conn.commit()
    conn.close()

    print("VRM saved to database!")

# Mengambil blob > vrm
def restore_vrm_from_db(output_path, file_name):
    conn = mysql.connector.connect(
        host='127.0.0.1',
        port=3307,
        user='root',
        password='',
        database='asset3d_storage'
    )

    cursor = conn.cursor()
    sql = "SELECT file_data FROM vrm_models WHERE name = %s"
    cursor.execute(sql, (file_name,))
    result = cursor.fetchone()
    conn.close()

    if result:
        vrm_data = result[0]
        with open(output_path, 'wb') as f:
            f.write(vrm_data)
        print(f"✅ File {file_name} berhasil dipulihkan ke: {output_path}")
    else:
        print(f"❌ File {file_name} tidak ditemukan di database.")

# restore_vrm_from_db("test3d/maomao.vrm", "Maomao")

# save_vrm_to_db(r"D:\(II)All_NodeJS_Folder\ThreeJS_3d\threejs_vrm\public\8636615223626235539.vrm" , "Maomao")

app = Flask(__name__)
CORS(app, origins="*")

@app.route('/api/hello')
def hello():
    return jsonify(message="Hello from Flask!")

@app.route('/api/restore', methods=['POST'])
def restore_vrm_api():
    data = request.get_json()
    path = data.get('path')
    name = data.get('name')

    if not path or not name:
        return jsonify({'error': 'Missing path or name'}), 400

    restore_vrm_from_db(path, name)
    return jsonify({'message': f'{name} restored to {path}'})

if __name__ == '__main__':
    app.run(debug=True)
