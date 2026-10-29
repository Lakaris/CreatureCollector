$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$workspacePath = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$pairs = @(
  @('Secluded Cove','Glass Beach','SecludedCove','GlassBeach'),
  @('Volcanic Ridge','Lava Sea','VolcanicRidge','LavaSea'),
  @('Winter Taiga','Snow Ghost Ridge','WinterTaiga','SnowGhostRidge'),
  @('Open Plains','Rainbow Plains','OpenPlains','RainbowPlains'),
  @('Pine Forest','Redwood Grove','PineForest','RedwoodGrove'),
  @('Forest Clearing','Monarch Grove','ForestClearing','MonarchGrove'),
  @('Pond Side','Lotus Lake','PondSide','LotusLake'),
  @('Starry Night','Starlit Meadow','StarryNight','StarlitMeadow'),
  @('Ocean Abyss','Hydrothermal Vents','OceanAbyss','HydrothermalVents'),
  @('Stormy Cliffs','Primordial Sea','StormyCliffs','PrimordialSea')
)
$font = [System.Drawing.Font]::new('Segoe UI',12)
$titleFont = [System.Drawing.Font]::new('Segoe UI',15,[System.Drawing.FontStyle]::Bold)
$brush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(37,35,42))
$creature = [System.Drawing.Bitmap]::new((Join-Path $workspacePath 'work/background-scale-review/scale-creature.png'))
try {
  for ($page=0; $page -lt 2; $page++) {
    $sheet = [System.Drawing.Bitmap]::new(1000,1820)
    $g = [System.Drawing.Graphics]::FromImage($sheet)
    try {
      $g.Clear([System.Drawing.Color]::FromArgb(245,240,231))
      $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $g.DrawString('Similar backgrounds - current assets, wide stage crop', $titleFont, $brush, 16, 15)
      for ($row=0; $row -lt 5; $row++) {
        $pair = $pairs[$page*5+$row]
        for ($col=0; $col -lt 2; $col++) {
          $x=12+$col*500; $y=56+$row*350; $w=476; $h=292
          $b = [System.Drawing.Bitmap]::new((Join-Path $workspacePath ('images/flair/backgrounds/'+$pair[$col+2]+'.jpg')))
          try {
            $srcH=$b.Width*$h/$w
            $g.DrawImage($b,[System.Drawing.Rectangle]::new($x,$y,$w,$h),[single]0,[single]($b.Height-$srcH),[single]$b.Width,[single]$srcH,[System.Drawing.GraphicsUnit]::Pixel)
            $s=$w*0.22
            $g.DrawImage($creature,[single]($x+($w-$s)/2),[single]($y+$h-$w*0.07-$s),[single]$s,[single]$s)
            $g.DrawString($pair[$col],$font,$brush,[single]$x,[single]($y+$h+9))
          } finally {$b.Dispose()}
        }
      }
      $out = Join-Path $PSScriptRoot ('comparison-'+($page+1)+'.jpg')
      $sheet.Save($out,[System.Drawing.Imaging.ImageFormat]::Jpeg)
      Write-Output $out
    } finally {$g.Dispose();$sheet.Dispose()}
  }
} finally {$creature.Dispose();$font.Dispose();$titleFont.Dispose();$brush.Dispose()}
