import sys
from PIL import Image

def remove_white_bg(input_path, output_path, tolerance=50):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    newData = []
    for item in datas:
        # Check if the pixel is near-white
        # White is (255, 255, 255)
        r, g, b, a = item
        if (r > 255 - tolerance and g > 255 - tolerance and b > 255 - tolerance):
            # Change near-white pixels to transparent
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
            
    img.putdata(newData)
    img.save(output_path, "PNG")
    print(f"Saved to {output_path}")

if __name__ == "__main__":
    if len(sys.argv) > 2:
        remove_white_bg(sys.argv[1], sys.argv[2])
    else:
        print("Usage: python script.py <input> <output>")
