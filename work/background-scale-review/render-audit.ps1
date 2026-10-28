param([int]$Start=0,[int]$Count=12,[switch]$Revised,[switch]$OnlyEdits)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$workspacePath=Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$audit=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'audit.json') -Raw | ConvertFrom-Json
$pool=$audit.items
if($OnlyEdits){$decisions=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'review-decisions.json') -Raw | ConvertFrom-Json;$pool=@($decisions.items | Where-Object decision -eq 'edit')}
$items=@($pool | Select-Object -Skip $Start -First $Count)
$cellWidth=400;$cellHeight=282;$stageWidth=388;$stageHeight=238
$sheet=[System.Drawing.Bitmap]::new(1200,([int][Math]::Ceiling($items.Count/3)*$cellHeight))
$g=[System.Drawing.Graphics]::FromImage($sheet)
$font=[System.Drawing.Font]::new('Segoe UI',10)
$brush=[System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(45,31,36))
$creature=[System.Drawing.Bitmap]::new((Join-Path $PSScriptRoot 'scale-creature.png'))
try{
 $g.Clear([System.Drawing.Color]::FromArgb(245,238,225))
 $g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
 $g.PixelOffsetMode=[System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
 for($i=0;$i -lt $items.Count;$i++){
  $x=($i%3)*$cellWidth+6;$y=[Math]::Floor($i/3)*$cellHeight+6
  $path=Join-Path $workspacePath $items[$i].path
  $staged=Join-Path $PSScriptRoot ('revised\'+[System.IO.Path]::GetFileName($items[$i].path))
  if($Revised -and (Test-Path -LiteralPath $staged)){$path=$staged}
  $b=[System.Drawing.Bitmap]::new($path)
  try{
   $sourceHeight=$b.Width*$stageHeight/$stageWidth
   $g.DrawImage($b,[System.Drawing.Rectangle]::new($x,$y,$stageWidth,$stageHeight),[single]0,[single]($b.Height-$sourceHeight),[single]$b.Width,[single]$sourceHeight,[System.Drawing.GraphicsUnit]::Pixel)
   $creatureSize=$stageWidth*$audit.creatureBoxFraction
   $g.DrawImage($creature,[single]($x+($stageWidth-$creatureSize)/2),[single]($y+$stageHeight-$stageWidth*$audit.feetBottomFraction-$creatureSize),[single]$creatureSize,[single]$creatureSize)
   $g.DrawString((($Start+$i+1).ToString('00')+' '+$items[$i].name),$font,$brush,[single]$x,[single]($y+$stageHeight+10))
  }finally{$b.Dispose()}
 }
 $prefix=if($Revised){'after'}else{'before'}
 if($OnlyEdits){$prefix='edits-'+$prefix}
 $destination=Join-Path $PSScriptRoot ('previews\'+$prefix+'-'+($Start+1).ToString('00')+'.png')
 $sheet.Save($destination,[System.Drawing.Imaging.ImageFormat]::Png)
 Write-Output $destination
}finally{$creature.Dispose();$brush.Dispose();$font.Dispose();$g.Dispose();$sheet.Dispose()}
