import {
  Anchor,
  Button,
  Divider,
  Group,
  Modal,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAccountStore } from "../../../state/accountStore.ts";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

const GoogleMark = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
    <path
      fill="#4285F4"
      d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
    />
    <path
      fill="#34A853"
      d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
    />
    <path
      fill="#FBBC05"
      d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"
    />
    <path
      fill="#EA4335"
      d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
    />
  </svg>
);

export const AuthModal = () => {
  const { t } = useTranslation("auth");
  const open = useAccountStore((state) => state.authModalOpen);
  const mode = useAccountStore((state) => state.authMode);
  const busy = useAccountStore((state) => state.busy);
  const error = useAccountStore((state) => state.error);
  const resetSent = useAccountStore((state) => state.resetSent);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);

  const clearStaleError = () => {
    if (error) useAccountStore.getState().clearError();
  };

  const emailValid = EMAIL_PATTERN.test(email.trim());
  const passwordValid = password.length >= MIN_PASSWORD;
  const showEmailError = touched && !emailValid;
  const showPasswordError = touched && !passwordValid;

  const close = () => {
    if (busy) return;
    useAccountStore.getState().closeAuthModal();
  };

  const submit = () => {
    setTouched(true);
    if (!emailValid || !passwordValid) return;
    const store = useAccountStore.getState();
    if (mode === "save") void store.linkEmail(email.trim(), password);
    else void store.signInEmail(email.trim(), password);
  };

  const onGoogle = () => {
    const store = useAccountStore.getState();
    if (mode === "save") void store.linkGoogle();
    else void store.signInGoogle();
  };

  const forgot = () => {
    setTouched(true);
    if (!emailValid) return;
    void useAccountStore.getState().sendReset(email.trim());
  };

  const switchMode = () => {
    setTouched(false);
    useAccountStore.getState().setAuthMode(mode === "save" ? "signin" : "save");
  };

  return (
    <Modal
      opened={open}
      onClose={close}
      title={
        <Text ff="var(--sw-font-hand)" fz={26} fw={600} c="var(--sw-ink)">
          {t(mode === "save" ? "title.save" : "title.signin")}
        </Text>
      }
      centered
      radius="lg"
      closeOnClickOutside={!busy}
      closeOnEscape={!busy}
      styles={{ content: { backgroundColor: "var(--sw-paper)" } }}
    >
      <Stack gap="md">
        <Text fz="sm" c="var(--sw-ink-2)">
          {t(mode === "save" ? "subtitle.save" : "subtitle.signin")}
        </Text>

        <Button
          variant="default"
          fullWidth
          leftSection={<GoogleMark />}
          loading={busy}
          onClick={onGoogle}
        >
          {t(mode === "save" ? "google.save" : "google.signin")}
        </Button>

        <Divider label={t("or")} labelPosition="center" color="var(--sw-line)" />

        <TextInput
          type="email"
          label={t("emailLabel")}
          placeholder={t("emailPlaceholder")}
          value={email}
          onChange={(event) => {
            setEmail(event.currentTarget.value);
            clearStaleError();
          }}
          error={showEmailError ? t("validation.email") : null}
          disabled={busy}
          autoComplete="email"
        />
        <PasswordInput
          label={t("passwordLabel")}
          value={password}
          onChange={(event) => {
            setPassword(event.currentTarget.value);
            clearStaleError();
          }}
          error={showPasswordError ? t("validation.password") : null}
          disabled={busy}
          autoComplete={mode === "save" ? "new-password" : "current-password"}
          onKeyDown={(event) => {
            if (event.key === "Enter") submit();
          }}
        />

        {mode === "signin" && (
          <Group justify="space-between">
            <Anchor
              component="button"
              type="button"
              fz="sm"
              c="var(--sw-ink-2)"
              onClick={forgot}
            >
              {t("forgotPassword")}
            </Anchor>
            {resetSent && (
              <Text fz="sm" c="var(--sw-accent)">
                {t("resetSent")}
              </Text>
            )}
          </Group>
        )}

        {error && (
          <Text fz="sm" c="var(--sw-danger)">
            {t(`errors.${error}`)}
          </Text>
        )}

        <Button
          fullWidth
          loading={busy}
          onClick={submit}
          color="var(--sw-accent)"
        >
          {t(mode === "save" ? "submit.save" : "submit.signin")}
        </Button>

        <Group justify="center" gap={6}>
          <Text fz="sm" c="var(--sw-ink-3)">
            {t(mode === "save" ? "switchPrompt.save" : "switchPrompt.signin")}
          </Text>
          <Anchor
            component="button"
            type="button"
            fz="sm"
            fw={600}
            c="var(--sw-accent)"
            onClick={switchMode}
          >
            {t(mode === "save" ? "switchAction.save" : "switchAction.signin")}
          </Anchor>
        </Group>
      </Stack>
    </Modal>
  );
};
