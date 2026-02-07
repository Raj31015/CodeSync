import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return <div className="flex items-center justify-center">
    <div className="flex flex-col justify-center">
        <SignIn />
      <p>To demo app use</p>
      <p>email: demouser@example.com</p>
      <p>password:demouser</p>
    </div>
  
  </div>
}
