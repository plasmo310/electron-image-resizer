@echo off
setlocal

REM Setup Envs.
set INSTALL_DIR=%LOCALAPPDATA%\electron_image_resizer
set CUSTOM_SHORTCUT_PATH=%~dp0ImageResizer.lnk

REM Delete Install Dir.
if not exist %INSTALL_DIR% (
    echo Already Delete App.
    pause
    exit /b 1
)

if exist %CUSTOM_SHORTCUT_PATH% (
    del %CUSTOM_SHORTCUT_PATH%
)

rmdir /S /Q %INSTALL_DIR%
echo Successfully Delete App.
pause
