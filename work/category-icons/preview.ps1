$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$root=Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$items=(Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'prompts.json')|ConvertFrom-Json).items
$sheet=[System.Drawing.Bitmap]::new(880,480)
$g=[System.Drawing.Graphics]::FromImage($sheet)
$font=[System.Drawing.Font]::new('Segoe UI',10)
$brush=[System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(40,30,40))
try{
 $g.Clear([System.Drawing.Color]::FromArgb(239,237,230))
 $g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
 $g.PixelOffsetMode=[System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
 for($i=0;$i -lt $items.Count;$i++){
  $item=$items[$i];$path=Join-Path $root ('images\icons\'+$item.category+'\'+$item.filename)
  $icon=[System.Drawing.Bitmap]::new($path)
  try{
   if($icon.Width -ne 128 -or $icon.Height -ne 128 -or -not [System.Drawing.Image]::IsAlphaPixelFormat($icon.PixelFormat)){throw ('Invalid icon: '+$item.name)}
   $x=($i%4)*220;$y=[Math]::Floor($i/4)*120
   $g.DrawImage($icon,[int]($x+12),[int]($y+8),64,64)
   $g.DrawImage($icon,[int]($x+108),[int]($y+28),24,24)
   $g.DrawImage($icon,[int]($x+166),[int]($y+33),13,13)
   $g.DrawString($item.name,$font,$brush,[single]($x+12),[single]($y+84))
  }finally{$icon.Dispose()}
 }
 $sheet.Save((Join-Path $PSScriptRoot 'preview.png'),[System.Drawing.Imaging.ImageFormat]::Png)
 Write-Output 'Verified all 13 PNGs: 128 x 128 with alpha channels. Preview saved at 64, 24 and 13 pixels.'
}finally{$brush.Dispose();$font.Dispose();$g.Dispose();$sheet.Dispose()}
