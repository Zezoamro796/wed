#!/usr/bin/env python3
"""
خادم الويب الاحترافي لموقع دعوة زفاف يوسف ونورهان
Wedding Invitation & Memory Server for Yousef & Norhan
"""

import http.server
import socketserver
import os
import json
import urllib.parse
import mimetypes
import uuid
from datetime import datetime

PORT = int(os.environ.get("PORT", 8000))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "data", "messages.json")
WEDDING_PASSWORD = "29/10/2026"

# Ensure data directory exists
os.makedirs(os.path.join(BASE_DIR, "data"), exist_ok=True)
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump([], f, ensure_ascii=False, indent=2)


def get_messages():
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error reading messages: {e}")
        return []


def save_messages(messages):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(messages, f, ensure_ascii=False, indent=2)


class WeddingHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        # Enable CORS and disable aggressive caching for API
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Wedding-Pass")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # Route /memory to memory.html
        if path == "/memory" or path == "/memory/":
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            with open(os.path.join(BASE_DIR, "memory.html"), "rb") as f:
                self.wfile.write(f.read())
            return

        # Route / to index.html
        if path == "/" or path == "":
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            with open(os.path.join(BASE_DIR, "index.html"), "rb") as f:
                self.wfile.write(f.read())
            return

        # API: GET /api/messages
        if path == "/api/messages":
            messages = get_messages()
            # Return sorted with newest first
            try:
                sorted_messages = sorted(
                    messages,
                    key=lambda m: m.get("date", ""),
                    reverse=True
                )
            except Exception:
                sorted_messages = messages

            response_data = json.dumps(sorted_messages, ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(response_data)))
            self.end_headers()
            self.wfile.write(response_data)
            return

        # Static files fallback
        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # API: POST /api/messages
        if path == "/api/messages":
            content_length = int(self.headers.get("Content-Length", 0))
            post_body = self.rfile.read(content_length)

            try:
                data = json.loads(post_body.decode("utf-8"))
            except Exception:
                self.send_error(400, "Invalid JSON")
                return

            name = (data.get("name") or "").strip()
            message = (data.get("message") or "").strip()
            relation = (data.get("relation") or "مهنئ كريم").strip()

            if not name or not message:
                self.send_response(400)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "الاسم والرسالة مطلوبان"}).encode("utf-8"))
                return

            new_msg = {
                "id": f"msg-{int(datetime.now().timestamp()*1000)}-{uuid.uuid4().hex[:6]}",
                "name": name,
                "relation": relation,
                "message": message,
                "date": datetime.utcnow().isoformat() + "Z"
            }

            messages = get_messages()
            messages.append(new_msg)
            save_messages(messages)

            response_data = json.dumps(new_msg, ensure_ascii=False).encode("utf-8")
            self.send_response(201)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(response_data)))
            self.end_headers()
            self.wfile.write(response_data)
            return

        self.send_error(404, "Endpoint Not Found")

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # API: DELETE /api/messages?id=...
        if path == "/api/messages":
            query_params = urllib.parse.parse_qs(parsed.query)
            msg_id = query_params.get("id", [None])[0]
            auth_header = self.headers.get("X-Wedding-Pass", "")
            query_pass = query_params.get("password", [""])[0]

            if auth_header != WEDDING_PASSWORD and query_pass != WEDDING_PASSWORD:
                self.send_response(401)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "غير مصرح، كلمة المرور غير صحيحة"}).encode("utf-8"))
                return

            if not msg_id:
                self.send_response(400)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "معرف الرسالة مطلوب"}).encode("utf-8"))
                return

            messages = get_messages()
            initial_count = len(messages)
            messages = [m for m in messages if m.get("id") != msg_id]

            if len(messages) == initial_count:
                self.send_response(404)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "الرسالة غير موجودة"}).encode("utf-8"))
                return

            save_messages(messages)
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "message": "تم حذف الرسالة بنجاح"}).encode("utf-8"))
            return

        self.send_error(404, "Endpoint Not Found")


def run():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), WeddingHTTPRequestHandler) as httpd:
        print("=" * 60)
        print("💍 موقع دعوة زفاف يوسف ونورهان يعمل الآن بنجاح!")
        print(f"📍 رابط الدعوة الرئيسي:  http://localhost:{PORT}/")
        print(f"📖 صفحة الذكريات:      http://localhost:{PORT}/memory")
        print(f"🔑 كلمة المرور:         {WEDDING_PASSWORD}")
        print("=" * 60)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nتم إيقاف الخادم.")


if __name__ == "__main__":
    run()
