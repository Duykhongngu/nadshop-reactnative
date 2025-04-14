"use client";

import { useState, useEffect } from "react";
import Logo from "~/assets/logo.svg";
import { useColorScheme } from "~/lib/useColorScheme";

import {
  Modal,
  View,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Alert,
  Image,
  Vibration,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  MenuIcon,
  MessageCircle,
  SearchIcon,
  Send,
  ShoppingCart,
  Truck,
} from "lucide-react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import SearchBar from "./search";

import { onAuthStateChanged } from "firebase/auth";
import { useCart } from "../user/Cart/CartContext";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { logout } from "~/service/api/auth";
import { auth } from "~/firebase.config";
import { db } from "~/firebase.config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
const inlineMenu = [
  { title: "Valentine's Day", link: "/user/Products/[id]" },
  { title: "Occasions", link: "/user/Products/[id]" },
  { title: "Recipients", link: "/user/Products/[id]" },
  { title: "Interests", link: "/user/Products/[id]" },
  { title: "Home & Kitchen", link: "/user/Products/[id]" },
  { title: "Clothing & Jewelry", link: "/user/Products/[id]" },
  { title: "Drinkware & Barware", link: "/user/Products/[id]" },
  { title: "Accessories", link: "/user/Products/[id]" },
  { title: "Happy Customers", link: "/user/Products/[id]" },
];

interface User {
  name: string;
}

