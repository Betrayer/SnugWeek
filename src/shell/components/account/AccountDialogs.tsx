import { AuthModal } from "./AuthModal.tsx";
import { MergeDialog } from "./MergeDialog.tsx";
import { MergeProgressModal } from "./MergeProgressModal.tsx";
import { SignOutDialog } from "./SignOutDialog.tsx";

export const AccountDialogs = () => (
  <>
    <AuthModal />
    <MergeDialog />
    <MergeProgressModal />
    <SignOutDialog />
  </>
);
