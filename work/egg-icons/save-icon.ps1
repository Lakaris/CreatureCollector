param(
    [Parameter(Mandatory=$true)][string]$SourcePath,
    [Parameter(Mandatory=$true)][string]$Filename,
    [ValidateRange(0,16)][int]$Inset = 0
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
if ($Filename -notmatch '^[a-z0-9]+\.png$') { throw 'Invalid icon filename.' }
$workspacePath = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$destination = Join-Path $workspacePath ('images\item_icons\' + $Filename)
if (Test-Path -LiteralPath $destination) { throw ('Icon already exists: ' + $Filename) }
$source = [System.Drawing.Bitmap]::new($SourcePath)
$output = [System.Drawing.Bitmap]::new(256,256,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($output)
try {
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.DrawImage($source,[System.Drawing.Rectangle]::new($Inset,$Inset,(256-2*$Inset),(256-2*$Inset)),0,0,$source.Width,$source.Height,[System.Drawing.GraphicsUnit]::Pixel)
    $clearPixels = 0
    $solidPixels = 0
    $left = 256; $top = 256; $right = -1; $bottom = -1
    for ($y=0;$y -lt 256;$y++) {
        for ($x=0;$x -lt 256;$x++) {
            $alpha = $output.GetPixel($x,$y).A
            if ($alpha -eq 0) { $clearPixels++ }
            if ($alpha -ge 250) { $solidPixels++ }
            if ($alpha -ge 32) {
                $left = [Math]::Min($left,$x); $top = [Math]::Min($top,$y)
                $right = [Math]::Max($right,$x); $bottom = [Math]::Max($bottom,$y)
            }
        }
    }
    if ($clearPixels -lt 3000 -or $solidPixels -lt 1000) { throw 'Transparency or visible object check failed.' }
    if ($left -lt 2 -or $top -lt 2 -or $right -gt 253 -or $bottom -gt 253) { throw 'Artwork touches canvas edge.' }
    $output.Save($destination,[System.Drawing.Imaging.ImageFormat]::Png)
    $record = [ordered]@{filename=$Filename;source=$SourcePath;width=256;height=256;clearPixels=$clearPixels;solidPixels=$solidPixels;bounds=@($left,$top,$right,$bottom);savedUtc=[DateTime]::UtcNow.ToString('o')}
    $record | ConvertTo-Json -Compress | Add-Content -LiteralPath (Join-Path $PSScriptRoot 'completed.jsonl') -Encoding utf8
    $record | ConvertTo-Json -Compress
}
finally {
    $graphics.Dispose()
    $output.Dispose()
    $source.Dispose()
}

