import { NamedDocumentKey } from './base';

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

export interface TempUser {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  primaryPhoneNumber: PhoneNumber;
}

export interface Device {
  id?: string; // UUID
  type: string;
  name: string;
  model: string;
  deviceId: string;
  car?: NamedDocumentKey;
  owner: NamedDocumentKey;
  status: string;
  group?: NamedDocumentKey;
}

export interface Group {
  id?: string; // UUID
  name: string;
  owner: NamedDocumentKey;
  users: NamedDocumentKey[];
}

export interface Vehicle {
  id?: string; // UUID
  name: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  owner: NamedDocumentKey;
}

export interface Device {}
