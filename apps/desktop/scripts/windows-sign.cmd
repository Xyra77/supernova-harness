@echo off
setlocal DisableDelayedExpansion
set "signTool=%SNH_DESKTOP_WINDOWS_SIGNTOOL%"
set "certificateFile=%SNH_DESKTOP_WINDOWS_CER_FILE%"
set "tokenPin=%SNH_DESKTOP_WINDOWS_TOKEN_PIN%"
set "keyContainer=%SNH_DESKTOP_WINDOWS_KEY_CONTAINER%"
set "targetFile=%SNH_DESKTOP_WINDOWS_SIGN_TARGET%"
set "appendSignature="
if "%SNH_DESKTOP_WINDOWS_SIGN_APPEND%"=="1" set "appendSignature=/as"
set "SNH_DESKTOP_WINDOWS_SIGNTOOL="
set "SNH_DESKTOP_WINDOWS_CER_FILE="
set "SNH_DESKTOP_WINDOWS_TOKEN_PIN="
set "SNH_DESKTOP_WINDOWS_KEY_CONTAINER="
set "SNH_DESKTOP_WINDOWS_SIGN_TARGET="
set "SNH_DESKTOP_WINDOWS_SIGN_APPEND="
set "signTool=" & set "certificateFile=" & set "tokenPin=" & set "keyContainer=" & set "targetFile=" & set "appendSignature=" & "%signTool%" sign /v /fd sha256 /f "%certificateFile%" /kc "[{{%tokenPin%}}]=%keyContainer%" /csp "eToken Base Cryptographic Provider" %appendSignature% "%targetFile%"
exit /b %errorlevel%
