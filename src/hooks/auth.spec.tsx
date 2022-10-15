import { renderHook, act } from "@testing-library/react-hooks";
import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";
import { AuthSessionResult, startAsync } from "expo-auth-session";
import { AuthProvider, useAuth } from "./auth";

jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);

jest.mock("expo-auth-session", () => {
  return {
    startAsync: () => {
      return {
        type: "success",
        params: {
          access_token: "google-token",
        },
      };
    },
  };
});

describe("Auth Hook", () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          id: "userInfo.id",
          email: "userInfo.email",
          name: "userInfo.given_name",
          photo: "userInfo.picture",
          locale: "userInfo.locale",
          verified_email: "userInfo.verified_email",
        }),
    })
  ) as jest.Mock;

  it("Should be able to sign in to Google account existing", async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(() => result.current.signInWithGoogle());

    expect(result.current.user).toBeTruthy();
  });

  it("should not be able to connect if cancel authenticate with Google", async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(() => result.current.signInWithGoogle());

    expect(result.current.user).toHaveProperty("id");
  });
});
