param([int]$Start=1,[int]$End=25)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$workspacePath=Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$manifest=Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'manifest.json') | ConvertFrom-Json
$icons=@($manifest.items | Where-Object { $_.ordinal -ge $Start -and $_.ordinal -le $End -and (Test-Path -LiteralPath (Join-Path $workspacePath ('images\equipment_icons\'+$_.filename))) })
$sheet=[System.Drawing.Bitmap]::new(900,([int][Math]::Ceiling($icons.Count/5)*118))
$graphics=[System.Drawing.Graphics]::FromImage($sheet)
$font=[System.Drawing.Font]::new('Segoe UI',9)
$brush=[System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(40,30,40))
try {
    $graphics.Clear([System.Drawing.Color]::FromArgb(237,234,227))
    $graphics.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode=[System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    for($i=0;$i -lt $icons.Count;$i++) {
        $x=($i%5)*180; $y=[Math]::Floor($i/5)*118
        $icon=[System.Drawing.Bitmap]::new((Join-Path $workspacePath ('images\equipment_icons\'+$icons[$i].filename)))
        try {
            $graphics.DrawImage($icon,[int]($x+8),[int]($y+8),64,64)
            $graphics.DrawImage($icon,[int]($x+90),[int]($y+24),32,32)
            $graphics.DrawImage($icon,[int]($x+145),[int]($y+33),13,13)
            $graphics.DrawString($icons[$i].name,$font,$brush,[single]($x+8),[single]($y+83))
        } finally { $icon.Dispose() }
    }
    $destination=Join-Path $PSScriptRoot ('preview-{0:D3}-{1:D3}.png' -f $Start,$End)
    $sheet.Save($destination,[System.Drawing.Imaging.ImageFormat]::Png)
    Write-Output $destination
} finally { $brush.Dispose();$font.Dispose();$graphics.Dispose();$sheet.Dispose() }
