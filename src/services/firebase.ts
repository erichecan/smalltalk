import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// 可选，如需存储文件（例如用户头像、对话附件等）则引入
// import { getStorage } from 'firebase/storage';

// 后续替换为环境变量，这里先硬编码（示例配置，请替换为你的 Firebase 项目参数）
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
// const storage = getStorage(firebaseApp);

export { firebaseApp, auth, db }; 