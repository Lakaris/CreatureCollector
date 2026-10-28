$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$workspacePath=Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$image=[System.Drawing.Bitmap]::new((Join-Path $workspacePath 'images\flair\backgrounds\AutumnWoods-v2.jpg'))
$sheet=[System.Drawing.Bitmap]::new(1040,440)
$g=[System.Drawing.Graphics]::FromImage($sheet)
$font=[System.Drawing.Font]::new('Segoe UI',11)
$brush=[System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(50,35,30))
try{
 $g.Clear([System.Drawing.Color]::FromArgb(247,240,228))
 $g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
 $g.PixelOffsetMode=[System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
 $g.DrawString('Square stage',$font,$brush,20,15)
 $g.DrawString('Wide stage - top cropped',$font,$brush,400,15)
 $g.DrawString('Tall stage - sides cropped',$font,$brush,780,15)
 $g.DrawImage($image,[System.Drawing.Rectangle]::new(20,50,360,360),0,0,1536,1536,[System.Drawing.GraphicsUnit]::Pixel)
 $g.DrawImage($image,[System.Drawing.Rectangle]::new(400,170,360,240),0,512,1536,1024,[System.Drawing.GraphicsUnit]::Pixel)
 $g.DrawImage($image,[System.Drawing.Rectangle]::new(780,50,240,360),256,0,1024,1536,[System.Drawing.GraphicsUnit]::Pixel)
 $sheet.Save((Join-Path $PSScriptRoot 'crop-preview.png'),[System.Drawing.Imaging.ImageFormat]::Png)
}finally{$brush.Dispose();$font.Dispose();$g.Dispose();$sheet.Dispose();$image.Dispose()}
