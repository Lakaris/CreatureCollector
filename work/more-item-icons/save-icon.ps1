param([Parameter(Mandatory=$true)][string]$SourcePath,[Parameter(Mandatory=$true)][string]$Filename)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
if($Filename -notmatch '^[a-z0-9]+\.png$'){throw 'Invalid filename.'}
$workspacePath=Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$destination=Join-Path $workspacePath ('images\item_icons\'+$Filename)
if(Test-Path -LiteralPath $destination){throw ('Icon already exists: '+$Filename)}
$source=[System.Drawing.Bitmap]::new($SourcePath)
$draft=[System.Drawing.Bitmap]::new(256,256,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$output=[System.Drawing.Bitmap]::new(256,256,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$draftGraphics=[System.Drawing.Graphics]::FromImage($draft)
$graphics=[System.Drawing.Graphics]::FromImage($output)
try {
 foreach($g in @($draftGraphics,$graphics)){
  $g.Clear([System.Drawing.Color]::Transparent)
  $g.CompositingMode=[System.Drawing.Drawing2D.CompositingMode]::SourceCopy
  $g.CompositingQuality=[System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode=[System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
 }
 $draftGraphics.DrawImage($source,[System.Drawing.Rectangle]::new(0,0,256,256),0,0,$source.Width,$source.Height,[System.Drawing.GraphicsUnit]::Pixel)
 $left=256;$top=256;$right=-1;$bottom=-1
 for($y=0;$y -lt 256;$y++){for($x=0;$x -lt 256;$x++){
  if($draft.GetPixel($x,$y).A -ge 32){$left=[Math]::Min($left,$x);$top=[Math]::Min($top,$y);$right=[Math]::Max($right,$x);$bottom=[Math]::Max($bottom,$y)}
 }}
 if($right -lt $left){throw 'Empty source image.'}
 $scale=235/[Math]::Max(($right-$left+1),($bottom-$top+1))
 $drawX=127.5-$scale*(($left+$right)/2)
 $drawY=127.5-$scale*(($top+$bottom)/2)
 $target=[System.Drawing.RectangleF]::new([single]$drawX,[single]$drawY,[single](256*$scale),[single](256*$scale))
 $sourceRect=[System.Drawing.RectangleF]::new(0,0,$source.Width,$source.Height)
 $graphics.DrawImage($source,$target,$sourceRect,[System.Drawing.GraphicsUnit]::Pixel)
 $clear=0;$solid=0;$left=256;$top=256;$right=-1;$bottom=-1
 for($y=0;$y -lt 256;$y++){for($x=0;$x -lt 256;$x++){
  $a=$output.GetPixel($x,$y).A
  if($a -eq 0){$clear++};if($a -ge 250){$solid++}
  if($a -ge 32){$left=[Math]::Min($left,$x);$top=[Math]::Min($top,$y);$right=[Math]::Max($right,$x);$bottom=[Math]::Max($bottom,$y)}
 }}
 if($clear -lt 3000 -or $solid -lt 1000 -or $left -lt 8 -or $top -lt 8 -or $right -gt 247 -or $bottom -gt 247){throw 'Transparency or artwork margin check failed.'}
 $output.Save($destination,[System.Drawing.Imaging.ImageFormat]::Png)
 $record=[ordered]@{filename=$Filename;source=$SourcePath;width=256;height=256;clearPixels=$clear;solidPixels=$solid;bounds=@($left,$top,$right,$bottom);footprint=@(($right-$left+1),($bottom-$top+1));savedUtc=[DateTime]::UtcNow.ToString('o')}
 $record | ConvertTo-Json -Compress | Add-Content -LiteralPath (Join-Path $PSScriptRoot 'completed.jsonl') -Encoding utf8
 $record | ConvertTo-Json -Compress
}finally{$graphics.Dispose();$draftGraphics.Dispose();$output.Dispose();$draft.Dispose();$source.Dispose()}
