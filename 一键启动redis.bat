@echo off
chcp 65001 >nul
title Redis 服务启动

echo ========================================
echo    Redis 一键启动脚本
echo ========================================
echo.

:: Redis 路径配置
set REDIS_PATH=E:\java_waimai\redis
set REDIS_CONF=redis.windows.conf

:: 检查 redis-server.exe 是否存在
if not exist "%REDIS_PATH%\redis-server.exe" (
    echo [错误] 未找到 redis-server.exe
    echo 请检查路径: %REDIS_PATH%
    pause
    exit /b 1
)

:: 检查配置文件是否存在
if not exist "%REDIS_PATH%\%REDIS_CONF%" (
    echo [错误] 未找到配置文件: %REDIS_CONF%
    echo 请检查路径: %REDIS_PATH%\%REDIS_CONF%
    pause
    exit /b 1
)

:: 检查 Redis 是否已经在运行
%REDIS_PATH%\redis-cli.exe -a 123456 ping >nul 2>&1
if %errorlevel% == 0 (
    echo [提示] Redis 服务已经在运行中
    echo.
    %REDIS_PATH%\redis-cli.exe -a 123456 info server | findstr "tcp_port"
    pause
    exit /b 0
)

:: 启动 Redis 服务
echo [启动] 正在启动 Redis 服务...
echo [配置] 使用配置文件: %REDIS_CONF%
echo.

start /min "" "%REDIS_PATH%\redis-server.exe" "%REDIS_PATH%\%REDIS_CONF%"

:: 等待服务启动
timeout /t 2 /nobreak >nul

:: 验证启动是否成功
%REDIS_PATH%\redis-cli.exe -a 123456 ping >nul 2>&1
if %errorlevel% == 0 (
    echo ========================================
    echo    Redis 启动成功!
    echo ========================================
    echo.
    echo 端口: 6379
    echo 密码: 123456
    echo.
    echo 连接命令: redis-cli -a 123456
    echo.
) else (
    echo [错误] Redis 启动失败，请检查日志
    echo.
)

pause
