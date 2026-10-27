param([string]$SourcePath,[string]$Category,[string]$Filename)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$root=Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
if($Category -notin @('elements','roles','ranges') -or $Filename -notmatch '^[a-z]+\.png$'){throw 'Invalid output name'}
$folder=Join-Path $root ('images\icons\'+$Category)
New-Item -ItemType Directory -Path $folder -Force | Out-Null
$destination=Join-Path $folder $Filename
if(Test-Path -LiteralPath $destination){throw ('Already exists: '+$destination)}
$source=[System.Drawing.Bitmap]::new($SourcePath)
$output=[System.Drawing.Bitmap]::new(128,128,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g=[System.Drawing.Graphics]::FromImage($output)
try{
 $g.Clear([System.Drawing.Color]::Transparent)
 $g.CompositingMode=[System.Drawing.Drawing2D.CompositingMode]::SourceCopy
 $g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
 $g.PixelOffsetMode=[System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
 $g.DrawImage($source,[System.Drawing.Rectangle]::new(3,3,122,122),0,0,$source.Width,$source.Height,[System.Drawing.GraphicsUnit]::Pixel)
 $clear=0;$solid=0
 for($y=0;$y -lt 128;$y++){for($x=0;$x -lt 128;$x++){$a=$output.GetPixel($x,$y).A;if($a -eq 0){$clear++};if($a -ge 250){$solid++}}}
 if($clear -lt 1000 -or $solid -lt 300){throw 'Transparency/content check failed'}
 $output.Save($destination,[System.Drawing.Imaging.ImageFormat]::Png)
 [pscustomobject]@{path=$destination;width=128;height=128;clearPixels=$clear;solidPixels=$solid}|ConvertTo-Json -Compress
}finally{$g.Dispose();$output.Dispose();$source.Dispose()}
