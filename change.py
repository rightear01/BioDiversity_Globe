from PIL import Image, ImageEnhance

# Load the image
img_path = 'C:/brighter_123.jpg'
image = Image.open(img_path)

# Enhance the brightness
enhancer = ImageEnhance.Brightness(image)
brighter_image = enhancer.enhance(0.6)  # Increase brightness by 10%
 
# Save the enhanced image
output_path = 'Optimized.jpg'
brighter_image.save(output_path)
output_path
