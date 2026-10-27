param([string]$SourcePath)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$root=Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$dest=Join-Path $root 'images\icons\stars'
New-Item -ItemType Directory -Path $dest -Force|Out-Null
$src=[System.Drawing.Bitmap]::new($SourcePath)
$base=[System.Drawing.Bitmap]::new(128,128,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g=[System.Drawing.Graphics]::FromImage($base)
$g.Clear([System.Drawing.Color]::Transparent)
$g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode=[System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.DrawImage($src,2,2,124,124)
$g.Dispose();$src.Dispose()
# Locate the transparent center and inner dark border; the light rim stops this flood.
$inner=[bool[]]::new(16384)
$queue=[System.Collections.Generic.Queue[int]]::new();$queue.Enqueue(64*128+64)
while($queue.Count -gt 0){
 $p=$queue.Dequeue();if($inner[$p]){continue};$x=$p%128;$y=[int][Math]::Floor($p/128)
 $c=$base.GetPixel($x,$y);$v=($c.R+$c.G+$c.B)/3
 if($c.A -ge 128 -and $v -gt 100){continue}
 $inner[$p]=$true
 if($x -gt 0){$queue.Enqueue($p-1)};if($x -lt 127){$queue.Enqueue($p+1)};if($y -gt 0){$queue.Enqueue($p-128)};if($y -lt 127){$queue.Enqueue($p+128)}
}
if($inner[0]){throw 'Center cutout not enclosed'}
$palettes=@(
 @{name='Grey';rgb=@(113,122,135)},@{name='Bronze';rgb=@(191,117,64)},@{name='Silver';rgb=@(190,198,209)},@{name='Platinum';rgb=@(211,246,250)},@{name='Gold';rgb=@(255,201,55)}
)
$report=@()
foreach($hollow in @($true,$false)){foreach($pal in $palettes){
 $prefix=if($hollow){'hollow'}else{''};$filename=$prefix+$pal.name.ToLower()+'star.png';$path=Join-Path $dest $filename
 if(Test-Path -LiteralPath $path){throw ('Already exists: '+$path)}
 $out=[System.Drawing.Bitmap]::new(128,128,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
 for($y=0;$y -lt 128;$y++){for($x=0;$x -lt 128;$x++){
  $p=$y*128+$x;$c=$base.GetPixel($x,$y);$a=[int]$c.A;$v=($c.R+$c.G+$c.B)/3
  $t=[Math]::Clamp(($v-45)/100,0,1)
  if(-not $hollow -and $inner[$p]){$a=255;$t=1}
  $r=[int][Math]::Round(35+($pal.rgb[0]-35)*$t);$gg=[int][Math]::Round(27+($pal.rgb[1]-27)*$t);$b=[int][Math]::Round(38+($pal.rgb[2]-38)*$t)
  $out.SetPixel($x,$y,[System.Drawing.Color]::FromArgb($a,$r,$gg,$b))
 }}
 $out.Save($path,[System.Drawing.Imaging.ImageFormat]::Png)
 $displayPrefix=if($hollow){'Hollow '}else{''}
 $report += [pscustomobject]@{name=($displayPrefix+$pal.name+' Star');filename=$filename;width=128;height=128;centerAlpha=$out.GetPixel(64,64).A}
 $out.Dispose()
}}
$base.Dispose()
$report|ConvertTo-Json|Set-Content -LiteralPath (Join-Path $PSScriptRoot 'outputs.json') -Encoding utf8
$sheet=[System.Drawing.Bitmap]::new(900,280);$gr=[System.Drawing.Graphics]::FromImage($sheet)
$font=[System.Drawing.Font]::new('Segoe UI',9);$brush=[System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(35,27,38))
$gr.Clear([System.Drawing.Color]::FromArgb(236,233,227));$gr.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
for($i=0;$i -lt 10;$i++){$x=($i%5)*180;$y=[Math]::Floor($i/5)*140;$im=[System.Drawing.Bitmap]::new((Join-Path $dest $report[$i].filename));$gr.DrawImage($im,[int]($x+8),[int]($y+8),80,80);$gr.DrawImage($im,[int]($x+105),[int]($y+30),24,24);$gr.DrawImage($im,[int]($x+150),[int]($y+35),13,13);$gr.DrawString($report[$i].name,$font,$brush,[single]($x+8),[single]($y+101));$im.Dispose()}
$sheet.Save((Join-Path $PSScriptRoot 'preview.png'),[System.Drawing.Imaging.ImageFormat]::Png)
$gr.Dispose();$sheet.Dispose();$font.Dispose();$brush.Dispose()
$report|ConvertTo-Json -Compress
