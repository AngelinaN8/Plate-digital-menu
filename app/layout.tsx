import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:"Plate — Food photography & visual menus",description:'Ten hero dishes. Real food photography for your menu, Instagram and delivery listings, with a visual QR menu for your restaurant.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {return <html lang="en"><body>{children}</body></html>}
