
# ------------------------------
# Simple Static File Server (.NET HttpListener)
# Supports: subfolders, MIME types, index fallback
# ------------------------------

$port = 8999
$root = Get-Location

Write-Host "Serving folder: $root"
Write-Host "URL: http://localhost:$port/"
Write-Host "Press Ctrl+C to stop."

# MIME type lookup table
$mime = @{
    ".html" = "text/html"
    ".htm"  = "text/html"
    ".js"   = "application/javascript"
    ".css"  = "text/css"
    ".json" = "application/json"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".txt"  = "text/plain"
}

# Create listener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

while ($true) {
    $ctx = $listener.GetContext()
    $urlPath = $ctx.Request.Url.LocalPath.TrimStart("/")

    # Default to index.html
    if ($urlPath -eq "") { $urlPath = "index.html" }

    # Map URL to physical file
    $file = Join-Path $root $urlPath

    # If it's a directory, look for index.html
    if (Test-Path $file -PathType Container) {
        $file = Join-Path $file "index.html"
    }

    if (Test-Path $file -PathType Leaf) {
        $ext = [System.IO.Path]::GetExtension($file).ToLower()
        $contentType = $mime[$ext]
        if (-not $contentType) { $contentType = "application/octet-stream" }

        $bytes = [System.IO.File]::ReadAllBytes($file)
        $ctx.Response.ContentType = $contentType
        $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    }
    else {
        $ctx.Response.StatusCode = 404
        $msg = "404 Not Found"
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($msg)
        $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    }

    $ctx.Response.Close()
}