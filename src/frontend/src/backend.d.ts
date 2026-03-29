import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Statistics {
    total: bigint;
    pending: bigint;
    approved: bigint;
    rejected: bigint;
}
export interface LicenseApplication {
    id: bigint;
    nicNumber: string;
    status: Status;
    applicant: Principal;
    documents: Array<Document>;
    dateOfBirth: string;
    fullName: string;
    submittedAt: bigint;
    email: string;
    licenseType: LicenseType;
    address: string;
    phone: string;
    declarationAccepted: boolean;
    remarks?: string;
}
export interface Fee {
    licenseType: LicenseType;
    currency: string;
    amount: bigint;
}
export interface Document {
    documentType: string;
    blobId: ExternalBlob;
}
export interface UserProfile {
    name: string;
}
export enum LicenseType {
    supervisor = "supervisor",
    wireman = "wireman",
    workman = "workman"
}
export enum Status {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllApplications(): Promise<Array<LicenseApplication>>;
    getApplicationStatus(id: bigint): Promise<Status>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDocument(id: bigint, documentType: string): Promise<ExternalBlob>;
    getFees(): Promise<Array<Fee>>;
    getFullApplication(id: bigint): Promise<LicenseApplication>;
    getStatistics(): Promise<Array<[LicenseType, Statistics]>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitApplication(input: LicenseApplication): Promise<bigint>;
    setupAdminWithPassword(password: string): Promise<boolean>;
    updateApplicationStatus(id: bigint, status: Status, remarks: string | null): Promise<void>;
}
