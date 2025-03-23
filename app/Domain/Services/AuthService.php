<?php

namespace App\Domain\Services;

use App\Domain\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use PHPOpenSourceSaver\JWTAuth\Exceptions\JWTException;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use PHPOpenSourceSaver\JWTAuth\JWTGuard;

class AuthService
{
    public function register(array $data): array
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        event(new Registered($user));

        $token = JWTAuth::fromUser($user);

        return [
            'user' => $user,
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => $this->getJWTGuard()->factory()->getTTL() * 60
        ];
    }

    public function login(array $credentials): array
    {
        try {
            if (!$token = $this->getJWTGuard()->attempt($credentials)) {
                throw ValidationException::withMessages([
                    'email' => ['The provided credentials are incorrect.'],
                ]);
            }

            return $this->respondWithToken($token);
        } catch (JWTException $e) {
            throw ValidationException::withMessages([
                'email' => ['Could not create token.'],
            ]);
        }
    }

    public function logout(): void
    {
        $this->getJWTGuard()->logout();
    }

    public function refresh(): array
    {
        return $this->respondWithToken($this->getJWTGuard()->refresh());
    }

    public function me(): User
    {
        return $this->getJWTGuard()->user();
    }

    public function sendPasswordResetLink(string $email): void
    {
        $status = Password::sendResetLink(['email' => $email]);

        if ($status !== Password::RESET_LINK_SENT) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }
    }

    public function resetPassword(array $data): void
    {
        $status = Password::reset($data, function (User $user, string $password) {
            $user->password = Hash::make($password);
            $user->setRememberToken(Str::random(60));
            $user->save();
        });

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }
    }

    public function updatePassword(User $user, string $currentPassword, string $newPassword): void
    {
        if (!Hash::check($currentPassword, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The provided password does not match your current password.'],
            ]);
        }

        $user->password = Hash::make($newPassword);
        $user->save();
    }

    protected function respondWithToken(string $token): array
    {
        return [
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => $this->getJWTGuard()->factory()->getTTL() * 60,
            'user' => $this->getJWTGuard()->user()
        ];
    }

    public function invalidateToken(): void
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
        } catch (JWTException $e) {
            throw ValidationException::withMessages([
                'token' => ['Could not invalidate token.'],
            ]);
        }
    }

    protected function getJWTGuard(): JWTGuard
    {
        return Auth::guard('api');
    }

    public function validateToken(string $token): bool
    {
        try {
            JWTAuth::setToken($token);
            return JWTAuth::check();
        } catch (JWTException $e) {
            return false;
        }
    }
}
