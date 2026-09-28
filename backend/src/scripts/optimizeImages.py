import os
import shutil
from PIL import Image

workspace = r"c:\Users\The Mighty King\Desktop\colorido2026"
gallery_dir = os.path.join(workspace, "frontend", "public", "gallery")
assets_dir = os.path.join(workspace, "frontend", "public", "assets")
backup_dir = os.path.join(workspace, "frontend", "public", "gallery_original_raw_backup")

print("="*60)
print("🚀 COLORIDO '26 — IMAGE OPTIMIZER & COMPRESSION ENGINE")
print("="*60)

# Step 1: Backup raw images
if not os.path.exists(backup_dir):
    print(f"\n📦 Backing up original camera raw files to:\n   {backup_dir}")
    shutil.copytree(gallery_dir, backup_dir)
    print("✅ Backup complete!")
else:
    print(f"\n📦 Backup already exists at:\n   {backup_dir}")

def optimize_image(filepath, max_dimension=1920, quality=85):
    orig_size = os.path.getsize(filepath)
    ext = os.path.splitext(filepath)[1].lower()
    
    if ext not in ['.jpg', '.jpeg', '.png', '.webp']:
        return 0, 0
    
    try:
        with Image.open(filepath) as img:
            orig_w, orig_h = img.size
            
            # Determine format
            is_png = (ext == '.png')
            save_format = 'PNG' if is_png else 'JPEG'
            
            if is_png:
                # If PNG has alpha channel, keep RGBA, otherwise RGB
                if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                    img = img.convert('RGBA')
                else:
                    img = img.convert('RGB')
            else:
                img = img.convert('RGB')
            
            # Resize if larger than max_dimension
            scale = min(max_dimension / max(orig_w, orig_h), 1.0)
            new_w = max(1, int(orig_w * scale))
            new_h = max(1, int(orig_h * scale))
            
            if scale < 1.0:
                img_resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            else:
                img_resized = img
            
            # Save to temporary path first
            temp_path = filepath + ".tmp"
            if is_png:
                img_resized.save(temp_path, format='PNG', optimize=True)
            else:
                img_resized.save(temp_path, format='JPEG', quality=quality, optimize=True, progressive=True)
            
            new_size = os.path.getsize(temp_path)
            
            # If the new file is smaller, replace original
            if new_size < orig_size:
                os.replace(temp_path, filepath)
                saved_bytes = orig_size - new_size
                print(f"  ⚡ {os.path.basename(filepath):20} {orig_size/(1024*1024):5.2f} MB ➔ {new_size/1024:6.1f} KB  (-{saved_bytes/orig_size*100:4.1f}%)")
                return orig_size, new_size
            else:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                print(f"  ℹ️ {os.path.basename(filepath):20} already optimal ({orig_size/1024:6.1f} KB)")
                return orig_size, orig_size
                
    except Exception as e:
        print(f"  ❌ Error processing {os.path.basename(filepath)}: {e}")
        return orig_size, orig_size

total_before = 0
total_after = 0

print(f"\n1️⃣ Optimizing Gallery Images ({gallery_dir})...")
for f in os.listdir(gallery_dir):
    p = os.path.join(gallery_dir, f)
    if os.path.isfile(p):
        b, a = optimize_image(p, max_dimension=1920, quality=85)
        total_before += b
        total_after += a

print(f"\n2️⃣ Optimizing Festival Asset Images ({assets_dir})...")
for f in os.listdir(assets_dir):
    p = os.path.join(assets_dir, f)
    if os.path.isfile(p):
        b, a = optimize_image(p, max_dimension=1920, quality=85)
        total_before += b
        total_after += a

saved_total_mb = (total_before - total_after) / (1024 * 1024)
print("\n" + "="*60)
print(f"🎉 OPTIMIZATION COMPLETE!")
print(f"   Before: {total_before / (1024*1024):.2f} MB")
print(f"   After:  {total_after / (1024*1024):.2f} MB")
print(f"   Saved:  {saved_total_mb:.2f} MB ({100 - (total_after/total_before*100):.1f}% reduction!)")
print("="*60)
