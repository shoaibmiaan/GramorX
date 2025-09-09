// emails/SignupEmail.tsx
import * as React from "react";
import { Button } from "@/components/design-system/Button";
import { GradientText } from "@/components/design-system/GradientText";

type Props = { name?: string; verifyUrl: string };

export const SignupEmail: React.FC<Props> = ({ name = "there", verifyUrl }) => (
  <div className="bg-lightBg text-lightText dark:bg-dark dark:text-white p-8 rounded-ds-2xl font-poppins">
    <div className="mb-6">
      <h1 className="font-slab text-h2 text-gradient-primary">Welcome to IELTS MasterPortal 🎉</h1>
      <p className="mt-2 text-body">
        Hi {name}, thanks for signing up!  
        To activate your account and start preparing for IELTS, please confirm your email.
      </p>
    </div>

    <div className="my-6 text-center">
      <Button
        as="a"
        href={verifyUrl}
        variant="primary"
        className="rounded-ds-xl px-8 py-4 text-lg"
      >
        Verify my email
      </Button>
    </div>

    <p className="text-small text-mutedText mt-8">
      If you didn’t create this account, you can safely ignore this email.  
      Need help? <a href="/support" className="underline">Contact our support team</a>.
    </p>

    <div className="mt-10 text-center text-small text-grayish">
      © {new Date().getFullYear()} IELTS MasterPortal — All rights reserved.
    </div>
  </div>
);
