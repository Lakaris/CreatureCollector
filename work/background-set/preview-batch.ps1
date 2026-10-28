param([int]$Start=0,[int]$Count=8)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$workspacePath=Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$manifest=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'manifest.json') -Raw | ConvertFrom-Json
$items=@($manifest.items | Select-Object -Skip $Start -First $Count | Where-Object {Test-Path -LiteralPath (Join-Path $workspacePath $_.destination)})
if($items.Count -eq 0){throw 'No saved backgrounds.'}
$sheet=[System.Drawing.Bitmap]::new(1280,([int][Math]::Ceiling($items.Count/4)*370))
$g=[System.Drawing.Graphics]::FromImage($sheet)
$font=[System.Drawing.Font]::new('Segoe UI',10)
$brush=[System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(55,35,35))
try{
 $g.Clear([System.Drawing.Color]::FromArgb(245,238,225))
 $g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
 $g.PixelOffsetMode=[System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
 for($i=0;$i -lt $items.Count;$i++){
  $x=($i%4)*320;$y=[Math]::Floor($i/4)*370
  $b=[System.Drawing.Bitmap]::new((Join-Path $workspacePath $items[$i].destination))
  try{
   $g.DrawImage($b,[System.Drawing.Rectangle]::new(($x+10),($y+10),210,210),0,0,1536,1536,[System.Drawing.GraphicsUnit]::Pixel)
   $g.DrawImage($b,[System.Drawing.Rectangle]::new(($x+230),($y+10),80,120),256,0,1024,1536,[System.Drawing.GraphicsUnit]::Pixel)
   $g.DrawImage($b,[System.Drawing.Rectangle]::new(($x+10),($y+230),210,105),0,768,1536,768,[System.Drawing.GraphicsUnit]::Pixel)
   $g.DrawString($items[$i].name,$font,$brush,[single]($x+10),[single]($y+344))
  }finally{$b.Dispose()}
 }
 $destination=Join-Path $PSScriptRoot ('previews\batch-'+($Start+1).ToString('00')+'.png')
 $sheet.Save($destination,[System.Drawing.Imaging.ImageFormat]::Png)
 Write-Output $destination
}finally{$brush.Dispose();$font.Dispose();$g.Dispose();$sheet.Dispose()}
