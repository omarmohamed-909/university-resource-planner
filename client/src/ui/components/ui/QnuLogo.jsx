export default function QnuLogo({ className = "w-10 h-10", ...props }) {
  return (
    <img
      src="/qnu-logo.png"
      alt="QNU Logo"
      className={`${className} object-contain`}
      draggable="false"
      {...props}
    />
  )
}
