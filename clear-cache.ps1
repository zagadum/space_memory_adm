# Скрипт очистки кэша Vite и dist
Write-Host "🧹 Очистка кэша Vite..." -ForegroundColor Cyan
Remove-Item -Path "node_modules\.vite" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "🧹 Очистка папки dist..." -ForegroundColor Cyan
Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "✅ Кэш успешно очищен!" -ForegroundColor Green
Write-Host ""
Write-Host "Перезапустите dev сервер:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""