function SiteHeader() {
  const { isDarkColorScheme } = useColorScheme();
  const iconColor = isDarkColorScheme ? "white" : "black";
  const { cartItems } = useCart();
  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    photoURL: string;
    displayName: string;
  } | null>(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [lastMessageCount, setLastMessageCount] = useState(0);

  useEffect(() => {
    const fetchUserProfile = async (uid: string) => {
      try {
        const userDoc = await getDoc(doc(db, "accounts", uid));
        if (userDoc.exists()) {
          setUserProfile({
            photoURL: userDoc.data().profileImage,
            displayName: userDoc.data().displayName || "User",
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser?.uid) {
        fetchUserProfile(currentUser.uid);
      } else {
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchOrdersCount = async () => {
      if (auth.currentUser) {
        try {
          const q = query(
            collection(db, "orderManager"),
            where("userId", "==", auth.currentUser.uid)
          );
          const querySnapshot = await getDocs(q);
          setTotalOrders(querySnapshot.docs.length);
        } catch (error) {
          console.error("Lỗi khi lấy số lượng đơn hàng từ Firebase:", error);
          Alert.alert("Lỗi", "Không thể tải số lượng đơn hàng.");
          setTotalOrders(0);
        }
      } else {
        setTotalOrders(0);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, () => {
      fetchOrdersCount();
    });

    fetchOrdersCount();

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("Notification permissions not granted");
      }
    })();
  }, []);

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const count = await AsyncStorage.getItem("chatUnreadCount");
        const newCount = count ? parseInt(count) : 0;
        setUnreadMessages(newCount);

        if (newCount > lastMessageCount && lastMessageCount !== 0) {
          Vibration.vibrate();

          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Tin nhắn mới",
              body: "Bạn có tin nhắn mới từ Admin",
              sound: true,
            },
            trigger: null,
          });
        }
        setLastMessageCount(newCount);
      } catch (error) {
        console.error("Error loading unread count:", error);
      }
    };

    loadUnreadCount();

    const interval = setInterval(loadUnreadCount, 1000);

    return () => clearInterval(interval);
  }, [lastMessageCount]);

  const handleLogout = async () => {
    try {
      setProfileMenuVisible(false);
      setUser(null);
      setUserProfile(null);
      setTotalOrders(0);
      setIsSearchOpen(false);
      setMenuVisible(false);

      await logout();

      await new Promise((resolve) => setTimeout(resolve, 300));

      await router.push("/");
    } catch (error: any) {
      console.error("Lỗi đăng xuất:", error);
      Alert.alert("Lỗi đăng xuất", error.message);
    }
  };

  useEffect(() => {
    const cleanup = () => {
      setUser(null);
      setUserProfile(null);
      setTotalOrders(0);
      setIsSearchOpen(false);
      setMenuVisible(false);
      setProfileMenuVisible(false);
    };
    return cleanup;
  }, []);

  return (
    <View style={styles.container}>
      {/* Left Section */}
      <View style={styles.leftSection}>
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={styles.iconButton}
        >
          <MenuIcon size={24} color={iconColor} />
        </TouchableOpacity>
      </View>

      {/* Center Section */}
      <View style={styles.centerSection}>
        <TouchableOpacity onPress={() => router.push("/user/home")}>
          <Logo width={80} height={28} />
        </TouchableOpacity>
      </View>

      {/* Right Section */}
      <View style={styles.rightSection}>
        <View style={styles.iconGroup}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setIsSearchOpen(true)}
          >
            <SearchIcon size={24} color={iconColor} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push("/user/Checkout/OrderStatus" as any)}
          >
            <Truck size={24} color={iconColor} />
            {totalOrders > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalOrders}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push("/user/Cart/CartPages" as any)}
          >
            <ShoppingCart size={24} color={iconColor} />
            {totalItems > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push("/user/Chat/AdminChat" as any)}
          >
            <Send size={24} color={iconColor} />
            {unreadMessages > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadMessages}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => setProfileMenuVisible(true)}
          style={styles.profileButton}
        >
          <Image
            source={{
              uri: userProfile?.photoURL || "https://via.placeholder.com/36",
            }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {/* Profile Menu Modal */}
      <Modal
        visible={profileMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setProfileMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setProfileMenuVisible(false)}
        >
          <View
            style={[
              styles.profileMenu,
              isDarkColorScheme && styles.darkProfileMenu,
            ]}
          >
            <TouchableOpacity
              style={styles.profileMenuItem}
              onPress={() => {
                setProfileMenuVisible(false);
                router.push("/user/Auth/Profile");
              }}
            >
              <Text
                style={[
                  styles.profileMenuText,
                  isDarkColorScheme && styles.darkText,
                ]}
              >
                {userProfile?.displayName || user?.displayName || "User"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.profileMenuItem}
              onPress={() => {
                setProfileMenuVisible(false);
                router.push("/user/Reviews/ProductsToReview");
              }}
            >
              <Text
                style={[
                  styles.profileMenuText,
                  isDarkColorScheme && styles.darkText,
                ]}
              >
                Đánh giá sản phẩm
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.profileMenuItem}
              onPress={() => {
                setProfileMenuVisible(false);
                router.push("/user/Chat/AdminChat");
              }}
            >
              <Text
                style={[
                  styles.profileMenuText,
                  isDarkColorScheme && styles.darkText,
                ]}
              >
                Chat với Admin
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.profileMenuItem}
              onPress={() => {
                setProfileMenuVisible(false);
                router.push("/user/Chat/ChatScreen");
              }}
            >
              <Text
                style={[
                  styles.profileMenuText,
                  isDarkColorScheme && styles.darkText,
                ]}
              >
                Chat với trợ lý ảo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.profileMenuItem}
              onPress={handleLogout}
            >
              <Text
                style={[
                  styles.profileMenuText,
                  isDarkColorScheme && styles.darkText,
                ]}
              >
                Đăng xuất
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Menu Modal */}
      <Modal visible={menuVisible} transparent animationType="slide">
        <View
          style={[styles.modalContainer, isDarkColorScheme && styles.darkModal]}
        >
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setMenuVisible(false)}
          >
            <ChevronLeft size={24} color={iconColor} />
            <Text style={[styles.backText, { color: iconColor }]}>Back</Text>
          </TouchableOpacity>

          {/* Menu list */}
          {inlineMenu.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                router.push(item.link as any);
                setMenuVisible(false);
              }}
            >
              <View style={styles.menuItem}>
                <Text
                  style={[
                    styles.menuText,
                    isDarkColorScheme && styles.darkText,
                  ]}
                >
                  {item.title}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      {/* Search Modal */}
      <Modal visible={isSearchOpen} transparent={true} animationType="slide">
        <View
          style={[styles.modalContainer, isDarkColorScheme && styles.darkModal]}
        >
          <View style={styles.searchHeader}>
            <TouchableOpacity
              onPress={() => setIsSearchOpen(false)}
              style={styles.cancelButton}
            >
              <ChevronLeft size={24} color={iconColor} />
              <Text style={{ color: iconColor }}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.searchContent}>
            <SearchBar />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  leftSection: {
    alignItems: "flex-start",
    justifyContent: "center",
  },
  centerSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  iconGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
    gap: 3,
  },
  iconButton: {
    padding: 4,
    position: "relative",
  },
  profileButton: {
    padding: 4,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 2,
    backgroundColor: "#ff0000",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 2,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  darkModal: {
    backgroundColor: "#1c1c1c",
  },
  closeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  backText: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  menuText: {
    fontSize: 16,
    fontWeight: "500",
    color: "black",
  },
  darkText: {
    color: "white",
  },
  searchHeader: {
    justifyContent: "flex-start",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  searchContent: {
    flex: 1,
    padding: 16,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  profileMenu: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 8,
    marginTop: 60,
    marginRight: 16,
    width: 150,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  darkProfileMenu: {
    backgroundColor: "#1c1c1c",
  },
  profileMenuItem: {
    paddingVertical: 8,
  },
  profileMenuText: {
    fontSize: 16,
    fontWeight: "500",
    color: "black",
  },
});

export default SiteHeader;
