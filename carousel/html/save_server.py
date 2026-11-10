import http.server, base64, os, json

OUT_DIR = r"C:\Users\oriya\ai-tools-analysis\carousel"

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length)
        data = json.loads(body)
        name = data['name']
        b64 = data['dataUrl'].split(',', 1)[1]
        with open(os.path.join(OUT_DIR, name), 'wb') as f:
            f.write(base64.b64decode(b64))
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(b'ok')

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def log_message(self, fmt, *args):
        pass

http.server.HTTPServer(('localhost', 8732), Handler).serve_forever()
