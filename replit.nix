{ pkgs }: {
  deps = [
    pkgs.imagemagick
    pkgs.dejavu_fonts   # DejaVu-Sans
    pkgs.noto-fonts     # wide glyph coverage
  ];
}
