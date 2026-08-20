param(
  [string]$Root = "C:\9Expert Training-Build-Business App with Claude Code-Version 1\App-kopong\03-Landing Page",
  [int]$Port = 8099
)
$ErrorActionPreference = "Stop"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Output "serving $Root on http://localhost:$Port/"

$mime = @{
  ".html"="text/html; charset=utf-8"; ".css"="text/css; charset=utf-8";
  ".js"="application/javascript; charset=utf-8"; ".svg"="image/svg+xml";
  ".png"="image/png"; ".jpg"="image/jpeg"; ".webp"="image/webp";
  ".xml"="application/xml"; ".txt"="text/plain; charset=utf-8"; ".json"="application/json"
}

while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $rel = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
    if ([string]::IsNullOrWhiteSpace($rel)) { $rel = "index.html" }
    $path = Join-Path $Root ($rel -replace '/', '\')
    if (Test-Path -LiteralPath $path -PathType Container) { $path = Join-Path $path "index.html" }

    if (Test-Path -LiteralPath $path -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($path).ToLower()
      $ctype = $mime[$ext]
      if (-not $ctype) { $ctype = "application/octet-stream" }
      $bytes = [System.IO.File]::ReadAllBytes($path)
      $ctx.Response.ContentType = $ctype
      $ctx.Response.StatusCode = 200
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $nf = Join-Path $Root "404.html"
      if (Test-Path -LiteralPath $nf) {
        $bytes = [System.IO.File]::ReadAllBytes($nf)
        $ctx.Response.ContentType = "text/html; charset=utf-8"
        $ctx.Response.StatusCode = 404
        $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      } else {
        $ctx.Response.StatusCode = 404
      }
    }
    $ctx.Response.OutputStream.Close()
  } catch {
    Write-Output ("error: " + $_.Exception.Message)
  }
}
