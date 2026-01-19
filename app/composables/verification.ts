export function useVerification() {
  const cPhoneNumber = useCookie("nifa-phoneNumber");
  const isVerifiedBool = useCookie("nifa-isVerified");
  const nifaAdmin = useCookie("nifa-admin");

  return {
    cPhoneNumber,
    nifaAdmin,
    isVerified: () => isVerifiedBool.value,
    setVerified: (value: boolean) => {
      isVerifiedBool.value = String(value);
    },
    logout: () => {
      cPhoneNumber.value = null;
      isVerifiedBool.value = null;
      nifaAdmin.value = null;
    },
  };
}
