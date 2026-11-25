@echo off
rem Double-click to start the phone-check server (Node.js required). See PHONE_CHECKLIST.md
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js が見つかりません。PHONE_CHECKLIST.md の「準備」を見て、Node.js をインストールしてください。
  pause
  exit /b 1
)
node serve_for_phone.js
pause
