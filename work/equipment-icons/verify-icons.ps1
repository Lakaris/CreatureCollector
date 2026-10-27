$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$workspacePath = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$manifestPath = Join-Path $PSScriptRoot 'manifest.json'
$manifest = Get-Content -Raw -LiteralPath $manifestPath | ConvertFrom-Json
$records = @(foreach ($item in $manifest.items) {
    $path = Join-Path $workspacePath ('images\equipment_icons\' + $item.filename)
    if (-not (Test-Path -LiteralPath $path)) { throw ('Missing icon: ' + $item.filename) }
    $bitmap = [System.Drawing.Bitmap]::new($path)
    try {
        if ($bitmap.Width -ne 256 -or $bitmap.Height -ne 256) { throw ('Incorrect dimensions: ' + $item.filename) }
        if ($bitmap.RawFormat.Guid -ne [System.Drawing.Imaging.ImageFormat]::Png.Guid) { throw ('Not PNG: ' + $item.filename) }
        if (-not [System.Drawing.Image]::IsAlphaPixelFormat($bitmap.PixelFormat)) { throw ('No alpha channel: ' + $item.filename) }
        $rect = [System.Drawing.Rectangle]::new(0,0,256,256)
        $data = $bitmap.LockBits($rect,[System.Drawing.Imaging.ImageLockMode]::ReadOnly,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        try {
            $bytes = [byte[]]::new([Math]::Abs($data.Stride) * 256)
            [System.Runtime.InteropServices.Marshal]::Copy($data.Scan0,$bytes,0,$bytes.Length)
        } finally { $bitmap.UnlockBits($data) }
        $clearPixels = 0; $solidPixels = 0
        for ($i=3; $i -lt $bytes.Length; $i+=4) {
            if ($bytes[$i] -eq 0) { $clearPixels++ }
            if ($bytes[$i] -ge 250) { $solidPixels++ }
        }
        if ($clearPixels -lt 3000 -or $solidPixels -lt 1000) { throw ('Empty icon or inadequate transparency: ' + $item.filename) }
        [pscustomobject]@{
            ordinal=$item.ordinal; name=$item.name; filename=$item.filename
            width=$bitmap.Width; height=$bitmap.Height; transparentPixels=$clearPixels; solidPixels=$solidPixels
            sha256=(Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash
        }
    } finally { $bitmap.Dispose() }
})
if ($records.Count -ne 233) { throw ('Expected 233 icons, found ' + $records.Count) }
if (@($records.filename | Select-Object -Unique).Count -ne 233) { throw 'Duplicate filenames.' }
if (@($records.sha256 | Select-Object -Unique).Count -ne 233) { throw 'Duplicate image files.' }
$report = [ordered]@{
    verifiedUtc=[DateTime]::UtcNow.ToString('o'); total=233; newlyCreated=232; existingAnchorCharm=1
    format='PNG'; width=256; height=256; transparentBackground=$true
    generationTool='image_gen.imagegen'; iconDirectory=(Join-Path $workspacePath 'images\equipment_icons')
    visualReviewSizes=@(64,32,13); items=$records
}
$report | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'verification.json') -Encoding utf8
$records | Select-Object name,filename,width,height | Export-Csv -LiteralPath (Join-Path $PSScriptRoot 'equipment-icon-index.csv') -NoTypeInformation -Encoding utf8
foreach ($item in $manifest.items) { if ($item.status -ne 'existing') { $item.status = 'saved' } }
$manifest | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $manifestPath -Encoding utf8
[pscustomobject]@{verified=$records.Count;size='256 x 256';format='PNG';transparent=$true;uniqueImages=233} | ConvertTo-Json -Compress
