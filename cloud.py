import os
import urllib.request
import subprocess
import sys

CLOUDFLARED_URL = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
EXE_NAME = "cloudflared.exe"
PORT = 5173

def download_cloudflared():
    if os.path.exists(EXE_NAME):
        return

    print(f"[*] Downloading {EXE_NAME} from Cloudflare...")
    try:
        urllib.request.urlretrieve(CLOUDFLARED_URL, EXE_NAME)
        print("[+] Download complete!")
    except Exception as e:
        print(f"[-] Failed to download cloudflared: {e}")
        sys.exit(1)

def run_tunnel():
    print(f"[*] Starting Cloudflare Tunnel to expose localhost:{PORT}...")
    print(f"[*] Look for the URL that ends with '.trycloudflare.com'")
    print(f"[*] You can open that link on your phone!\n")
    
    try:
        subprocess.run([f"./{EXE_NAME}", "tunnel", "--url", f"http://localhost:{PORT}"])
    except KeyboardInterrupt:
        print("\n[*] Tunnel closed.")
    except Exception as e:
        print(f"[-] Error running tunnel: {e}")

if __name__ == "__main__":
    download_cloudflared()
    run_tunnel()
