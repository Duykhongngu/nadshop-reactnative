import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

interface AddToCartButtonProps {
  onPress: () => void;
  price: number;
  disabled: boolean;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  onPress,
  price,
  disabled,
}) => {
  // Shared value cho animation
  const opacity = useSharedValue(1);

  // Animated style - CÁCH ĐÚNG để sử dụng shared value
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const handlePress = () => {
    if (disabled) return;

    // Animation khi nhấn nút - sử dụng withTiming với callback
    opacity.value = withTiming(0.5, { duration: 300 }, (isFinished) => {
      if (isFinished) {
        // Chỉ tiếp tục nếu animation đã hoàn thành
        opacity.value = withTiming(1, { duration: 300 });
        // Trong JS thread, không được gọi hàm React trong worklet
        // runtime.runOnJS(onPress)(); - nếu dùng trong worklet
      }
    });

    // Do withTiming callback chạy trong UI thread, không thể gọi onPress trực tiếp từ đó
    // Nên vẫn dùng setTimeout nhưng lần này hợp lý hơn
    setTimeout(onPress, 300);
  };

  return (
    <Animated.View style={[styles.addToCartButtonContainer, animatedStyle]}>
      <TouchableOpacity
        style={[styles.addToCartButton, disabled && { opacity: 0.5 }]}
        onPress={handlePress}
        disabled={disabled}
      >
        <Text style={styles.addToCartText}>
          Thêm vào giỏ hàng - {price?.toLocaleString("vi-VN")} VNĐ
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  addToCartButtonContainer: {
    padding: 16,
  },
  addToCartButton: {
    backgroundColor: "#FF6B00",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  addToCartText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default AddToCartButton;
