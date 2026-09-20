#!/bin/bash
# انتشار نسخهٔ ۶ روی GitHub Pages — یک فرمان
# استفاده:  GHTOKEN=ghp_xxx bash deploy.sh
set -e
if [ -z "$GHTOKEN" ]; then
  echo "❌ توکن ندادی. این‌طوری اجرا کن:"
  echo "   GHTOKEN=ghp_توکنِ‌تازه bash deploy.sh"
  echo ""
  echo "توکن تازه بساز: GitHub → Settings → Developer settings →"
  echo "Personal access tokens → Tokens (classic) → Generate new token → فقط تیک repo"
  exit 1
fi
cd "$(dirname "$0")"
git push "https://$GHTOKEN@github.com/amiroo4522855-wq/netyar.git" main
echo ""
echo "✅ push شد! GitHub Actions تا ~۲ دقیقه دیپلوی می‌کند:"
echo "   https://github.com/amiroo4522855-wq/netyar/actions"
echo "سپس نسخهٔ زنده:"
echo "   https://amiroo4522855-wq.github.io/netyar/"
