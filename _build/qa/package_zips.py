"""Zip the child theme and the core plugin into wordpress/dist/, the folder as the
zip's single top-level entry and forward slashes, as WordPress expects. Same
contents as before: every file on disk. Prints the file count and what changed
against the previous zip."""
import pathlib, zipfile

wp = pathlib.Path(r"C:/Users/varun/OneDrive/Desktop/s20/digital-heroes/whizzit/wordpress")
dist = wp / "dist"
dist.mkdir(exist_ok=True)

for name in ("whizzit-child", "whizzit-core"):
    target = dist / f"{name}.zip"
    old = set(zipfile.ZipFile(target).namelist()) if target.exists() else set()
    files = sorted(p for p in (wp / name).rglob("*") if p.is_file())
    tmp = dist / f"{name}.zip.tmp"
    with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for p in files:
            z.write(p, f"{name}/{p.relative_to(wp / name).as_posix()}")
    tmp.replace(target)
    new = set(zipfile.ZipFile(target).namelist())
    rel = lambda s: sorted(x.split("/", 1)[1] for x in s)
    print(f"{name}.zip: {len(new)} files, {target.stat().st_size / 1e6:.2f} MB (was {len(old)} files)")
    print("   added", len(new - old), rel(new - old)[:8])
    print("   removed", len(old - new), rel(old - new)[:8])
