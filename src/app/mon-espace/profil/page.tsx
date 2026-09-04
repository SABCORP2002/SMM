import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { DashHeading, Panel } from "@/components/dashboard/ui";
import {
  PasswordForm,
  ProfileForm,
} from "@/components/dashboard/profile-forms";

export const metadata: Metadata = { title: "Paramètres" };

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <>
      <DashHeading
        title="Paramètres du compte"
        description="Gère tes informations et ta sécurité."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Informations">
          <ProfileForm
            defaults={{
              name: user.name,
              email: user.email,
              phone: user.phone ?? "",
              whatsapp: user.whatsapp ?? "",
            }}
          />
        </Panel>
        <Panel title="Mot de passe">
          <PasswordForm />
        </Panel>
      </div>
    </>
  );
}
