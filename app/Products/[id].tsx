import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Product, trendingProducts } from "~/app/Data/product";
import { useEffect, useState } from "react";
import { useCart } from "~/app/Cart/CartContext";

export default function ProductDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();

  // ✅ Thêm state cho số lượng, màu sắc, và kích thước
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    const foundProduct = trendingProducts.find((p) => p.id === Number(id));
    if (foundProduct) {
      setProduct(foundProduct);
      setSelectedColor(foundProduct.colors[0]); // Chọn màu mặc định
      setSelectedSize(foundProduct.sizes ? foundProduct.sizes[0] : null); // Chọn size đầu tiên nếu có
    }
  }, [id]);

  if (!product) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Product not found</Text>
      </View>
    );
  }

  const handleAddToCart = () => {
    if (product && selectedColor && selectedSize) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        color: selectedColor,
        size: selectedSize,
        image: product.img as any,
      });
    }
  };

  return (
    <SafeAreaView>
      <ScrollView className="p-4 bg-white">
        {/* Ảnh sản phẩm */}
        <Image
          source={product.img as number}
          style={{ width: "100%", height: 200, borderRadius: 8 }}
        />

        {/* Thông tin sản phẩm */}
        <Text className="text-3xl font-bold mt-4">{product.name}</Text>
        <Text className="text-black font-medium text-base">
          {product.description}
        </Text>

        {/* Giá tiền */}
        <Text className="text-lg font-bold text-red-500 mt-2">
          ${product.price} USD
        </Text>

        {/* Chọn màu */}
        <View className="mt-4">
          <Text className="text-lg font-semibold">Choose Color</Text>
          <View className="flex-row mt-2">
            {product.colors.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-full mx-1 border-2 ${
                  selectedColor === color
                    ? "border-black"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </View>
        </View>

        {/* Chọn size */}
        <View className="mt-4">
          <Text className="text-lg font-semibold">Choose Size</Text>
          <View className="flex-row mt-2">
            {product.sizes?.map((size) => (
              <TouchableOpacity
                key={size}
                onPress={() => setSelectedSize(size)}
                className={`px-4 py-2 mx-1 rounded-md ${
                  selectedSize === size ? "bg-blue-500" : "bg-gray-200"
                }`}
              >
                <Text
                  className={
                    selectedSize === size ? "text-white" : "text-black"
                  }
                >
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Số lượng */}
        <View className="mt-4">
          <Text className="text-lg font-semibold">Quantity</Text>
          <View className="flex-row items-center mt-2">
            <TouchableOpacity
              onPress={() => setQuantity((prev) => Math.max(1, prev - 1))}
              className="p-2 bg-gray-200 rounded-lg"
            >
              <Text>-</Text>
            </TouchableOpacity>
            <Text className="mx-4 text-lg">{quantity}</Text>
            <TouchableOpacity
              onPress={() => setQuantity((prev) => prev + 1)}
              className="p-2 bg-gray-200 rounded-lg"
            >
              <Text>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Nút thêm vào giỏ hàng */}
        <TouchableOpacity
          onPress={handleAddToCart}
          className="bg-orange-500 p-4 rounded-lg mt-4"
        >
          <Text className="text-white text-center text-lg">ADD TO CART</Text>
        </TouchableOpacity>

        {/* Quay lại */}
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-center text-blue-500">Go Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
