import { Button } from "@/components/ui/button";
import { signIn } from "auth";
import { SiNotion } from "react-icons/si";

interface LoginButtonProps {
  className?: string;
}

export default function LoginNotionButton({ className }: LoginButtonProps) {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("notion");
      }}
    >
      <Button className={className || "w-full"}>
        <SiNotion className="mr-2 text-[20px]" />
        <p className="text-sm font-medium">Login with Notion</p>
      </Button>
    </form>
  );
}
