param([switch]$Revised)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$audit=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'review-decisions.json') -Raw | ConvertFrom-Json
$creature=[System.Drawing.Bitmap]::new((Join-Path $PSScriptRoot 'scale-creature.png'))
$sourceFolder=if($Revised){'revised'}else{'originals'}
$contextFolder=if($Revised){'previews\context-after'}else{'previews\context'}
New-Item -ItemType Directory -Path (Join-Path $PSScriptRoot $contextFolder) -Force | Out-Null
try{
 foreach($item in $audit.items | Where-Object decision -eq 'edit'){
  $filename=[System.IO.Path]::GetFileName($item.path)
  $sourcePath=Join-Path $PSScriptRoot ($sourceFolder+'\'+$filename)
  if(!(Test-Path -LiteralPath $sourcePath)){continue}
  $b=[System.Drawing.Bitmap]::new($sourcePath)
  $stage=[System.Drawing.Bitmap]::new(1296,795)
  $g=[System.Drawing.Graphics]::FromImage($stage)
  try{
   $g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
   $g.PixelOffsetMode=[System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
   $cropHeight=$b.Width*795/1296
   $g.DrawImage($b,[System.Drawing.Rectangle]::new(0,0,1296,795),[single]0,[single]($b.Height-$cropHeight),[single]$b.Width,[single]$cropHeight,[System.Drawing.GraphicsUnit]::Pixel)
   $size=1296*0.22
   $g.DrawImage($creature,[single]((1296-$size)/2),[single](795-1296*0.07-$size),[single]$size,[single]$size)
   $stage.Save((Join-Path $PSScriptRoot ($contextFolder+'\'+[System.IO.Path]::GetFileNameWithoutExtension($filename)+'.png')),[System.Drawing.Imaging.ImageFormat]::Png)
  }finally{$g.Dispose();$stage.Dispose();$b.Dispose()}
 }
}finally{$creature.Dispose()}
