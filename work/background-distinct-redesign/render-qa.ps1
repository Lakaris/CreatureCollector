$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$workspacePath=Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$items=@(
 @{Name='Glass Beach';File='GlassBeach.jpg';Compare='SecludedCove.jpg';Neighbor='Secluded Cove'},
 @{Name='Volcanic Ridge';File='VolcanicRidge.jpg';Compare='LavaSea.jpg';Neighbor='Lava Sea'},
 @{Name='Snow Ghost Ridge';File='SnowGhostRidge.jpg';Compare='WinterTaiga.jpg';Neighbor='Winter Taiga'},
 @{Name='Open Plains';File='OpenPlains.jpg';Compare='RainbowPlains.jpg';Neighbor='Rainbow Plains'}
)
$font=[System.Drawing.Font]::new('Segoe UI',11)
$brush=[System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(40,33,37))
$creature=[System.Drawing.Bitmap]::new((Join-Path $workspacePath 'work/background-scale-review/scale-creature.png'))
function Draw-Stage($graphics,$path,$x,$y,$w,$h,$label){
 $b=[System.Drawing.Bitmap]::new($path)
 try{
  $srcH=$b.Width*$h/$w
  $graphics.DrawImage($b,[System.Drawing.Rectangle]::new($x,$y,$w,$h),[single]0,[single]($b.Height-$srcH),[single]$b.Width,[single]$srcH,[System.Drawing.GraphicsUnit]::Pixel)
  $s=$w*0.22
  $graphics.DrawImage($creature,[single]($x+($w-$s)/2),[single]($y+$h-$w*0.07-$s),[single]$s,[single]$s)
  $graphics.DrawString($label,$font,$brush,[single]$x,[single]($y+$h+8))
 }finally{$b.Dispose()}
}
try{
 $comparison=[System.Drawing.Bitmap]::new(1200,1136)
 $g=[System.Drawing.Graphics]::FromImage($comparison)
 try{
  $g.Clear([System.Drawing.Color]::FromArgb(245,240,231));$g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  for($i=0;$i -lt 4;$i++){
   $item=$items[$i];$y=8+$i*284
   Draw-Stage $g (Join-Path $workspacePath ('images/flair/backgrounds/'+$item.Compare)) 6 $y 388 238 ('Comparison: '+$item.Neighbor)
   Draw-Stage $g (Join-Path $PSScriptRoot ('originals/'+$item.File)) 406 $y 388 238 ('Previous: '+$item.Name)
   Draw-Stage $g (Join-Path $PSScriptRoot ('revised/'+$item.File)) 806 $y 388 238 ('Redesigned: '+$item.Name)
  }
  $comparison.Save((Join-Path $PSScriptRoot 'previews/comparison.jpg'),[System.Drawing.Imaging.ImageFormat]::Jpeg)
 }finally{$g.Dispose();$comparison.Dispose()}
 $preview=[System.Drawing.Bitmap]::new(1000,688)
 $g=[System.Drawing.Graphics]::FromImage($preview)
 try{
  $g.Clear([System.Drawing.Color]::FromArgb(245,240,231));$g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  for($i=0;$i -lt 4;$i++){
   Draw-Stage $g (Join-Path $PSScriptRoot ('revised/'+$items[$i].File)) (8+($i%2)*500) (8+[int][Math]::Floor($i/2)*344) 484 297 $items[$i].Name
  }
  $preview.Save((Join-Path $PSScriptRoot 'previews/game-preview.jpg'),[System.Drawing.Imaging.ImageFormat]::Jpeg)
 }finally{$g.Dispose();$preview.Dispose()}
}finally{$font.Dispose();$brush.Dispose();$creature.Dispose()}
