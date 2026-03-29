import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LicenseApplication } from "../backend";
import { LicenseType, type Status } from "../backend";
import { useActor } from "./useActor";

export function useGetFees() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["fees"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFees();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllApplications() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllApplications();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetFullApplication(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["application", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) throw new Error("No actor or id");
      return actor.getFullApplication(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useGetStatistics() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["statistics"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStatistics();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitApplication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: LicenseApplication) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitApplication(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
}

export function useUpdateApplicationStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      remarks,
    }: { id: bigint; status: Status; remarks: string | null }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateApplicationStatus(id, status, remarks);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({
        queryKey: ["application", variables.id.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
}

export function formatRefNumber(id: bigint): string {
  return `ELP-${id}`;
}

export function formatDate(nanoseconds: bigint): string {
  const ms = Number(nanoseconds) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const FALLBACK_FEES: Record<
  LicenseType,
  { amount: number; currency: string }
> = {
  [LicenseType.wireman]: { amount: 300, currency: "INR" },
  [LicenseType.workman]: { amount: 300, currency: "INR" },
  [LicenseType.supervisor]: { amount: 500, currency: "INR" },
};
