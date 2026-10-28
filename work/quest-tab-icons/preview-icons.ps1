param([string]$Group='all')
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$workspacePath=Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$manifest=Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'prompts.json') | ConvertFrom-Json
$items=@($manifest.items | Where-Object {($Group -eq 'all' -or $_.group -eq $Group) -and (Test-Path -LiteralPath (Join-Path $workspacePath $_.destination))})
if($items.Count -eq 0){throw 'No saved icons to preview.'}
$sheet=[System.Drawing.Bitmap]::new(720,([int][Math]::Ceiling($items.Count/3)*122))
$g=[System.Drawing.Graphics]::FromImage($sheet)
$font=[System.Drawing.Font]::new('Segoe UI',9)
$brush=[System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(45,30,40))
try{
 $g.Clear([System.Drawing.Color]::FromArgb(237,234,227))
 $g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
 $g.PixelOffsetMode=[System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
 for($i=0;$i -lt $items.Count;$i++){
  $x=($i%3)*240;$y=[Math]::Floor($i/3)*122
  $b=[System.Drawing.Bitmap]::new((Join-Path $workspacePath $items[$i].destination))
  try{
   $g.DrawImage($b,[int]($x+12),[int]($y+10),64,64)
   $g.DrawImage($b,[int]($x+120),[int]($y+26),32,32)
   $g.DrawImage($b,[int]($x+201),[int]($y+35),13,13)
   $g.DrawString($items[$i].name,$font,$brush,[single]($x+12),[single]($y+90))
  }finally{$b.Dispose()}
 }
 $destination=Join-Path $PSScriptRoot ('preview-'+$Group+'.png')
 $sheet.Save($destination,[System.Drawing.Imaging.ImageFormat]::Png)
 Write-Output $destination
}finally{$brush.Dispose();$font.Dispose();$g.Dispose();$sheet.Dispose()}

