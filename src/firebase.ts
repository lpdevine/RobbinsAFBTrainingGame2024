import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { DocumentReference, DocumentSnapshot, Timestamp, doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { collection, addDoc } from "firebase/firestore"; 
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";


// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCnHIN9RWMTZ1stQzOq-JLaBlANgYPQJJI",
  authDomain: "robbinsafbtraininggame.firebaseapp.com",
  projectId: "robbinsafbtraininggame",
  storageBucket: "robbinsafbtraininggame.firebasestorage.app",
  messagingSenderId: "663942158934",
  appId: "1:663942158934:web:81fb086dee29cda775f9f7",
  measurementId: "G-F8BRRFSWBR"
};


export const app = initializeApp(firebaseConfig);
export const database = getFirestore(app);
export const auth = getAuth();
export const user = auth.currentUser;

// Call this component to navigate to signin page when not signed in
export function PrivatePage(){
  const navigate = useNavigate();
  if(user == null) navigate("/signin");
}

export async function GetDoc(path: string) : Promise<DocumentSnapshot>{
  const docRef : DocumentSnapshot = await getDoc(doc(database, path));

  return docRef;
} 
export async function SetDoc(data: object, path:string){
    const docRef = await setDoc(doc(database, path), data);
}



export function GetActiveUserEmail() : string{
  // Get Email
  const email = auth.currentUser?.email;
  if(email == null) {console.log("User Email Uknown!"); throw new Error("Email Uknown!")}

  return email;
}
export async function GetUserData(email: string) : Promise<any>{
// Get Doc
const userDoc = await GetDoc("users/" + email);
if(!userDoc.exists()) throw new Error("User Doc doesn't exist!");
const data = userDoc.data();

return data;

}