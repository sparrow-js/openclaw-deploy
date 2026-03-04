import { Button } from "@/components/ui/button";
import { signIn } from "auth";
import { FaGithub } from "react-icons/fa";

interface LoginButtonProps {
  className?: string;
}

export default function LoginGithubButton({ className }: LoginButtonProps) {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("github");
      }}
    >
      <Button className={className || "w-full"}>
        <FaGithub className="mr-2 text-[20px]" />
        <p className="text-sm font-medium">Login with GitHub</p>
      </Button>
    </form>
  );
}
