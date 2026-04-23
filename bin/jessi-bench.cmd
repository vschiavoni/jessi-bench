@echo off

set NODE_IMAGE=node:25.9.0-trixie
set ROOT_DIR=%~dp0..

if not exist %ROOT_DIR%\build\ (
    echo [94mWelcome to jessi-bench!
    echo Performing first-time setup[0m
    docker run --rm -q --name jessi-bench ^
        -v %ROOT_DIR%:/jessi-bench ^
        %NODE_IMAGE% /jessi-bench/bin/setup %* || exit /b 1
)

docker run --rm -itq --name jessi-bench ^
    -w /jessi-bench ^
    -v %ROOT_DIR%:/jessi-bench ^
    -v /var/run/docker.sock:/var/run/docker.sock ^
    -e MOUNT_SRC=%ROOT_DIR% ^
    %NODE_IMAGE% /jessi-bench/build/main %*
