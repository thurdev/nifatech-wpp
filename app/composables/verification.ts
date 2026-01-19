export function useVerification() {
  const cPhoneNumber = useCookie("nifa-phoneNumber");
  const isVerifiedBool = useCookie("nifa-isVerified");

  return {
    cPhoneNumber,
    isVerified: () => isVerifiedBool.value,
    setVerified: (value: boolean) => {
      isVerifiedBool.value = String(value);
    },
  };
}
