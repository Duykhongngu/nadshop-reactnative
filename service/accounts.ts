import { collection, query, onSnapshot, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { deleteUser, User } from "firebase/auth";
import { db } from "~/firebase.config";
import axios from "axios";

export type Account = {
  id: string;
  displayName: string;
  email: string;
  role: number;
  profileImage?: string;
};

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dpyzwrsni/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "unsigned_review_preset";

export const fetchAccounts = async (callback: (accounts: Account[]) => void, onError: (error: any) => void) => {
  try {
    const q = query(collection(db, "accounts"));
    return onSnapshot(q, (snapshot) => {
      const accountsData: Account[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        displayName: doc.data().displayName || "",
        email: doc.data().email || "",
        profileImage: doc.data().profileImage || "",
        role: doc.data().role || 0,
        createdAt: doc.data().createdAt || "",
      }));
      callback(accountsData);
    }, onError);
  } catch (error) {
    onError(error);
    return () => {};
  }
};

export const uploadImageToCloudinary = async (uri: string): Promise<string> => {
  const formData = new FormData();
  formData.append("file", {
    uri,
    type: "image/jpeg",
    name: "profile_image.jpg",
  } as any);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await axios.post(CLOUDINARY_URL, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.secure_url;
};

export const updateAccount = async (accountId: string, accountData: {
  displayName: string;
  email: string;
  profileImage: string | null;
  role: number;
}) => {
  const docRef = doc(db, "accounts", accountId);
  await updateDoc(docRef, accountData);
  return await getDoc(docRef);
};

export const deleteAccount = async (accountId: string, currentUser: User | null) => {
  await deleteDoc(doc(db, "accounts", accountId));
  if (currentUser && currentUser.uid === accountId) {
    await deleteUser(currentUser);
  }
}; 