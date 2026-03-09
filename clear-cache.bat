@echo off
echo Clearing Vite cache...
rmdir /s /q node_modules\.vite 2>nul
echo Clearing dist folder...
rmdir /s /q dist 2>nul
echo.
echo ✅ Cache cleared successfully!
echo.
echo Please restart your dev server:
echo   npm run dev
echo.
pause

