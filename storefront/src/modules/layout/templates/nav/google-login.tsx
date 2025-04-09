'use client'
import React from 'react'

interface GoogleLoginButtonProps {
  medusa_url: string;
  authPath: string;
}

export default function GoogleLoginButton({ medusa_url, authPath }: GoogleLoginButtonProps) {
  const handleGoogleLogin = async () => {
    try {
      const res = await fetch(`${medusa_url}/${authPath}`, {
        method: 'GET',
        headers: {
          ...(process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY && {
            'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY
          })
        }
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Error:", error);
        return;
      }

      // Si la respuesta es correcta (redirección), redirige al usuario:
      window.location.href = res.url;

    } catch (error) {
      console.error("Error:", error);
    }
  }

  return (
    <button
      className="hover:text-ui-fg-base"
      onClick={handleGoogleLogin}
      data-testid="nav-account-link"
    >
      Google Login
    </button>
  );
}
