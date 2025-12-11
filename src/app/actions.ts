"use server";

import { encodedRedirect } from "@/utils/utils";
import { redirect } from "next/navigation";
import { createClient } from "../../supabase/server";

export const signUpAction = async (formData: FormData) => {
  try {
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const fullName = formData.get("full_name")?.toString() || '';
    const supabase = await createClient();

  if (!email || !password) {
    encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
    return;
  }

  const { data: { user }, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        email: email,
      }
    },
  });

  if (error) {
    encodedRedirect("error", "/sign-up", error.message);
    return;
  }

  if (user) {
    try {

      const { error: updateError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          user_id: user.id,
          name: fullName,
          email: email,
          token_identifier: user.id,
          created_at: new Date().toISOString()
        });

      if (updateError) {
        // Error handling without console.error
        encodedRedirect(
          "error",
          "/sign-up",
          "Error updating user. Please try again.",
        );
        return;
      }
    } catch (err: any) {
      // Check if this is a redirect error - if so, re-throw it
      if (err?.digest === 'NEXT_REDIRECT') {
        throw err;
      }
      // Error handling without console.error
      encodedRedirect(
        "error",
        "/sign-up",
        "Error updating user. Please try again.",
      );
      return;
    }
  }

    encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link.",
    );
  } catch (error: any) {
    // Check if this is a redirect error - if so, re-throw it
    if (error?.digest === 'NEXT_REDIRECT') {
      throw error;
    }
    encodedRedirect(
      "error",
      "/sign-up",
      error instanceof Error ? error.message : "An error occurred during sign up"
    );
  }
};

export const signInAction = async (formData: FormData) => {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      encodedRedirect("error", "/sign-in", error.message);
      return;
    }

    redirect("/dashboard");
  } catch (error: any) {
    // Check if this is a redirect error - if so, re-throw it
    if (error?.digest === 'NEXT_REDIRECT') {
      throw error;
    }
    encodedRedirect(
      "error",
      "/sign-in",
      error instanceof Error ? error.message : "An error occurred during sign in"
    );
  }
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {});

  if (error) {
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export const checkUserSubscription = async (userId: string) => {
  const supabase = await createClient();

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (error || !subscription) {
    return false;
  }

  // For one-time payments, check if within 24 hours of purchase
  if (subscription.interval === 'one_time' || subscription.interval === 'day') {
    const purchaseTime = subscription.started_at 
      ? new Date(subscription.started_at * 1000) 
      : new Date(subscription.created_at);
    const now = new Date();
    const hoursSincePurchase = (now.getTime() - purchaseTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursSincePurchase > 24) {
      // Update status to expired
      await supabase
        .from('subscriptions')
        .update({ status: 'expired' })
        .eq('id', subscription.id);
      return false;
    }
  }

  return true;
};
