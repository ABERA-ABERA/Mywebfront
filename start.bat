@echo off
chcp 65001 >nul
title 校园论坛 - 前端开发服务器

echo ============================================
echo    校园论坛 前端项目 一键启动
echo ============================================
echo.

:: 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

:: 显示 Node 版本
echo [信息] Node.js 版本:
node -v
echo.

:: 检查 node_modules 是否存在
if not exist "node_modules" (
    echo [信息] 首次运行，正在安装依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
    echo [成功] 依赖安装完成
    echo.
)

:: 启动开发服务器
echo [信息] 正在启动开发服务器...
echo.
echo ============================================
echo    启动成功！请在浏览器打开:
echo    http://localhost:5173/
echo    按 Ctrl+C 停止服务器
echo ============================================
echo.
call npm run dev
