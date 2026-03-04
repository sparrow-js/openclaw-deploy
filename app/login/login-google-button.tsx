import { Button } from "@/components/ui/button";
import { signIn } from "auth";
import { FcGoogle } from "react-icons/fc";

interface LoginButtonProps {
  className?: string;
}

export default function LoginGoogleButton({ className }: LoginButtonProps) {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google");
      }}
    >
      <Button className={className || "w-full"}>
        <FcGoogle className="mr-2 text-[20px]" />
        <p className="text-sm font-medium">Login with Google</p>
      </Button>
    </form>
  );
}
