// import NextAuth from 'next-auth';
// import CredentialsProvider from "next-auth/providers/credentials"
// import {MongoDBAdapter} from "@next-auth/mongodb-adapter";
// import clientPromise from "@/lib/mongodb";
//
// const adminEmail = process.env.ADMIN_EMAIL;
// const adminPassword = process.env.ADMIN_PASSWORD;
// const crypto = require('crypto');
// const secretKey = crypto.randomBytes(32).toString('hex');
// console.log(secretKey);
//
// export default NextAuth({
//     providers: [
//         CredentialsProvider({
//             name: 'Credentials',
//             credentials: {
//                 email: { label: 'Email', type: 'email' },
//                 password: { label: 'Password', type: 'password' },
//             },
//             authorize: async (credentials) => {
//                 const { email, password } = credentials;
//                 // Check if the provided credentials match the admin account
//                 if (email === adminEmail && password === adminPassword) {
//                     // Return the admin user object
//                     return { email: adminEmail };
//                 }
//
//                 // If the credentials are invalid, return null
//                 return null;
//             },
//         }),
//     ],
//     encryption: {
//         secret: secretKey,
//     },
//     adapter: MongoDBAdapter(clientPromise)
// });
//
//
// this is the code for Layout:
//
// import { useState } from 'react';
// import { signIn } from 'next-auth/react';
//
// export default function LoginForm() {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [errorMessage, setErrorMessage] = useState('');
//
//     const handleLogin = async (e) => {
//         e.preventDefault();
//
//         const result = await signIn('credentials', {
//             redirect: false,
//             email,
//             password,
//         });
//
//         if (result?.error) {
//             setErrorMessage('Wrong email or password');
//         }
//     };