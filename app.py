from flask import Flask, request, jsonify
from playwright.sync_api import sync_playwright

app = Flask(__name__)

def extract_video(url):
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-dev-shm-usage"]
        )

        page = browser.new_page()

        video_url = None

        def handle_response(response):
            nonlocal video_url
            try:
                res_url = response.url
                if ".mp4" in res_url or ".m3u8" in res_url:
                    video_url = res_url
            except:
                pass

        page.on("response", handle_response)

        try:
            page.goto(url, timeout=60000, wait_until="networkidle")
        except:
            page.goto(url, timeout=60000)

        page.wait_for_timeout(8000)

        browser.close()
        return video_url


@app.route("/")
def home():
    return "API Running 🚀"


@app.route("/api")
def api():
    url = request.args.get("url")

    if not url:
        return jsonify({"success": False, "error": "No URL provided"})

    try:
        video = extract_video(url)

        if not video:
            return jsonify({"success": False, "error": "Video not found"})

        return jsonify({
            "success": True,
            "url": video
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
