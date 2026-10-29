$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$root=Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$manifest=Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'prompts.json') | ConvertFrom-Json
$preview=[System.Drawing.Bitmap]::new(640,560)
$g=[System.Drawing.Graphics]::FromImage($preview)
$font=[System.Drawing.Font]::new('Segoe UI',11)
$brush=[System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(45,35,40))
try{
 $g.Clear([System.Drawing.Color]::FromArgb(242,240,236))
 $g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
 $g.PixelOffsetMode=[System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
 for($i=0;$i -lt 2;$i++){
  $item=$manifest.items[$i]
  $bitmap=[System.Drawing.Bitmap]::new((Join-Path $root $item.destination))
  try{
   $x=20+$i*320;$w=300;$h=[int]($w*$item.height/$item.width)
   $g.DrawString(($item.name+' — '+$item.width+' × '+$item.height),$font,$brush,[single]$x,[single]12)
   $g.DrawImage($bitmap,$x,42,$w,$h)
  }finally{$bitmap.Dispose()}
 }
 $preview.Save((Join-Path $PSScriptRoot 'preview.jpg'),[System.Drawing.Imaging.ImageFormat]::Jpeg)
}finally{$brush.Dispose();$font.Dispose();$g.Dispose();$preview.Dispose()}

