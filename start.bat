@echo off
chcp 65001 > nul
title CYBER XO // Server
echo ========================================================
echo   CYBER XO - Запуск локального сервера...
echo   Адрес: http://localhost:5500/
echo ========================================================
start http://localhost:5500/
powershell -ExecutionPolicy Bypass -NoProfile -Command "$port = 5500; $root = (Get-Location).Path; $l = New-Object System.Net.HttpListener; $l.Prefixes.Add('http://localhost:' + $port + '/'); $l.Start(); Write-Host ('Сервер активен: http://localhost:' + $port + '/'); $m = @{'.html'='text/html; charset=utf-8';'.css'='text/css; charset=utf-8';'.js'='application/javascript; charset=utf-8';'.svg'='image/svg+xml';'.json'='application/json'}; try { while ($l.IsListening) { $c = $l.GetContext(); $u = $c.Request.Url.LocalPath; if ($u -eq '/' -or $u -eq '') { $u = '/index.html' }; $p = Join-Path $root ([System.Uri]::UnescapeDataString($u.TrimStart('/')).Replace('/', [System.IO.Path]::DirectorySeparatorChar)); if (Test-Path $p -PathType Leaf) { $ext = [System.IO.Path]::GetExtension($p).ToLower(); $c.Response.ContentType = if ($m.ContainsKey($ext)) { $m[$ext] } else { 'application/octet-stream' }; $b = [System.IO.File]::ReadAllBytes($p); $c.Response.ContentLength64 = $b.Length; $c.Response.OutputStream.Write($b, 0, $b.Length) } else { $c.Response.StatusCode = 404 }; $c.Response.Close() } } finally { $l.Stop() }"
pause
