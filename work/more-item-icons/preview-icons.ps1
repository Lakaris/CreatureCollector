$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$workspacePath=Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$manifest=Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'manifest.json') | ConvertFrom-Json
$order=@('Gems','Gear Shards','Dungeon Pass','Food','Candy','Skin Shards','Ancient Fertilizer','Fire Melon','Water Melon','Nature Melon','Earth Melon','Wind Melon','Electric Melon','Light Melon','Dark Melon','Rainbow Melon','Common Ascension Melon','Epic Ascension Melon','Legendary Ascension Melon','Flair Shard')
$items=@($manifest.items | Where-Object {Test-Path -LiteralPath (Join-Path $workspacePath ('images\item_icons\'+$_.filename))} | Sort-Object {$order.IndexOf($_.name)})
$sheet=[System.Drawing.Bitmap]::new(880,([int][Math]::Ceiling($items.Count/4)*122))
$g=[System.Drawing.Graphics]::FromImage($sheet)
$font=[System.Drawing.Font]::new('Segoe UI',9)
$brush=[System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(45,30,40))
try{
 $g.Clear([System.Drawing.Color]::FromArgb(237,234,227))
 $g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
 $g.PixelOffsetMode=[System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
 for($i=0;$i -lt $items.Count;$i++){
  $x=($i%4)*220;$y=[Math]::Floor($i/4)*122
  $b=[System.Drawing.Bitmap]::new((Join-Path $workspacePath ('images\item_icons\'+$items[$i].filename)))
  try{
   $g.DrawImage($b,[int]($x+12),[int]($y+10),64,64)
   $g.DrawImage($b,[int]($x+110),[int]($y+26),32,32)
   $g.DrawImage($b,[int]($x+181),[int]($y+35),13,13)
   $g.DrawString($items[$i].name,$font,$brush,[single]($x+12),[single]($y+90))
  }finally{$b.Dispose()}
 }
 $destination=Join-Path $PSScriptRoot 'preview.png'
 $sheet.Save($destination,[System.Drawing.Imaging.ImageFormat]::Png)
 Write-Output $destination
}finally{$brush.Dispose();$font.Dispose();$g.Dispose();$sheet.Dispose()}
