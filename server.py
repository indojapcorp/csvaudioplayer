import sys
import http.server
import socketserver
import os
import signal
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

PORT = 9000

# Custom Handler to reload the server on file changes
class ReloadHandler(FileSystemEventHandler):
    def on_any_event(self, event):
        if event.is_directory:
            return
        if event.event_type in ['modified', 'created', 'deleted']:
            print(f"File {event.src_path} has been {event.event_type}. Reloading server...")
            os._exit(0)  # This will trigger a hard reload of the server

def run_server():
    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Serving at port {PORT}")

        def signal_handler(sig, frame):
            print("Stopping server...")
            httpd.shutdown()
            httpd.server_close()
            sys.exit(0)

        signal.signal(signal.SIGINT, signal_handler)

        observer = Observer()
        observer.schedule(ReloadHandler(), path=".", recursive=True)
        observer.start()
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            observer.stop()
        observer.join()

if __name__ == "__main__":
    run_server()