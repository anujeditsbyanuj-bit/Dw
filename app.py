from flask import Flask, request, jsonify
from playwright.sync_api import sync_playwright

app = Flask(__name__)

def extract_video(url):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        video = None

        def handle(res):
            nonlocal video
            if ".mp4" in res.url or ".m3u8" in res.url:
                video = res.url

        page.on("response", handle)

        page.goto(url, timeout=60000)
        page.wait_for_timeout(8000)

        browser.close()
        return video


@app.route("/")
def home():
    return "API Running 🚀"


@app.route("/api")
def api():
    url = request.args.get("url")

    if not url:
        return jsonify({"success": False})

    try:
        video = extract_video(url)

        if not video:
            return jsonify({"success": False})

        return jsonify({
            "success": True,
            "url": video
        })

    except:
        return jsonify({"success": False})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
