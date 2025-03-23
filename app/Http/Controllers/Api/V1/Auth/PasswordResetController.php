<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Domain\Services\AuthService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\{
    ForgotPasswordRequest,
    ResetPasswordRequest
};
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class PasswordResetController extends Controller
{
    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function sendResetLink(ForgotPasswordRequest $request): JsonResponse
    {
        $this->authService->sendPasswordResetLink($request->email);

        return response()->json([
            'message' => 'Password reset link sent to your email'
        ]);
    }

    public function reset(ResetPasswordRequest $request): JsonResponse
    {
        $this->authService->resetPassword($request->validated());

        return response()->json([
            'message' => 'Password has been successfully reset'
        ]);
    }
}
