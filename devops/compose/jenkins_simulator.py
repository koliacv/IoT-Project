import http.server
import socketserver
import subprocess
import os

# Port and host configuration
HOST = "0.0.0.0"
PORT = 9595
BASH_SCRIPT = "./run.sh"  

class BashScriptHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Respond with a simple message
        self.send_response(200)
        self.send_header("Content-type", "text/plain")
        self.end_headers()
        self.wfile.write(b"Executing bash script...\n")

        try:
            # Execute the bash script with `deployment` as a variable
            result = subprocess.run(
                [BASH_SCRIPT, "deployment"], 
                stdout=subprocess.PIPE, 
                stderr=subprocess.PIPE,
                text=True
            )

            # Log output and errors
            # print("Output:", result.stdout)
            # print("Error:", result.stderr)

            # Return the script output
            self.wfile.write(result.stdout.encode("utf-8"))
            self.wfile.write(result.stderr.encode("utf-8"))

        except FileNotFoundError:
            self.wfile.write(b"Error: Bash script not found.\n")
        except Exception as e:
            self.wfile.write(f"Error: {e}\n".encode("utf-8"))

# Start the server as a daemon
def run_daemon():
    with socketserver.TCPServer((HOST, PORT), BashScriptHandler) as httpd:
        print(f"Serving on {HOST}:{PORT}")
        httpd.serve_forever()

if __name__ == "__main__":
    # Run the server as a daemon
    pid = os.fork()
    if pid > 0:
        print(f"Daemon started with PID {pid}. Listening on {HOST}:{PORT}.")
        exit(0)
    else:
        run_daemon()
