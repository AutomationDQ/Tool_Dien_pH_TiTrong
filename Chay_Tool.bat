@echo off
chcp 65001 >nul
title Tool dien pH ^& Ti trong
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Chua cai Node.js. Tai ban LTS tai https://nodejs.org roi chay lai.
  pause
  exit /b 1
)
node app\server.js
pause
