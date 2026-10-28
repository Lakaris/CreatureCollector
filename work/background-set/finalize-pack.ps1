$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.IO.Compression
$workspacePath=Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$manifest=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'manifest.json') -Raw | ConvertFrom-Json
$completed=@(Get-Content -LiteralPath (Join-Path $PSScriptRoot 'completed.jsonl') | ForEach-Object {$_ | ConvertFrom-Json})
if($manifest.items.Count -ne 79){throw 'The manifest must contain exactly 79 backgrounds.'}
if(@($manifest.items.filename | Select-Object -Unique).Count -ne 79){throw 'Duplicate filenames in manifest.'}
$index=@(foreach($item in $manifest.items){
 $path=Join-Path $workspacePath $item.destination
 if(!(Test-Path -LiteralPath $path)){throw ('Missing background: '+$item.name)}
 $bitmap=[System.Drawing.Bitmap]::new($path)
 try{if($bitmap.Width -ne 1536 -or $bitmap.Height -ne 1536 -or $bitmap.RawFormat.Guid -ne [System.Drawing.Imaging.ImageFormat]::Jpeg.Guid){throw ('Invalid dimensions or format: '+$item.name)}}finally{$bitmap.Dispose()}
 $record=$completed | Where-Object filename -eq $item.filename | Select-Object -Last 1
 if(!$record){throw ('Missing export record: '+$item.name)}
 [pscustomobject][ordered]@{name=$item.name;gameId=$item.id;filename=$item.filename;width=1536;height=1536;format='JPEG';quality=$record.quality;bytes=(Get-Item -LiteralPath $path).Length;sourceWidth=$record.sourceWidth;sourceHeight=$record.sourceHeight;sha256=(Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLower();path=$path}
})
$index | Select-Object * -ExcludeProperty path | Export-Csv -LiteralPath (Join-Path $PSScriptRoot 'background-index.csv') -NoTypeInformation -Encoding utf8
$template=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'gallery-template.html') -Raw
$localData=@($index | ForEach-Object {[ordered]@{name=$_.name;url=('../../images/flair/backgrounds/'+$_.filename);bytes=$_.bytes}}) | ConvertTo-Json -Compress
$localHtml=$template.Replace('%%DATA%%',$localData)
[System.IO.File]::WriteAllText((Join-Path $PSScriptRoot 'gallery.html'),$localHtml,[System.Text.UTF8Encoding]::new($false))
$portableData=@($index | ForEach-Object {[ordered]@{name=$_.name;url=('Backgrounds/'+$_.filename);bytes=$_.bytes}}) | ConvertTo-Json -Compress
$portableHtml=$template.Replace('%%DATA%%',$portableData)
$readme=@'
CREATURE BACKGROUNDS

79 backgrounds, exported as 1536 x 1536 opaque JPG files.
Generated with the built-in ImageGen tool, then resized and JPEG-encoded at quality 80-85.
Source dimensions and JPEG quality are recorded in background-index.csv.

Open gallery.html after extracting the ZIP to browse all scenes and preview square, wide, and tall crops.
All previews use center-bottom positioning. The optional marker shows the creature foot position.

SecludedCove-v2.jpg, VolcanicRidge-v2.jpg, and CrystalCave-v2.jpg are alternate versions; existing game artwork was preserved.
Game code was not changed.

The images are static compositions with broad scenery shapes suitable for later animation work.
They are flattened images, not layered animation assets.

manifest.json contains the generation prompts and scene metadata.
'@
[System.IO.File]::WriteAllText((Join-Path $PSScriptRoot 'README.txt'),$readme,[System.Text.UTF8Encoding]::new($false))
$sheet=[System.Drawing.Bitmap]::new(1280,1900)
$g=[System.Drawing.Graphics]::FromImage($sheet)
$font=[System.Drawing.Font]::new('Segoe UI',9)
$brush=[System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(55,35,35))
try{
 $g.Clear([System.Drawing.Color]::FromArgb(245,238,225))
 $g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
 for($i=0;$i -lt $index.Count;$i++){
  $x=($i%8)*160;$y=[Math]::Floor($i/8)*190
  $b=[System.Drawing.Bitmap]::new($index[$i].path)
  try{$g.DrawImage($b,[System.Drawing.Rectangle]::new(($x+6),($y+6),148,148),0,0,1536,1536,[System.Drawing.GraphicsUnit]::Pixel)}finally{$b.Dispose()}
  $g.DrawString($index[$i].name,$font,$brush,[System.Drawing.RectangleF]::new(($x+6),($y+158),148,30))
 }
 $sheet.Save((Join-Path $PSScriptRoot 'overview.jpg'),[System.Drawing.Imaging.ImageFormat]::Jpeg)
}finally{$brush.Dispose();$font.Dispose();$g.Dispose();$sheet.Dispose()}
$zipPath=Join-Path $PSScriptRoot 'Creature-Backgrounds-79.zip'
$zipStream=[System.IO.File]::Open($zipPath,[System.IO.FileMode]::CreateNew)
$zip=[System.IO.Compression.ZipArchive]::new($zipStream,[System.IO.Compression.ZipArchiveMode]::Create,$false)
try{
 foreach($entry in $index){[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip,$entry.path,('Backgrounds/'+$entry.filename),[System.IO.Compression.CompressionLevel]::NoCompression) | Out-Null}
 foreach($filename in @('background-index.csv','manifest.json','README.txt','overview.jpg')){[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip,(Join-Path $PSScriptRoot $filename),$filename,[System.IO.Compression.CompressionLevel]::Optimal) | Out-Null}
 $htmlEntry=$zip.CreateEntry('gallery.html')
 $writer=[System.IO.StreamWriter]::new($htmlEntry.Open(),[System.Text.UTF8Encoding]::new($false))
 try{$writer.Write($portableHtml)}finally{$writer.Dispose()}
}finally{$zip.Dispose();$zipStream.Dispose()}
$summary=[ordered]@{count=$index.Count;width=1536;height=1536;format='JPEG';totalBytes=($index.bytes | Measure-Object -Sum).Sum;minBytes=($index.bytes | Measure-Object -Minimum).Minimum;maxBytes=($index.bytes | Measure-Object -Maximum).Maximum;zipBytes=(Get-Item -LiteralPath $zipPath).Length;zip=$zipPath;gallery=(Join-Path $PSScriptRoot 'gallery.html');verifiedUtc=[DateTime]::UtcNow.ToString('o')}
$summary | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'verification.json') -Encoding utf8
$summary | ConvertTo-Json -Compress
