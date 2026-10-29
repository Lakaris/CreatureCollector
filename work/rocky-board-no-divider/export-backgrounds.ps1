$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$root=Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$manifest=Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'prompts.json') | ConvertFrom-Json
$codec=[System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$parameters=[System.Drawing.Imaging.EncoderParameters]::new(1)
$parameters.Param[0]=[System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality,[long]95)
$records=foreach($item in $manifest.items){
 $destination=Join-Path $root $item.destination
 if(Test-Path -LiteralPath $destination){throw ('Destination already exists: '+$destination)}
 $source=[System.Drawing.Bitmap]::new($item.source)
 $output=[System.Drawing.Bitmap]::new([int]$item.width,[int]$item.height,[System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
 $g=[System.Drawing.Graphics]::FromImage($output)
 try{
  $g.Clear([System.Drawing.Color]::FromArgb(215,211,204))
  $g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode=[System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $crop=[System.Drawing.RectangleF]::new(0,0,[single]$source.Width,[single]$source.Height)
  $target=[System.Drawing.RectangleF]::new(0,0,[single]$item.width,[single]$item.height)
  $g.DrawImage($source,$target,$crop,[System.Drawing.GraphicsUnit]::Pixel)
  $output.Save($destination,$codec,$parameters)
 }finally{$g.Dispose();$output.Dispose();$source.Dispose()}
 $check=[System.Drawing.Bitmap]::new($destination)
 try{
  if($check.Width -ne $item.width -or $check.Height -ne $item.height -or $check.RawFormat.Guid -ne [System.Drawing.Imaging.ImageFormat]::Jpeg.Guid){throw 'JPEG verification failed.'}
  [pscustomobject]@{name=$item.name;path=$item.destination;width=$check.Width;height=$check.Height;format='JPEG';bytes=(Get-Item -LiteralPath $destination).Length}
 }finally{$check.Dispose()}
}
$parameters.Dispose()
$records | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'verification.json') -Encoding utf8
$records | ConvertTo-Json -Compress

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
   $g.DrawString(([string]$item.columns+' × '+$item.rows+' — '+$item.width+' × '+$item.height),$font,$brush,[single]$x,[single]12)
   $g.DrawImage($bitmap,$x,42,$w,$h)
  }finally{$bitmap.Dispose()}
 }
 $preview.Save((Join-Path $PSScriptRoot 'preview.jpg'),[System.Drawing.Imaging.ImageFormat]::Jpeg)
}finally{$brush.Dispose();$font.Dispose();$g.Dispose();$preview.Dispose()}
