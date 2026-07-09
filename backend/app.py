"""
Backend Flask untuk portofolio M. Teuku Farish.
Menyediakan endpoint /api/contact untuk menyimpan pesan dari form kontak ke MySQL.

Cara jalanin (lihat README.md untuk detail lengkap):
    1. buat database & tabel  ->  mysql -u root -p < schema.sql
    2. copy .env.example jadi .env, isi kredensial MySQL kamu
    3. pip install -r requirements.txt
    4. python app.py
"""

import os
import re
from datetime import datetime

from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)  # izinkan frontend (file/domain lain) memanggil API ini

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", "3306")),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "farish_portfolio"),
}


def get_connection():
    return mysql.connector.connect(**DB_CONFIG)


@app.route("/api/health", methods=["GET"])
def health():
    """Cek cepat: server & koneksi database hidup atau tidak."""
    try:
        conn = get_connection()
        conn.close()
        return jsonify({"status": "ok", "database": "connected"}), 200
    except Error as e:
        return jsonify({"status": "error", "database": str(e)}), 500


@app.route("/api/contact", methods=["POST"])
def contact():
    data = request.get_json(silent=True) or {}

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    message = (data.get("message") or "").strip()

    if not name or not email or not message:
        return jsonify({"error": "Nama, email, dan pesan wajib diisi."}), 400

    if not EMAIL_RE.match(email):
        return jsonify({"error": "Format email tidak valid."}), 400

    if len(message) > 3000:
        return jsonify({"error": "Pesan terlalu panjang (maks 3000 karakter)."}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO contact_messages (name, email, message, created_at)
            VALUES (%s, %s, %s, %s)
            """,
            (name, email, message, datetime.utcnow()),
        )
        conn.commit()
        new_id = cursor.lastrowid
        cursor.close()
        conn.close()
    except Error as e:
        return jsonify({"error": f"Gagal menyimpan ke database: {e}"}), 500

    return jsonify({"success": True, "id": new_id}), 201


@app.route("/api/contact", methods=["GET"])
def list_messages():
    """Opsional: lihat semua pesan masuk (bisa dipakai untuk halaman admin sederhana)."""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, name, email, message, created_at FROM contact_messages ORDER BY created_at DESC")
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
    except Error as e:
        return jsonify({"error": str(e)}), 500

    for row in rows:
        row["created_at"] = row["created_at"].isoformat()

    return jsonify(rows), 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)
