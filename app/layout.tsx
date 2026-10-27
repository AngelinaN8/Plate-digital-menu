import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:"Plate — See what you're ordering",description:'Beautiful visual menus and a photo atelier concept for Dubai restaurants.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {return <html lang="en"><body>{children}</body></html>}
