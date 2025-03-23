<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Domain\Services\AuthService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\{
    LoginRequest,
    RegisterRequest,
    ChangePasswordRequest
};
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class AuthController extends Controller
{
    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->register($request->validated());

        return response()->json($result, Response::HTTP_CREATED);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login($request->validated());

        return response()->json($result);
    }

    public function logout(): JsonResponse
    {
        $this->authService->logout();

        return response()->json(['message' => 'Successfully logged out']);
    }

    public function refresh(): JsonResponse
    {
        $result = $this->authService->refresh();

        return response()->json($result);
    }

    public function me(): JsonResponse
    {
        $user = $this->authService->me();

        return response()->json($user);
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $this->authService->updatePassword(
            auth()->user(),
            $request->current_password,
            $request->new_password
        );

        return response()->json(['message' => 'Password successfully updated']);
    }
}
