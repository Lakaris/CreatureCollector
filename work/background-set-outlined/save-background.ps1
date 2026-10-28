param([Parameter(Mandatory=$true)][string]$SourcePath,[Parameter(Mandatory=$true)][string]$Filename)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
if($Filename -notmatch '^[A-Za-z0-9-]+\.jpg$'){throw 'Invalid background filename.'}
$workspacePath=Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$destination=Join-Path $workspacePath ('images\flair\backgrounds\outlined\'+$Filename)
if(Test-Path -LiteralPath $destination){throw ('Already exists: '+$destination)}
$source=[System.Drawing.Bitmap]::new($SourcePath)
$output=[System.Drawing.Bitmap]::new(1536,1536,[System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$thumb=[System.Drawing.Bitmap]::new(512,512,[System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$g=[System.Drawing.Graphics]::FromImage($output)
$tg=[System.Drawing.Graphics]::FromImage($thumb)
try{
 if($source.Width -ne $source.Height){throw 'Source must be square.'}
 foreach($graphics in @($g,$tg)){
  $graphics.Clear([System.Drawing.Color]::White)
  $graphics.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode=[System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.CompositingQuality=[System.Drawing.Drawing2D.CompositingQuality]::HighQuality
 }
 $g.DrawImage($source,[System.Drawing.Rectangle]::new(0,0,1536,1536),0,0,$source.Width,$source.Height,[System.Drawing.GraphicsUnit]::Pixel)
 $encoder=[System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
 $bytes=$null;$chosenQuality=85
 foreach($quality in @(85,83,80)){
  $parameters=[System.Drawing.Imaging.EncoderParameters]::new(1)
  $stream=[System.IO.MemoryStream]::new()
  try{
   $parameters.Param[0]=[System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality,[long]$quality)
   $output.Save($stream,$encoder,$parameters)
   $bytes=$stream.ToArray();$chosenQuality=$quality
  }finally{$stream.Dispose();$parameters.Dispose()}
  if($bytes.Length -le 614400){break}
 }
 [System.IO.File]::WriteAllBytes($destination,$bytes)
 $stem=[System.IO.Path]::GetFileNameWithoutExtension($Filename)
 Copy-Item -LiteralPath $SourcePath -Destination (Join-Path $PSScriptRoot ('masters\'+$stem+'.png'))
 $tg.DrawImage($output,0,0,512,512)
 $preview=Join-Path $PSScriptRoot ('previews\'+$stem+'.png')
 $thumb.Save($preview,[System.Drawing.Imaging.ImageFormat]::Png)
 $record=[ordered]@{filename=$Filename;source=$SourcePath;sourceWidth=$source.Width;sourceHeight=$source.Height;width=1536;height=1536;format='JPEG';quality=$chosenQuality;bytes=$bytes.Length;preview=$preview;savedUtc=[DateTime]::UtcNow.ToString('o')}
 $record | ConvertTo-Json -Compress | Add-Content -LiteralPath (Join-Path $PSScriptRoot 'completed.jsonl') -Encoding utf8
 $record | ConvertTo-Json -Compress
}finally{$tg.Dispose();$g.Dispose();$thumb.Dispose();$output.Dispose();$source.Dispose()}

