$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$audit=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'review-decisions.json') -Raw | ConvertFrom-Json
$items=@($audit.items | Where-Object decision -eq 'edit')
$sheet=[System.Drawing.Bitmap]::new(1120,1160)
$g=[System.Drawing.Graphics]::FromImage($sheet)
$font=[System.Drawing.Font]::new('Segoe UI',10)
$brush=[System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(45,31,36))
try{
 $g.Clear([System.Drawing.Color]::FromArgb(245,238,225))
 $g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
 for($i=0;$i -lt $items.Count;$i++){
  $path=Join-Path $PSScriptRoot ('revised\'+[System.IO.Path]::GetFileName($items[$i].path))
  if(!(Test-Path -LiteralPath $path)){continue}
  $b=[System.Drawing.Bitmap]::new($path)
  $x=($i%4)*280+6;$y=[Math]::Floor($i/4)*290+6
  try{$g.DrawImage($b,[System.Drawing.Rectangle]::new($x,$y,268,268),0,0,$b.Width,$b.Height,[System.Drawing.GraphicsUnit]::Pixel)}finally{$b.Dispose()}
  $g.DrawString($items[$i].name,$font,$brush,[single]$x,[single]($y+270))
 }
 $destination=Join-Path $PSScriptRoot 'previews\edited-backgrounds-clean.jpg'
 $sheet.Save($destination,[System.Drawing.Imaging.ImageFormat]::Jpeg)
 Write-Output $destination
}finally{$brush.Dispose();$font.Dispose();$g.Dispose();$sheet.Dispose()}
