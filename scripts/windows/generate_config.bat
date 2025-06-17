@echo off
setlocal EnableDelayedExpansion

REM .\scripts\windows\generate_config.bat

for /f "usebackq delims=" %%A in (".env") do (
    set "line=%%A"
    echo !line! | findstr /b /v "#" >nul
    if not errorlevel 1 (
        for /f "tokens=1* delims==" %%B in ("!line!") do (
            set "%%B=%%C"
        )
    )
)

echo Generating livekit.yaml...
(
  for /f "delims=" %%L in (livekit.yaml.template) do (
    set "line=%%L"
    call set "line=%%line:${STUN_DOMAIN}=%STUN_DOMAIN%%%"
    call set "line=%%line:${TURN_SECRET}=%TURN_SECRET%%%"
    call set "line=%%line:${TURN_DOMAIN}=%TURN_DOMAIN%%%"
    call set "line=%%line:${LIVEKIT_KEY}=%LIVEKIT_KEY%%%"
    call set "line=%%line:${LIVEKIT_SECRET}=%LIVEKIT_SECRET%%%"
    echo !line!
  )
) > livekit.yaml

echo Generating turnserver.conf...
(
  for /f "delims=" %%L in (turnserver.conf.template) do (
    set "line=%%L"
    call set "line=%%line:${TURN_EXTERNAL_IP}=%TURN_EXTERNAL_IP%%%"
    call set "line=%%line:${TURN_SECRET}=%TURN_SECRET%%%"
    call set "line=%%line:${TURN_REALM}=%TURN_REALM%%%"
    call set "line=%%line:${TURN_CLI_PASSWORD}=%TURN_CLI_PASSWORD%%%"
    call set "line=%%line:${TURN_VERBOSE}=%TURN_VERBOSE%%%"
    echo !line!
  )
) > turnserver.conf

echo Done.
pause
