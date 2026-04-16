#!/bin/bash
export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
cd /Users/artsiomhrableuski/GLS_SPACE_ADMIN/space_memory_adm
npm run dev -- --host 127.0.0.1 --port 5173 > vite_dev.log 2>&1 &
echo $! > vite_dev.pid
