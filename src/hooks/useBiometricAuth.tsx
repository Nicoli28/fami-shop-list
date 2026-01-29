import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const BIOMETRIC_KEY = 'biometric_credential';
const BIOMETRIC_USER_KEY = 'biometric_user_email';

export const useBiometricAuth = () => {
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isBiometricRegistered, setIsBiometricRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if WebAuthn is available
    const checkBiometricAvailability = async () => {
      if (window.PublicKeyCredential) {
        try {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setIsBiometricAvailable(available);
        } catch {
          setIsBiometricAvailable(false);
        }
      }
    };

    // Check if biometric is already registered
    const savedCredential = localStorage.getItem(BIOMETRIC_KEY);
    setIsBiometricRegistered(!!savedCredential);

    checkBiometricAvailability();
  }, []);

  const registerBiometric = useCallback(async (email: string, password: string) => {
    if (!isBiometricAvailable) {
      toast.error('Biometria não disponível neste dispositivo');
      return false;
    }

    setIsLoading(true);

    try {
      // Create a simple challenge
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const userId = new Uint8Array(16);
      crypto.getRandomValues(userId);

      const createCredentialOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: 'Calculadora de Compras',
          id: window.location.hostname,
        },
        user: {
          id: userId,
          name: email,
          displayName: email.split('@')[0],
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },   // ES256
          { alg: -257, type: 'public-key' }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred',
        },
        timeout: 60000,
        attestation: 'none',
      };

      const credential = await navigator.credentials.create({
        publicKey: createCredentialOptions,
      }) as PublicKeyCredential;

      if (credential) {
        // Store credential ID and encrypted user info
        const credentialData = {
          id: Array.from(new Uint8Array(credential.rawId)),
          email,
          // Note: In production, encrypt the password properly
          password: btoa(password),
        };
        
        localStorage.setItem(BIOMETRIC_KEY, JSON.stringify(credentialData));
        localStorage.setItem(BIOMETRIC_USER_KEY, email);
        setIsBiometricRegistered(true);
        
        toast.success('Biometria configurada com sucesso!');
        return true;
      }
    } catch (error: any) {
      console.error('Biometric registration error:', error);
      if (error.name === 'NotAllowedError') {
        toast.error('Autenticação cancelada pelo usuário');
      } else {
        toast.error('Erro ao configurar biometria');
      }
    } finally {
      setIsLoading(false);
    }
    
    return false;
  }, [isBiometricAvailable]);

  const authenticateWithBiometric = useCallback(async (): Promise<{ success: boolean; error?: any }> => {
    const savedData = localStorage.getItem(BIOMETRIC_KEY);
    
    if (!savedData) {
      return { success: false, error: 'Biometria não configurada' };
    }

    setIsLoading(true);

    try {
      const credentialData = JSON.parse(savedData);
      const credentialId = new Uint8Array(credentialData.id);

      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const getCredentialOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        rpId: window.location.hostname,
        allowCredentials: [
          {
            id: credentialId,
            type: 'public-key',
            transports: ['internal'],
          },
        ],
        userVerification: 'required',
        timeout: 60000,
      };

      const assertion = await navigator.credentials.get({
        publicKey: getCredentialOptions,
      });

      if (assertion) {
        // Biometric verified, now sign in with stored credentials
        const email = credentialData.email;
        const password = atob(credentialData.password);

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          return { success: false, error };
        }

        return { success: true };
      }
    } catch (error: any) {
      console.error('Biometric auth error:', error);
      if (error.name === 'NotAllowedError') {
        return { success: false, error: 'Autenticação cancelada' };
      }
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }

    return { success: false, error: 'Falha na autenticação' };
  }, []);

  const removeBiometric = useCallback(() => {
    localStorage.removeItem(BIOMETRIC_KEY);
    localStorage.removeItem(BIOMETRIC_USER_KEY);
    setIsBiometricRegistered(false);
    toast.success('Biometria removida');
  }, []);

  const getBiometricUserEmail = useCallback(() => {
    return localStorage.getItem(BIOMETRIC_USER_KEY);
  }, []);

  return {
    isBiometricAvailable,
    isBiometricRegistered,
    isLoading,
    registerBiometric,
    authenticateWithBiometric,
    removeBiometric,
    getBiometricUserEmail,
  };
};
