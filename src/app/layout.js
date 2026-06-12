import './globals.css'

export const metadata = {
  title: '할 일 목록',
  description: 'localStorage 기반 Todo 앱',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
