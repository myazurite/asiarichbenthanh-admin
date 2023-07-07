import '@/styles/globals.css';
import {SessionProvider} from "next-auth/react";
import {CategoryProvider} from "@/context/CategoryContext";

export default function App({Component, pageProps: {session, ...pageProps}}) {
    return (

        <SessionProvider session={session}>
            <CategoryProvider>
                <Component {...pageProps}/>
            </CategoryProvider>
        </SessionProvider>
    )
}
