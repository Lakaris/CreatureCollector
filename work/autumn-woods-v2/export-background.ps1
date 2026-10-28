param([Parameter(Mandatory=$true)][string]$SourcePath)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$workspacePath=Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$destination=Join-Path $workspacePath 'images\flair\backgrounds\AutumnWoods-v2.jpg'
if(Test-Path -LiteralPath $destination){throw 'The destination already exists.'}
$source=[System.Drawing.Bitmap]::new($SourcePath)
$output=[System.Drawing.Bitmap]::new(1536,1536,[System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$g=[System.Drawing.Graphics]::FromImage($output)
$parameters=[System.Drawing.Imaging.EncoderParameters]::new(1)
try{
 if($source.Width -ne $source.Height){throw 'Source must be square.'}
 $g.Clear([System.Drawing.Color]::White)
 $g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
 $g.PixelOffsetMode=[System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
 $g.CompositingQuality=[System.Drawing.Drawing2D.CompositingQuality]::HighQuality
 $g.DrawImage($source,[System.Drawing.Rectangle]::new(0,0,1536,1536),0,0,$source.Width,$source.Height,[System.Drawing.GraphicsUnit]::Pixel)
 $encoder=[System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
 $parameters.Param[0]=[System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality,[long]85)
 $output.Save($destination,$encoder,$parameters)
 Copy-Item -LiteralPath $SourcePath -Destination (Join-Path $PSScriptRoot 'AutumnWoods-master.png')
 $record=[ordered]@{tool='image_gen.imagegen (built-in)';source=$SourcePath;sourceWidth=$source.Width;sourceHeight=$source.Height;file=$destination;width=1536;height=1536;format='JPEG';quality=85;bytes=(Get-Item -LiteralPath $destination).Length;footPosition=@(0.5,0.93);prompt='prompt.txt'}
 $record | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'export.json') -Encoding utf8
 $record | ConvertTo-Json -Compress
}finally{$parameters.Dispose();$g.Dispose();$output.Dispose();$source.Dispose()}
