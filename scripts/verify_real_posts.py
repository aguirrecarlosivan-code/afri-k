import urllib.request
import json
import time
import sys
sys.stdout.reconfigure(encoding='utf-8')

time.sleep(5)
resp = urllib.request.urlopen('http://localhost:8000/api/v1/analytics/filtered')
data = json.loads(resp.read())
posts = data.get('posts', [])
print(f"Total posts from API: {len(posts)}")
print()
for i, p in enumerate(posts[:5]):
    platform = p.get("platform", "?")
    text = p.get("text", "")[:100]
    url = p.get("url", "")
    likes = p.get("metrics", {}).get("likes", 0)
    comments = p.get("metrics", {}).get("comments", 0)
    shares = p.get("metrics", {}).get("shares", 0)
    virality = p.get("virality_score", 0)
    print(f"Post {i+1}: [{platform.upper()}]")
    print(f"  Text: {text}")
    print(f"  URL: {url}")
    print(f"  Likes: {likes} | Comments: {comments} | Shares: {shares}")
    print(f"  Virality: {virality}")
    print()

print("KPIs:", json.dumps(data.get("kpis", {}), indent=2))
