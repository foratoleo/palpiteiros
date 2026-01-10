import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/user.service";
import { useUserStore } from "@/stores/useUserStore";
import { User } from "@/types";

export function useCurrentUser() {
  const { setUser, setLoading } = useUserStore();

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const authUser = await userService.getCurrentUser();
      if (!authUser) return null;

      // Get the full user profile from our database
      const userProfile = await userService.getUserProfile(authUser.id);
      setUser(userProfile as User);
      return userProfile;
    },
    staleTime: Infinity,
    retry: false,
  });
}

export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      userService.signIn(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}

export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      userService.signUp(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  const { logout } = useUserStore();

  return useMutation({
    mutationFn: () => userService.signOut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      logout();
    },
  });
}
