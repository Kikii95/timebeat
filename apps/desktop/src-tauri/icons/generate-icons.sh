#!/bin/bash
# Icon generator for Timebeat
# Requires: ImageMagick (convert command)
#
# Usage: ./generate-icons.sh source-icon.png
#
# To install ImageMagick on Ubuntu/WSL:
#   sudo apt install imagemagick

SOURCE=${1:-"timebeat-logo.png"}

if [ ! -f "$SOURCE" ]; then
  echo "Source icon not found: $SOURCE"
  echo "Please provide a 1024x1024 PNG source icon"
  exit 1
fi

# Windows icon (ICO)
convert "$SOURCE" -resize 256x256 icon.ico

# macOS icon (ICNS) - requires icns tools
convert "$SOURCE" -resize 512x512 icon.icns 2>/dev/null || \
  convert "$SOURCE" -resize 512x512 icon.png

# PNG variants
convert "$SOURCE" -resize 32x32 32x32.png
convert "$SOURCE" -resize 128x128 128x128.png
convert "$SOURCE" -resize 256x256 "128x128@2x.png"
convert "$SOURCE" -resize 512x512 icon.png

echo "Icons generated successfully!"
ls -la
