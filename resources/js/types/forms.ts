export type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

export type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export type ForgotPasswordForm = {
    email: string;
};

export type ResetPasswordForm = {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export type ConfirmPasswordForm = {
    password: string;
};

export type TwoFactorChallengeForm = {
    code: string;
};

export type TwoFactorRecoveryForm = {
    recovery_code: string;
};

export type ProfileForm = {
    name: string;
    email: string;
};

export type UpdatePasswordForm = {
    current_password: string;
    password: string;
    password_confirmation: string;
};

export type DeleteUserForm = {
    password: string;
};

export type ConfirmTwoFactorForm = {
    code: string;
};

export type EmptyForm = Record<string, never>;
