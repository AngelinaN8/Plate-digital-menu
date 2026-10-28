import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:"Plate — Food photography & visual menus",description:'Real food photography and visual menus that help restaurant owners show their dishes clearly and give guests a reason to choose them.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {return <html lang="en"><body>{children}</body></html>}
