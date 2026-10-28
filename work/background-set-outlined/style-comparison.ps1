$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$workspacePath=Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$names=@('ForestClearing.jpg','RockyCave.jpg')
$labels=@('Forest Clearing','Rocky Cave')
$sheet=[System.Drawing.Bitmap]::new(1040,1140)
$g=[System.Drawing.Graphics]::FromImage($sheet)
$font=[System.Drawing.Font]::new('Segoe UI',17)
$brush=[System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(38,29,36))
try{
 $g.Clear([System.Drawing.Color]::FromArgb(245,238,225))
 $g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
 $g.DrawString('Previous set',$font,$brush,20,10)
 $g.DrawString('Corrected outlines and simpler shapes',$font,$brush,540,10)
 for($row=0;$row -lt 2;$row++){
  $y=50+$row*545
  $paths=@((Join-Path $workspacePath ('images\flair\backgrounds\'+$names[$row])),(Join-Path $workspacePath ('images\flair\backgrounds\outlined\'+$names[$row])))
  for($col=0;$col -lt 2;$col++){
   $b=[System.Drawing.Bitmap]::new($paths[$col])
   try{$g.DrawImage($b,[System.Drawing.Rectangle]::new((20+$col*520),$y,480,480),0,0,$b.Width,$b.Height,[System.Drawing.GraphicsUnit]::Pixel)}finally{$b.Dispose()}
  }
  $g.DrawString($labels[$row],$font,$brush,20,($y+490))
 }
 $destination=Join-Path $PSScriptRoot 'style-comparison.jpg'
 $sheet.Save($destination,[System.Drawing.Imaging.ImageFormat]::Jpeg)
 Write-Output $destination
}finally{$brush.Dispose();$font.Dispose();$g.Dispose();$sheet.Dispose()}
