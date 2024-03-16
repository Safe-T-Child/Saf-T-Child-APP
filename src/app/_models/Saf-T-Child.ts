enum UserType {
  Owner = 'owner',
  Secondary = 'secondary',
}

interface PhoneNumber {
  countryCode: number; // Must contain only numbers
  phoneNumberValue: number; // Must contain only numbers
}

export interface User {
  id?: string; // UUID
  password?: string;
  username?: string; // Required for owners, optional for secondary users
  firstName: string; // Required for all users
  lastName: string; // Required for all users
  email: string; // Array of strings, each a valid email
  primaryPhoneNumber: PhoneNumber; // Required for all users
  secondaryPhoneNumbers: PhoneNumber[]; // Optional for all users
  isEmailVerified: boolean; // Required for all users
}
